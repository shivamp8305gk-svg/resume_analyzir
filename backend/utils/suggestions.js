/**
 * Suggestion engine — generates actionable resume improvement tips
 */

function generateSuggestions(sections, detectedSkills, missingSkills, score, keywordMatchPercent, resumeText) {
  const suggestions = [];
  const wordCount = resumeText.split(/\s+/).filter(Boolean).length;

  // --- Structure suggestions ---
  if (!sections.hasContact) {
    suggestions.push({
      type: 'error',
      category: 'Structure',
      message: 'Missing contact information. Add your email, phone number, and location at the top of your resume.',
    });
  }
  if (!sections.hasSummary) {
    suggestions.push({
      type: 'warning',
      category: 'Structure',
      message: 'Add a professional summary (2-3 sentences) at the top highlighting your key strengths and career goals.',
    });
  }
  if (!sections.hasExperience) {
    suggestions.push({
      type: 'warning',
      category: 'Structure',
      message: 'No work experience section detected. Add internships, freelance work, or relevant projects if you lack full-time experience.',
    });
  }
  if (!sections.hasEducation) {
    suggestions.push({
      type: 'warning',
      category: 'Structure',
      message: 'Add your educational background including degree, institution, and graduation year.',
    });
  }
  if (!sections.hasSkills) {
    suggestions.push({
      type: 'error',
      category: 'Skills',
      message: 'No skills section found. Add a dedicated skills section listing your technical and soft skills.',
    });
  }
  if (!sections.hasProjects) {
    suggestions.push({
      type: 'tip',
      category: 'Content',
      message: 'Consider adding a Projects section to showcase real-world applications of your skills.',
    });
  }
  if (!sections.hasCertifications) {
    suggestions.push({
      type: 'tip',
      category: 'Content',
      message: 'Add relevant certifications (AWS, Google, Coursera, etc.) to boost credibility.',
    });
  }

  // --- Keyword match suggestions ---
  if (keywordMatchPercent < 30) {
    suggestions.push({
      type: 'error',
      category: 'Keywords',
      message: `Low keyword match (${keywordMatchPercent}%). Carefully read the job description and integrate more relevant keywords naturally into your resume.`,
    });
  } else if (keywordMatchPercent < 60) {
    suggestions.push({
      type: 'warning',
      category: 'Keywords',
      message: `Keyword match is ${keywordMatchPercent}%. Improve by mirroring the exact terminology used in the job description.`,
    });
  }

  // --- Missing skills suggestions ---
  const highPriorityMissing = missingSkills.filter(s => s.priority === 'high').slice(0, 5);
  if (highPriorityMissing.length > 0) {
    suggestions.push({
      type: 'warning',
      category: 'Skills',
      message: `Add these high-priority skills from the job description: ${highPriorityMissing.map(s => s.name).join(', ')}.`,
    });
  }

  // --- Length suggestions ---
  if (wordCount < 200) {
    suggestions.push({
      type: 'error',
      category: 'Content',
      message: 'Your resume is too short. Aim for 400-800 words (1 full page) with detailed descriptions of your experience.',
    });
  } else if (wordCount > 1500) {
    suggestions.push({
      type: 'warning',
      category: 'Content',
      message: 'Your resume is too long. Keep it to 1-2 pages for best ATS performance. Remove outdated or irrelevant content.',
    });
  }

  // --- Action verb suggestions ---
  const actionVerbs = ['led', 'built', 'developed', 'designed', 'implemented', 'created', 'managed',
    'improved', 'optimized', 'achieved', 'delivered', 'launched', 'increased', 'reduced', 'automated'];
  const hasActionVerbs = actionVerbs.some(v => resumeText.toLowerCase().includes(v));
  if (!hasActionVerbs) {
    suggestions.push({
      type: 'tip',
      category: 'Language',
      message: 'Use strong action verbs to start bullet points (e.g., "Built", "Developed", "Led", "Optimized", "Delivered").',
    });
  }

  // --- Score-based suggestions ---
  if (score < 40) {
    suggestions.push({
      type: 'error',
      category: 'Overall',
      message: 'Your resume needs significant improvement. Focus on adding missing sections, relevant skills, and job-specific keywords.',
    });
  } else if (score < 65) {
    suggestions.push({
      type: 'warning',
      category: 'Overall',
      message: 'Your resume is average. Strengthen it by tailoring content to the job description and quantifying achievements.',
    });
  } else if (score >= 80) {
    suggestions.push({
      type: 'success',
      category: 'Overall',
      message: 'Great resume! Make sure to quantify achievements (e.g., "Increased performance by 40%") for maximum impact.',
    });
  }

  // --- Quantification tip ---
  const hasNumbers = /\d+%|\d+x|\$\d+|\d+ (users|clients|projects|team|members|million|thousand)/i.test(resumeText);
  if (!hasNumbers) {
    suggestions.push({
      type: 'tip',
      category: 'Impact',
      message: 'Quantify your achievements with numbers and metrics (e.g., "Reduced load time by 30%", "Managed team of 5 engineers").',
    });
  }

  return suggestions;
}

module.exports = { generateSuggestions };
