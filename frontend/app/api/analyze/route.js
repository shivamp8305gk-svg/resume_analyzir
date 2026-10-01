import { NextResponse } from 'next/server';
import { detectSkills, detectMissingSkills } from '@/lib/skills';
import { scoreResume } from '@/lib/scorer';
import { generateSuggestions } from '@/lib/suggestions';
import { detectSections } from '@/lib/sections';

export const runtime = 'nodejs';
// Allow up to 10MB uploads
export const maxDuration = 60;

/**
 * POST /api/analyze
 * Accepts multipart/form-data with:
 *   - resume: File (PDF | DOCX | TXT)
 *   - jobDescription: string (optional)
 *   - jobTitle: string (optional)
 */
export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('resume');
    const jobDescription = formData.get('jobDescription') || '';
    const jobTitle = formData.get('jobTitle') || '';

    if (!file || typeof file === 'string') {
      return NextResponse.json({ success: false, message: 'No file uploaded' }, { status: 400 });
    }

    const fileName = file.name || 'resume';
    const ext = fileName.split('.').pop().toLowerCase();

    // Read file as buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    let extractedText = '';

    if (ext === 'pdf') {
      // Dynamic import to avoid issues at build time
      const pdfParse = (await import('pdf-parse/lib/pdf-parse.js')).default;
      try {
        const data = await pdfParse(buffer);
        extractedText = (data.text || '').trim();
      } catch (err) {
        return NextResponse.json(
          { success: false, message: 'Failed to parse PDF. Please ensure it is not password-protected.' },
          { status: 400 }
        );
      }
    } else if (ext === 'docx') {
      const mammoth = (await import('mammoth')).default;
      try {
        const result = await mammoth.extractRawText({ buffer });
        extractedText = result.value || '';
      } catch (err) {
        return NextResponse.json(
          { success: false, message: 'Failed to parse DOCX file.' },
          { status: 400 }
        );
      }
    } else if (ext === 'txt') {
      extractedText = buffer.toString('utf-8');
    } else {
      return NextResponse.json(
        { success: false, message: 'Only PDF, DOCX, and TXT files are supported.' },
        { status: 400 }
      );
    }

    if (!extractedText || extractedText.trim().length < 50) {
      return NextResponse.json(
        {
          success: false,
          message:
            'Could not extract readable text from this file. ' +
            'Please ensure the document is not corrupted, password-protected, or blank.',
        },
        { status: 400 }
      );
    }

    // Analysis pipeline
    const sections = detectSections(extractedText);
    const detectedSkills = detectSkills(extractedText);
    const missingSkills = jobDescription ? detectMissingSkills(detectedSkills, jobDescription) : [];
    const { score, breakdown, keywordMatchPercent } = scoreResume(
      extractedText,
      jobDescription,
      detectedSkills,
      sections
    );
    const suggestions = generateSuggestions(
      sections,
      detectedSkills,
      missingSkills,
      score,
      keywordMatchPercent,
      extractedText
    );

    const wordCount = extractedText.split(/\s+/).filter(Boolean).length;

    return NextResponse.json({
      success: true,
      analysisId: null,
      fileName,
      score,
      scoreBreakdown: breakdown,
      keywordMatchPercent,
      detectedSkills,
      missingSkills,
      suggestions,
      sections,
      wordCount,
    });
  } catch (error) {
    console.error('Analysis error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
