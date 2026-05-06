/**
 * ocr.js — OCR pipeline for image-based / scanned PDFs
 *
 * Strategy:
 *   1. Render each PDF page to a PNG buffer using pdfjs-dist + canvas
 *   2. Pre-process each image with Sharp (deskew via rotate, contrast, sharpen)
 *   3. Run Tesseract.js OCR on the processed image
 *   4. Concatenate page results and return clean structured text
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

/* ─── Tesseract.js ─────────────────────────────────────────────────────────── */
const Tesseract = require('tesseract.js');

/* ─── Sharp (image pre-processing) ─────────────────────────────────────────── */
const sharp = require('sharp');

/* ─── pdf.js (render PDF pages to canvas) ───────────────────────────────────── */
// pdfjs-dist needs a canvas factory in Node.js
const { createCanvas } = require('canvas');
const pdfjsLib = require('pdfjs-dist/legacy/build/pdf.js');

// Silence pdfjs worker warning in Node
pdfjsLib.GlobalWorkerOptions.workerSrc = false;

/* ─── Helpers ────────────────────────────────────────────────────────────────── */

/**
 * Node canvas factory required by pdfjs-dist
 */
const NodeCanvasFactory = {
  create(width, height) {
    const canvas = createCanvas(width, height);
    return { canvas, context: canvas.getContext('2d') };
  },
  reset(canvasAndContext, width, height) {
    canvasAndContext.canvas.width = width;
    canvasAndContext.canvas.height = height;
  },
  destroy(canvasAndContext) {
    canvasAndContext.canvas.width = 0;
    canvasAndContext.canvas.height = 0;
  },
};

/**
 * Render a single PDF page to a PNG Buffer at the given scale.
 * Higher scale = better OCR accuracy (2x is a good balance).
 */
async function renderPageToPngBuffer(page, scale = 2.5) {
  const viewport = page.getViewport({ scale });
  const { canvas, context } = NodeCanvasFactory.create(viewport.width, viewport.height);

  await page.render({
    canvasContext: context,
    viewport,
    canvasFactory: NodeCanvasFactory,
  }).promise;

  return canvas.toBuffer('image/png');
}

/**
 * Pre-process an image buffer with Sharp:
 *   - Greyscale
 *   - Sharpen (unsharp mask)
 *   - Increase contrast (normalise)
 *   - Remove noise (median blur)
 *   - Rotate to fix skew (uses Hough-based auto-rotate via Sharp)
 */
async function preprocessImage(pngBuffer) {
  return await sharp(pngBuffer)
    .greyscale()                       // convert to greyscale
    .normalise()                       // auto-contrast / brightness
    .sharpen({ sigma: 1.5, m1: 0.5, m2: 2.5 })  // unsharp mask
    .median(1)                         // light median denoise
    .rotate()                          // auto-detect & correct skew/orientation
    .png({ compressionLevel: 1 })      // fast PNG for Tesseract
    .toBuffer();
}

/**
 * Run Tesseract OCR on a single image buffer.
 * Returns the recognised text string.
 */
async function runOCR(imageBuffer) {
  const { data: { text } } = await Tesseract.recognize(imageBuffer, 'eng', {
    logger: () => {},          // suppress progress logs
    tessedit_pageseg_mode: 3,  // fully automatic page segmentation (default)
    preserve_interword_spaces: '1',
    tessedit_char_whitelist: '',  // allow all characters
  });
  return text || '';
}

/**
 * Post-process raw OCR output to clean up common artifacts and restore structure.
 *
 *  • Remove stray single chars on their own line (OCR noise)
 *  • Normalise multiple blank lines → max 2
 *  • Detect all-caps lines as headings and add a blank line before them
 *  • Trim trailing whitespace per line
 */
function postProcessOCRText(rawText) {
  const lines = rawText.split('\n');
  const processed = [];

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i].trimEnd();

    // Remove lines that are pure OCR noise (single char, or mostly special chars)
    if (/^[^a-zA-Z0-9]{0,2}$/.test(line.trim())) continue;

    // Detect ALL-CAPS section headings and pad with blank line above
    const trimmed = line.trim();
    if (
      trimmed.length > 2 &&
      trimmed === trimmed.toUpperCase() &&
      /[A-Z]/.test(trimmed) &&
      processed.length > 0 &&
      processed[processed.length - 1] !== ''
    ) {
      processed.push('');
    }

    processed.push(line);
  }

  // Collapse 3+ consecutive blank lines → 2
  const collapsed = [];
  let blankCount = 0;
  for (const line of processed) {
    if (line.trim() === '') {
      blankCount++;
      if (blankCount <= 2) collapsed.push(line);
    } else {
      blankCount = 0;
      collapsed.push(line);
    }
  }

  return collapsed.join('\n').trim();
}

/* ─── Main export ────────────────────────────────────────────────────────────── */

/**
 * Extract text from a PDF file using full OCR pipeline.
 *
 * @param {string} filePath  Absolute path to the PDF file
 * @returns {Promise<string>} Extracted and post-processed text
 */
async function extractWithOCR(filePath) {
  const dataBuffer = fs.readFileSync(filePath);

  // Load the PDF document
  const loadingTask = pdfjsLib.getDocument({
    data: new Uint8Array(dataBuffer),
    verbosity: 0,
  });
  const pdfDoc = await loadingTask.promise;

  const numPages = pdfDoc.numPages;
  console.log(`📄 OCR: Processing ${numPages} page(s)…`);

  const pageTexts = [];

  for (let pageNum = 1; pageNum <= numPages; pageNum++) {
    try {
      const page = await pdfDoc.getPage(pageNum);

      // Render page → PNG
      const rawPng = await renderPageToPngBuffer(page, 2.5);

      // Pre-process image (contrast, sharpen, deskew, greyscale)
      const processedPng = await preprocessImage(rawPng);

      // OCR
      const rawText = await runOCR(processedPng);

      // Post-process
      const cleanText = postProcessOCRText(rawText);

      if (cleanText.trim().length > 0) {
        pageTexts.push(`--- Page ${pageNum} ---\n${cleanText}`);
      }

      console.log(`  ✅ Page ${pageNum}/${numPages} done (${cleanText.split(/\s+/).filter(Boolean).length} words)`);
    } catch (pageErr) {
      console.warn(`  ⚠️  Page ${pageNum} OCR failed: ${pageErr.message}`);
    }
  }

  if (pageTexts.length === 0) {
    throw new Error('OCR could not extract any readable text from this document.');
  }

  return pageTexts.join('\n\n');
}

module.exports = { extractWithOCR };
