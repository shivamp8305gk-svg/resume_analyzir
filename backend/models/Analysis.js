const mongoose = require('mongoose');

const analysisSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  sessionId: { type: String, default: '' },
  fileName: { type: String, required: true },
  fileType: { type: String, enum: ['pdf', 'docx'], required: true },
  extractedText: { type: String, required: true },
  jobDescription: { type: String, default: '' },
  jobTitle: { type: String, default: '' },
  score: { type: Number, default: 0 },
  scoreBreakdown: {
    keywordMatch: { type: Number, default: 0 },
    skillsScore: { type: Number, default: 0 },
    structureScore: { type: Number, default: 0 },
    lengthScore: { type: Number, default: 0 },
  },
  keywordMatchPercent: { type: Number, default: 0 },
  detectedSkills: [{ name: String, category: String }],
  missingSkills: [{ name: String, category: String, priority: String }],
  suggestions: [{ type: String, severity: String, category: String }],
  sections: {
    hasContact: Boolean,
    hasEducation: Boolean,
    hasExperience: Boolean,
    hasSkills: Boolean,
    hasSummary: Boolean,
    hasProjects: Boolean,
    hasCertifications: Boolean,
  },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Analysis', analysisSchema);
