const express = require('express');
const router = express.Router();
const Resume = require('../models/Resume');
const { optionalAuth } = require('../middleware/authMiddleware');
const { v4: uuidv4 } = require('uuid');
const { isConnected } = require('../config/db');

// @route POST /api/builder/save
router.post('/save', optionalAuth, async (req, res) => {
  try {
    const resumeData = req.body;
    if (!resumeData.personalInfo || !resumeData.personalInfo.fullName) {
      return res.status(400).json({ success: false, message: 'Full name is required' });
    }

    if (!isConnected()) {
      return res.status(200).json({ success: true, resumeId: null, message: 'Resume data received (DB not connected — connect MongoDB to persist)' });
    }

    const resume = await Resume.create({
      ...resumeData,
      userId: req.user ? req.user._id : null,
      sessionId: uuidv4(),
    });

    res.status(201).json({ success: true, resumeId: resume._id, message: 'Resume saved successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route GET /api/builder/:id
router.get('/:id', async (req, res) => {
  try {
    const resume = await Resume.findById(req.params.id);
    if (!resume) return res.status(404).json({ success: false, message: 'Resume not found' });
    res.json({ success: true, resume });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route PUT /api/builder/:id
router.put('/:id', optionalAuth, async (req, res) => {
  try {
    const resume = await Resume.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: new Date() },
      { new: true }
    );
    if (!resume) return res.status(404).json({ success: false, message: 'Resume not found' });
    res.json({ success: true, resume });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
