/**
 * Resume scoring engine — pure JS, no external dependencies
 */

const STOP_WORDS = new Set([
  'the', 'a', 'an', 'in', 'on', 'at', 'is', 'are', 'was', 'were', 'be', 'been',
  'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
  'should', 'may', 'might', 'must', 'can', 'to', 'of', 'for', 'with', 'by',
  'from', 'up', 'about', 'into', 'through', 'during', 'we', 'you', 'they',
  'our', 'your', 'their', 'this', 'that', 'these', 'those', 'and', 'or', 'but',
  'if', 'as', 'it', 'its', 'not', 'also', 'other', 'than', 'then', 'when',
  'who', 'which', 'what', 'how', 'where', 'any', 'all', 'both', 'each', 'few',
  'more', 'most', 'same', 'such', 'no', 'nor', 'so', 'yet', 'just', 'work',
  'role', 'candidate', 'ability', 'strong', 'good', 'great', 'excellent', 'well',
]);

/**
 * Simple Porter-inspired stemmer (lightweight, no deps)
 */
function stem(word) {
  // Very basic suffix stripping
  if (word.endsWith('ing')) return word.slice(0, -3);
  if (word.endsWith('tion')) return word.slice(0, -4);
  if (word.endsWith('ed')) return word.slice(0, -2);
  if (word.endsWith('er')) return word.slice(0, -2);
  if (word.endsWith('ly')) return word.slice(0, -2);
  if (word.endsWith('ment')) return word.slice(0, -4);
  if (word.endsWith('ness')) return word.slice(0, -4);
  if (word.endsWith('ful')) return word.slice(0, -3);
  if (word.endsWith('able')) return word.slice(0, -4);
  if (word.endsWith('ible')) return word.slice(0, -4);
  if (word.endsWith('s') && word.length > 3) return word.slice(0, -1);
  return word;
}

function tokenize(text) {
  return (text.toLowerCase().match(/[a-z]+/g) || []).filter(
    (t) => t.length > 2 && !STOP_WORDS.has(t)
  );
}

function calculateKeywordMatch(resumeText, jdText) {
  if (!jdText || jdText.trim().length < 20) return { percent: 0, matched: [], missing: [] };

  const extractKeywords = (text) => tokenize(text).map(stem);

  const resumeKeywords = new Set(extractKeywords(resumeText));
  const jdKeywords = extractKeywords(jdText);

  const jdKeywordFreq = {};
  jdKeywords.forEach((kw) => { jdKeywordFreq[kw] = (jdKeywordFreq[kw] || 0) + 1; });

  const importantJdKeywords = Object.keys(jdKeywordFreq);

  const matched = importantJdKeywords.filter((kw) => resumeKeywords.has(kw));
  const missing = importantJdKeywords.filter((kw) => !resumeKeywords.has(kw));

  const percent =
    importantJdKeywords.length > 0
      ? Math.round((matched.length / importantJdKeywords.length) * 100)
      : 0;

  return { percent: Math.min(percent, 100), matched, missing };
}

function scoreResume(resumeText, jdText, detectedSkills, sections) {
  const breakdown = {
    keywordMatch: 0, // max 40 pts
    skillsScore: 0,  // max 30 pts
    structureScore: 0, // max 20 pts
    lengthScore: 0,  // max 10 pts
  };

  // 1. Keyword Match (40 pts)
  const kwMatch = calculateKeywordMatch(resumeText, jdText);
  breakdown.keywordMatch = Math.round((kwMatch.percent / 100) * 40);

  // 2. Skills Score (30 pts)
  const skillCount = detectedSkills.length;
  if (skillCount >= 20) breakdown.skillsScore = 30;
  else if (skillCount >= 15) breakdown.skillsScore = 25;
  else if (skillCount >= 10) breakdown.skillsScore = 20;
  else if (skillCount >= 6) breakdown.skillsScore = 15;
  else if (skillCount >= 3) breakdown.skillsScore = 10;
  else breakdown.skillsScore = Math.round(skillCount * 2);

  // 3. Structure Score (20 pts)
  const sectionChecks = [
    sections.hasContact,
    sections.hasEducation,
    sections.hasExperience,
    sections.hasSkills,
    sections.hasSummary,
    sections.hasProjects,
    sections.hasCertifications,
  ];
  const sectionScore = sectionChecks.filter(Boolean).length;
  breakdown.structureScore = Math.round((sectionScore / sectionChecks.length) * 20);

  // 4. Length/Content Score (10 pts)
  const wordCount = resumeText.split(/\s+/).filter(Boolean).length;
  if (wordCount >= 400 && wordCount <= 1200) breakdown.lengthScore = 10;
  else if (wordCount >= 250 && wordCount < 400) breakdown.lengthScore = 7;
  else if (wordCount > 1200 && wordCount <= 1800) breakdown.lengthScore = 8;
  else if (wordCount >= 100) breakdown.lengthScore = 4;
  else breakdown.lengthScore = 1;

  const total =
    breakdown.keywordMatch +
    breakdown.skillsScore +
    breakdown.structureScore +
    breakdown.lengthScore;

  return {
    score: Math.min(total, 100),
    breakdown,
    keywordMatchPercent: kwMatch.percent,
  };
}

module.exports = { scoreResume, calculateKeywordMatch };
