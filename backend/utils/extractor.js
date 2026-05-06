/**
 * extractor.js
 *
 * Text extraction pipeline for uploaded resume files.
 *
 * Flow for PDF files:
 *   1. Try pdf-parse (fast, works on text-layer PDFs).
 *   2. If extracted text < MIN_TEXT_CHARS, fall back to full OCR pipeline
 *      (renders each page with pdfjs-dist, pre-processes with Sharp, then
 *       runs Tesseract.js OCR).
 *
 * Flow for DOCX: mammoth.
 * Flow for TXT:  direct read.
 */

const fs = require('fs');
const path = require('path');

/** Minimum character count below which we consider the PDF image-based */
const MIN_TEXT_CHARS = 100;

/* ──────────────────────────────────────────────────────────────────────────────
 * PDF — text layer (fast path)
 * ────────────────────────────────────────────────────────────────────────────── */
async function extractFromPDFTextLayer(filePath) {
  try {
    const pdfParse = require('pdf-parse');
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdfParse(dataBuffer);
    return (data.text || '').trim();
  } catch {
    return '';
  }
}

/* ──────────────────────────────────────────────────────────────────────────────
 * PDF — OCR fallback (image-based / scanned)
 * ────────────────────────────────────────────────────────────────────────────── */
async function extractFromPDFWithOCR(filePath) {
  const { extractWithOCR } = require('./ocr');
  return await extractWithOCR(filePath);
}

/* ──────────────────────────────────────────────────────────────────────────────
 * PDF — smart dispatcher
 * ────────────────────────────────────────────────────────────────────────────── */
async function extractFromPDF(filePath) {
  // Step 1: Try the fast text-layer path
  console.log('📄 PDF: Trying text-layer extraction…');
  const textLayerResult = await extractFromPDFTextLayer(filePath);

  if (textLayerResult.length >= MIN_TEXT_CHARS) {
    console.log(`✅ PDF: Text-layer extraction succeeded (${textLayerResult.length} chars)`);
    return textLayerResult;
  }

  // Step 2: Fall back to OCR
  console.log(
    `⚠️  PDF: Text layer insufficient (${textLayerResult.length} chars < ${MIN_TEXT_CHARS}). ` +
    `Activating OCR pipeline…`
  );
  const ocrResult = await extractFromPDFWithOCR(filePath);
  console.log(`✅ PDF: OCR extraction succeeded (${ocrResult.length} chars)`);
  return ocrResult;
}

/* ──────────────────────────────────────────────────────────────────────────────
 * DOCX
 * ────────────────────────────────────────────────────────────────────────────── */
async function extractFromDOCX(filePath) {
  try {
    const mammoth = require('mammoth');
    const result = await mammoth.extractRawText({ path: filePath });
    return result.value || '';
  } catch (error) {
    throw new Error(`DOCX extraction failed: ${error.message}`);
  }
}

/* ──────────────────────────────────────────────────────────────────────────────
 * Main entry — dispatches by file extension / MIME type
 * ────────────────────────────────────────────────────────────────────────────── */
/**
 * @param {string} filePath   Absolute path to the uploaded file
 * @param {string} mimeType   MIME type reported by multer
 * @returns {Promise<string>} Extracted (and if needed, OCR'd) text
 */
async function extractText(filePath, mimeType) {
  const ext = path.extname(filePath).toLowerCase();

  if (ext === '.pdf' || mimeType === 'application/pdf') {
    return await extractFromPDF(filePath);
  }

  if (
    ext === '.docx' ||
    mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ) {
    return await extractFromDOCX(filePath);
  }

  if (ext === '.txt' || mimeType === 'text/plain') {
    return fs.readFileSync(filePath, 'utf-8');
  }

  throw new Error('Unsupported file format. Please upload a PDF, DOCX, or TXT file.');
}

/* ──────────────────────────────────────────────────────────────────────────────
 * Resume section detector
 * ────────────────────────────────────────────────────────────────────────────── */
function detectSections(text) {
  const lower = text.toLowerCase();
  return {
    hasContact:
      /(\\bemail\\b|\\bphone\\b|\\bmobile\\b|\\bcontact\\b|@[a-z]+\\.[a-z]+|\\+\\d{10,})/i.test(lower),
    hasEducation:
      /\\b(education|university|college|degree|bachelor|master|phd|b\\.tech|m\\.tech|b\\.sc|m\\.sc|bca|mca|diploma)\\b/i.test(lower),
    hasExperience:
      /\\b(experience|work history|employment|worked at|position|job|role|intern|internship)\\b/i.test(lower),
    hasSkills:
      /\\b(skills|technologies|tech stack|expertise|competencies|proficiencies)\\b/i.test(lower),
    hasSummary:
      /\\b(summary|objective|profile|about me|overview|professional summary)\\b/i.test(lower),
    hasProjects:
      /\\b(projects|portfolio|work samples|personal projects|side projects)\\b/i.test(lower),
    hasCertifications:
      /\\b(certification|certificate|certified|credential|license|course)\\b/i.test(lower),
  };
}

module.exports = { extractText, detectSections };
