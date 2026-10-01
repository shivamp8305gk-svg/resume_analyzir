/**
 * Section detector — pure JS regex, no external deps
 */
function detectSections(text) {
  const lower = text.toLowerCase();
  return {
    hasContact:
      /(\bemail\b|\bphone\b|\bmobile\b|\bcontact\b|@[a-z]+\.[a-z]+|\+\d{10,})/i.test(lower),
    hasEducation:
      /\b(education|university|college|degree|bachelor|master|phd|b\.tech|m\.tech|b\.sc|m\.sc|bca|mca|diploma)\b/i.test(lower),
    hasExperience:
      /\b(experience|work history|employment|worked at|position|job|role|intern|internship)\b/i.test(lower),
    hasSkills:
      /\b(skills|technologies|tech stack|expertise|competencies|proficiencies)\b/i.test(lower),
    hasSummary:
      /\b(summary|objective|profile|about me|overview|professional summary)\b/i.test(lower),
    hasProjects:
      /\b(projects|portfolio|work samples|personal projects|side projects)\b/i.test(lower),
    hasCertifications:
      /\b(certification|certificate|certified|credential|license|course)\b/i.test(lower),
  };
}

module.exports = { detectSections };
