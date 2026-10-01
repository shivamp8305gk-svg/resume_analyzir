const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const { extractText, detectSections } = require('../utils/extractor');
const { detectSkills, detectMissingSkills } = require('../utils/skills');
const { scoreResume } = require('../utils/scorer');
const { generateSuggestions } = require('../utils/suggestions');
const Analysis = require('../models/Analysis');
const { optionalAuth } = require('../middleware/authMiddleware');
const { isConnected } = require('../config/db');

// Detect serverless environment:
// - NETLIFY=true is set by Netlify at function RUNTIME (reliable)
// - On Windows local dev, /tmp doesn't exist so use local uploads/
const isServerless = process.env.NETLIFY === 'true' || process.env.NETLIFY === '1';

let uploadsDir;
if (isServerless) {
  // Netlify functions: only /tmp is writable
  uploadsDir = '/tmp';
} else {
  // Local development
  uploadsDir = path.join(__dirname, '../uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
}

// Multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const unique = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, unique);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = ['.pdf', '.docx', '.txt'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowed.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF, DOCX, and TXT files are allowed'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

// @route POST /api/analyze
router.post('/', optionalAuth, upload.single('resume'), async (req, res) => {
  let filePath = null;
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    filePath = req.file.path;
    const { jobDescription = '', jobTitle = '' } = req.body;

    // 1. Extract text (auto-falls back to OCR for image-based / scanned PDFs)
    const extractedText = await extractText(filePath, req.file.mimetype);
    if (!extractedText || extractedText.trim().length < 50) {
      return res.status(400).json({
        success: false,
        message:
          'Could not extract readable text from this file even after OCR. ' +
          'Please ensure the document is not corrupted, password-protected, or completely blank.',
      });
    }

    // 2. Detect sections
    const sections = detectSections(extractedText);

    // 3. Detect skills
    const detectedSkills = detectSkills(extractedText);
    const missingSkills = jobDescription ? detectMissingSkills(detectedSkills, jobDescription) : [];

    // 4. Score
    const { score, breakdown, keywordMatchPercent } = scoreResume(
      extractedText,
      jobDescription,
      detectedSkills,
      sections
    );

    // 5. Generate suggestions
    const suggestions = generateSuggestions(sections, detectedSkills, missingSkills, score, keywordMatchPercent, extractedText);

    // 6. Get file type
    const fileType = path.extname(req.file.originalname).toLowerCase().replace('.', '');

    // 7. Save to DB (optional — skipped if MongoDB unavailable)
    let analysisId = null;
    if (isConnected()) {
      try {
        const analysis = await Analysis.create({
          userId: req.user ? req.user._id : null,
          sessionId: uuidv4(),
          fileName: req.file.originalname,
          fileType,
          extractedText,
          jobDescription,
          jobTitle,
          score,
          scoreBreakdown: breakdown,
          keywordMatchPercent,
          detectedSkills,
          missingSkills,
          suggestions: suggestions.map(s => ({ type: s.type, severity: s.type, category: s.category, message: s.message })),
          sections,
        });
        analysisId = analysis._id;
      } catch (dbErr) {
        console.warn('DB save skipped:', dbErr.message);
      }
    }

    // Clean up file
    fs.unlinkSync(filePath);
    filePath = null;

    res.json({
      success: true,
      analysisId,
      fileName: req.file.originalname,
      score,
      scoreBreakdown: breakdown,
      keywordMatchPercent,
      detectedSkills,
      missingSkills,
      suggestions,
      sections,
      wordCount: extractedText.split(/\s+/).filter(Boolean).length,
    });

  } catch (error) {
    if (filePath && fs.existsSync(filePath)) fs.unlinkSync(filePath);
    console.error('Analysis error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route GET /api/analyze/:id
router.get('/:id', async (req, res) => {
  try {
    const analysis = await Analysis.findById(req.params.id);
    if (!analysis) return res.status(404).json({ success: false, message: 'Analysis not found' });
    res.json({ success: true, analysis });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route GET /api/analyze/history (user's past analyses)
router.get('/user/history', optionalAuth, async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: 'Login required' });
    const analyses = await Analysis.find({ userId: req.user._id })
      .select('fileName score keywordMatchPercent jobTitle createdAt')
      .sort({ createdAt: -1 })
      .limit(10);
    res.json({ success: true, analyses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
