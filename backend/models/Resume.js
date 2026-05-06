const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  sessionId: { type: String, default: '' },
  personalInfo: {
    fullName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String },
    location: { type: String },
    linkedin: { type: String },
    github: { type: String },
    website: { type: String },
    jobTitle: { type: String },
  },
  summary: { type: String, default: '' },
  experience: [{
    company: String,
    position: String,
    startDate: String,
    endDate: String,
    current: { type: Boolean, default: false },
    location: String,
    description: [String],
  }],
  education: [{
    institution: String,
    degree: String,
    field: String,
    startDate: String,
    endDate: String,
    gpa: String,
    achievements: [String],
  }],
  skills: {
    technical: [String],
    soft: [String],
    languages: [String],
    tools: [String],
  },
  projects: [{
    name: String,
    description: String,
    techStack: [String],
    link: String,
    github: String,
  }],
  certifications: [{
    name: String,
    issuer: String,
    date: String,
    link: String,
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Resume', resumeSchema);
