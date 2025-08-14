require('dotenv').config();
const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { createWorker } = require('tesseract.js');
const sharp = require('sharp');
const axios = require('axios');
const { execFile } = require('child_process');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|bmp|tiff/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

// Initialize models
async function initializeModels() {
  try {
    console.log('Initializing superior OCR with multiple strategies...');
    console.log('Available OCR strategies:');
    console.log('- High Accuracy (English + Hindi, 4000px, enhanced preprocessing)');
    console.log('- Fast (English + Hindi, 2000px, automatic segmentation)');
    console.log('- Binary (English + Hindi, 1500px, threshold processing)');

    // Warm up bilingual OCR worker to ensure models are ready (downloads/caches lang data on first run)
    try {
      const warmupWorker = await createWorker('eng+hin');
      await warmupWorker.terminate();
      console.log('Bilingual OCR (eng+hin) warmed up successfully.');
    } catch (warmupError) {
      console.warn('Bilingual OCR warm-up failed (will attempt on-demand):', warmupError.message);
    }

    console.log('All models initialized successfully!');
  } catch (error) {
    console.error('Error initializing models:', error);
  }
}

// Advanced OCR Configuration
const OCR_CONFIGS = {
  HIGH_ACCURACY: {
    languages: ['eng', 'hin'],
    psm: 6, // Uniform block of text
    oem: 3, // Default OCR Engine Mode
    dpi: 300,
    preprocessing: {
      resize: 4000,
      sharpen: { sigma: 1.5, flat: 1, jagged: 2 },
      gamma: 1.3,
      normalize: true
    }
  },
  FAST: {
    languages: ['eng', 'hin'],
    psm: 3, // Fully automatic page segmentation
    oem: 3,
    dpi: 200,
    preprocessing: {
      resize: 2000,
      sharpen: { sigma: 1, flat: 1, jagged: 1 },
      gamma: 1.2,
      normalize: true
    }
  },
  BINARY: {
    languages: ['eng', 'hin'],
    psm: 6,
    oem: 3,
    dpi: 150,
    preprocessing: {
      resize: 1500,
      threshold: 128,
      normalize: true
    }
  }
};

// Superior OCR Processing Function with Multiple Strategies
async function performOCR(imagePath) {
  try {
    console.log('Starting superior OCR processing with advanced strategies...');
    
    let bestResult = '';
    let bestScore = 0;
    
    // Strategy 0: PaddleOCR via optional local service
    try {
      console.log('Strategy 0: PaddleOCR (if service is available)...');
      const result0 = await performPaddleOCR(imagePath);
      if (result0 && typeof result0 === 'string' && result0.trim()) {
        const normalized0 = normalizeHindiEnglishText(result0);
        const score0 = calculateTextQuality(normalized0);
        console.log(`PaddleOCR result (score: ${score0}):`, normalized0.substring(0, 100) + '...');
        if (score0 > bestScore) {
          bestResult = normalized0;
          bestScore = score0;
        }
      }
    } catch (error) {
      console.log('PaddleOCR skipped/unavailable:', error.message);
    }
    
    // Strategy 1: High Accuracy OCR
    try {
      console.log('Strategy 1: High Accuracy OCR...');
      const result1 = await performOCRWithConfig(imagePath, OCR_CONFIGS.HIGH_ACCURACY);
      const score1 = calculateTextQuality(result1);
      console.log(`High Accuracy result (score: ${score1}):`, result1.substring(0, 100) + '...');
      
      if (score1 > bestScore) {
        bestResult = result1;
        bestScore = score1;
      }
    } catch (error) {
      console.log('High Accuracy OCR failed:', error.message);
    }
    
    // Strategy 2: Fast OCR
    try {
      console.log('Strategy 2: Fast OCR...');
      const result2 = await performOCRWithConfig(imagePath, OCR_CONFIGS.FAST);
      const score2 = calculateTextQuality(result2);
      console.log(`Fast OCR result (score: ${score2}):`, result2.substring(0, 100) + '...');
      
      if (score2 > bestScore) {
        bestResult = result2;
        bestScore = score2;
      }
    } catch (error) {
      console.log('Fast OCR failed:', error.message);
    }
    
    // Strategy 3: Binary Threshold OCR
    try {
      console.log('Strategy 3: Binary Threshold OCR...');
      const result3 = await performOCRWithConfig(imagePath, OCR_CONFIGS.BINARY);
      const score3 = calculateTextQuality(result3);
      console.log(`Binary OCR result (score: ${score3}):`, result3.substring(0, 100) + '...');
      
      if (score3 > bestScore) {
        bestResult = result3;
        bestScore = score3;
      }
    } catch (error) {
      console.log('Binary OCR failed:', error.message);
    }
    
    console.log(`Best OCR result (score: ${bestScore}):`, bestResult.substring(0, 200) + '...');
    const finalText = bestResult || 'No text could be extracted from the image';
    return normalizeHindiEnglishText(finalText);
    
  } catch (error) {
    console.error('Superior OCR Error:', error);
    return await performEmergencyOCR(imagePath);
  }
}

// Perform OCR with specific configuration
async function performOCRWithConfig(imagePath, config) {
  try {
    const processedImagePath = imagePath.replace(/\.[^/.]+$/, `_${config.languages.join('_')}_processed.jpg`);
    
    // Apply preprocessing based on config
    let sharpInstance = sharp(imagePath)
      .resize(config.preprocessing.resize, config.preprocessing.resize, { 
        fit: 'inside', 
        withoutEnlargement: true 
      });
    
    if (config.preprocessing.sharpen) {
      sharpInstance = sharpInstance.sharpen(config.preprocessing.sharpen);
    }
    
    if (config.preprocessing.normalize) {
      sharpInstance = sharpInstance.normalize();
    }
    
    if (config.preprocessing.gamma) {
      sharpInstance = sharpInstance.gamma(config.preprocessing.gamma);
    }
    
    if (config.preprocessing.threshold) {
      sharpInstance = sharpInstance.threshold(config.preprocessing.threshold);
    }
    
    await sharpInstance
      .jpeg({ quality: 100 })
      .toFile(processedImagePath);
    
    // Create worker with specified languages
    const worker = await createWorker(config.languages.join('+'));
    
    // Set OCR parameters
    await worker.setParameters({
      tessedit_pageseg_mode: config.psm.toString(),
      tessedit_ocr_engine_mode: config.oem.toString(),
      preserve_interword_spaces: '1'
    });
    
    const result = await worker.recognize(processedImagePath);
    await worker.terminate();
    
    // Clean up processed image
    if (fs.existsSync(processedImagePath)) {
      fs.unlinkSync(processedImagePath);
    }
    
    return result.data.text.trim();
  } catch (error) {
    console.error('OCR with config failed:', error.message);
    return '';
  }
}

// Calculate text quality score
function calculateTextQuality(text) {
  if (!text || text.length < 5) return 0;
  
  let score = 0;
  
  // Length score (longer text gets higher score)
  score += Math.min(text.length * 0.1, 20);
  
  // Word count score
  const words = text.split(/\s+/).filter(word => word.length > 0);
  score += Math.min(words.length * 0.5, 30);
  
  // Readability score (fewer special characters = better)
  // Use Unicode-aware character classes to avoid penalizing non-Latin scripts (e.g., Devanagari for Hindi)
  const specialChars = (text.match(/[^\p{L}\p{N}\s.,!?;:()]/gu) || []).length;
  score += Math.max(0, 20 - specialChars * 0.5);
  
  // Common word score (English + Hindi)
  const commonWords = ['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'के', 'और', 'या', 'लेकिन', 'में', 'पर', 'को', 'के लिए', 'का', 'साथ', 'द्वारा'];
  const foundCommonWords = commonWords.filter(word => 
    text.toLowerCase().includes(word)
  ).length;
  score += foundCommonWords * 2;
  
  return Math.round(score);
}

// Normalize bilingual text (basic cleanup + gentle transliteration sanitize)
function normalizeHindiEnglishText(text) {
  if (!text) return text;
  // Normalize Unicode and collapse whitespace; preserve Devanagari/Latin text
  return text
    .normalize('NFC')
    .replace(/[\t\f\r]+/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

// Split bilingual text into Hindi (Devanagari) and English (Latin) components
function splitTextByScript(text) {
  if (!text) return { hindi: '', english: '' };
  const hindiChars = [];
  const englishChars = [];
  for (const ch of text) {
    const code = ch.codePointAt(0);
    // Devanagari: U+0900–U+097F (basic block); include common marks implicitly via block
    if (code >= 0x0900 && code <= 0x097F) {
      hindiChars.push(ch);
      englishChars.push(ch.match(/\s/) ? ' ' : '');
    } else if ((code >= 0x0000 && code <= 0x007F) || (code >= 0x0080 && code <= 0x00FF)) {
      // Latin + Latin-1
      englishChars.push(ch);
      hindiChars.push(ch.match(/\s/) ? ' ' : '');
    } else {
      // Neutral: keep spacing only to avoid cross-contamination
      const space = ch.match(/\s/) ? ' ' : '';
      hindiChars.push(space);
      englishChars.push(space);
    }
  }
  const hindi = hindiChars.join('').replace(/\s{2,}/g, ' ').trim();
  const english = englishChars.join('').replace(/\s{2,}/g, ' ').trim();
  return { hindi, english };
}

// Heuristic beautifier to turn scrambled OCR into readable bilingual text
function tidyEnglish(text) {
  if (!text) return '';
  let s = text
    .replace(/[|=]{2,}/g, ' ')
    .replace(/[_]{2,}/g, ' ')
    .replace(/[-]{3,}/g, ' ')
    .replace(/\s*([.,!?;:])\s*/g, '$1 ')
    .replace(/\(\s+/g, '(')
    .replace(/\s+\)/g, ')')
    .replace(/\d{5,}/g, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
  // Remove isolated single letters except pronouns 'a' and 'I'
  s = s.replace(/\b([A-HJ-Za-hj-z])\b/g, '');
  s = s.replace(/\s{2,}/g, ' ').trim();
  // Sentence case
  const parts = s.split(/([.!?]+\s+)/);
  let out = '';
  for (let i = 0; i < parts.length; i += 2) {
    const sent = (parts[i] || '').trim();
    const punc = parts[i + 1] || '';
    if (!sent) { out += punc; continue; }
    out += sent.charAt(0).toUpperCase() + sent.slice(1) + (punc || (i + 2 < parts.length ? ' ' : ''));
  }
  return out.trim();
}

function tidyHindi(text) {
  if (!text) return '';
  let s = text
    .replace(/[|=]{2,}/g, ' ')
    .replace(/[_]{2,}/g, ' ')
    .replace(/[-]{3,}/g, ' ')
    .replace(/\s*([.,!?;:])\s*/g, '$1 ')
    .replace(/\d{5,}/g, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
  return s;
}

function beautifyText(raw) {
  if (!raw) return { beautified: '', hindi: '', english: '' };
  const normalized = normalizeHindiEnglishText(raw);
  const { hindi, english } = splitTextByScript(normalized);
  const eng = tidyEnglish(english);
  const hin = tidyHindi(hindi);
  let beautified = '';
  if (hin) beautified += `🇮🇳 ${hin}`;
  if (eng) beautified += (beautified ? '\n\n' : '') + `🇺🇸 ${eng}`;
  return { beautified: beautified || normalized, hindi: hin, english: eng };
}

// Optional PaddleOCR integration
async function performPaddleOCR(imagePath) {
  const serviceUrl = process.env.PADDLE_OCR_URL;
  if (!serviceUrl) {
    throw new Error('PaddleOCR service not configured');
  }
  const imageBuffer = fs.readFileSync(imagePath);
  const base64 = imageBuffer.toString('base64');
  const payload = { images: [`data:image/jpeg;base64,${base64}`] };

  const response = await axios.post(serviceUrl, payload, { timeout: 20000 });
  const data = response.data;
  if (!data) return '';
  // Attempt to extract text from typical PaddleOCR service response structures
  if (typeof data.text === 'string') return data.text;
  if (Array.isArray(data.results)) {
    const first = data.results[0];
    if (typeof first?.text === 'string') return first.text;
    if (Array.isArray(first)) {
      return first.map(item => item?.text).filter(Boolean).join(' ');
    }
  }
  return '';
}

// Emergency OCR method with different preprocessing
async function performEmergencyOCR(imagePath) {
  try {
    console.log('Starting emergency OCR...');
    
    const processedImagePath = imagePath.replace(/\.[^/.]+$/, '_emergency.jpg');
    
    // Emergency preprocessing approach
    await sharp(imagePath)
      .resize(2000, 2000, { fit: 'inside', withoutEnlargement: true })
      .sharpen()
      .normalize()
      .threshold(128) // Convert to binary
      .jpeg({ quality: 95 })
      .toFile(processedImagePath);
    
    const worker = await createWorker('eng+hin');
    
    await worker.setParameters({
      tessedit_pageseg_mode: '6', // Uniform block of text
      preserve_interword_spaces: '1'
    });
    
    const result = await worker.recognize(processedImagePath);
    await worker.terminate();
    
    // Clean up
    if (fs.existsSync(processedImagePath)) {
      fs.unlinkSync(processedImagePath);
    }
    
    console.log('Emergency OCR completed');
    return result.data.text.trim();
  } catch (error) {
    console.error('Emergency OCR Error:', error);
    return 'OCR processing failed - no text could be extracted';
  }
}

// Object Detection Function (Simplified - returns basic image analysis)
async function performObjectDetection(imagePath) {
  try {
    console.log('Starting image analysis...');
    
    // Read image metadata
    const imageBuffer = fs.readFileSync(imagePath);
    const metadata = await sharp(imageBuffer).metadata();
    
    // Basic color analysis
    const { dominant } = await sharp(imageBuffer)
      .resize(100, 100)
      .raw()
      .toBuffer({ resolveWithObject: true });
    
    const analysis = {
      objects: [
        {
          class: 'image',
          score: 1.0,
          bbox: [0, 0, metadata.width, metadata.height]
        }
      ],
      metadata: {
        width: metadata.width,
        height: metadata.height,
        format: metadata.format,
        channels: metadata.channels,
        hasAlpha: metadata.hasAlpha
      }
    };
    
    console.log('Image analysis completed');
    return analysis;
  } catch (error) {
    console.error('Image Analysis Error:', error);
    throw new Error('Image analysis failed');
  }
}

// Image Analysis Function (Enhanced with more detailed analysis)
async function performImageAnalysis(imagePath) {
  try {
    console.log('Starting detailed image analysis...');
    
    const imageBuffer = fs.readFileSync(imagePath);
    const metadata = await sharp(imageBuffer).metadata();
    
    // Get image statistics for better analysis
    const stats = await sharp(imageBuffer)
      .stats();
    
    // Analyze image characteristics
    const aspectRatio = metadata.width / metadata.height;
    const isPortrait = aspectRatio < 0.8;
    const isLandscape = aspectRatio > 1.2;
    const isSquare = aspectRatio >= 0.8 && aspectRatio <= 1.2;
    
    // Determine image type based on characteristics
    let imageType = 'general';
    if (metadata.width > 2000 || metadata.height > 2000) {
      imageType = 'high-resolution';
    }
    
    // Generate a more descriptive caption
    let caption = `A ${imageType} ${metadata.format?.toUpperCase() || 'image'}`;
    caption += ` (${metadata.width}x${metadata.height} pixels)`;
    
    if (isPortrait) {
      caption += ', portrait orientation';
    } else if (isLandscape) {
      caption += ', landscape orientation';
    } else {
      caption += ', square format';
    }
    
    if (metadata.channels === 1) {
      caption += ', grayscale';
    } else if (metadata.channels === 3) {
      caption += ', color';
    } else if (metadata.channels === 4) {
      caption += ', with transparency';
    }
    
    if (metadata.size) {
      const sizeKB = Math.round(metadata.size / 1024);
      caption += `, ${sizeKB} KB`;
    }
    
    // Add quality assessment
    if (metadata.density && metadata.density > 300) {
      caption += ', high quality';
    } else if (metadata.density && metadata.density > 150) {
      caption += ', medium quality';
    } else {
      caption += ', standard quality';
    }
    
    const analysis = {
      caption: caption,
      format: metadata.format?.toUpperCase(),
      width: metadata.width,
      height: metadata.height,
      size: metadata.size,
      channels: metadata.channels,
      hasAlpha: metadata.hasAlpha,
      colorSpace: metadata.space,
      depth: metadata.depth,
      density: metadata.density,
      orientation: metadata.orientation,
      aspectRatio: Math.round(aspectRatio * 100) / 100,
      imageType: imageType
    };
    
    console.log('Detailed image analysis completed');
    return analysis;
  } catch (error) {
    console.error('Image Analysis Error:', error);
    throw new Error('Image analysis failed');
  }
}

// Main analysis endpoint
app.post('/api/analyze', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    const imagePath = req.file.path;
    console.log(`Processing image: ${imagePath}`);

    // Run all analyses in parallel
    const [ocrResult, objectDetectionResult, imageAnalysisResult] = await Promise.allSettled([
      performOCR(imagePath),
      performObjectDetection(imagePath),
      performImageAnalysis(imagePath)
    ]);

    // Compile results
    const results = {
      success: true,
      filename: req.file.originalname,
      timestamp: new Date().toISOString(),
      ocr: (() => {
        if (ocrResult.status !== 'fulfilled') {
          return { success: false, text: null, hindi: null, english: null, error: ocrResult.reason?.message || 'OCR failed' };
        }
        const rawText = ocrResult.value || '';
        const beautified = beautifyText(rawText);
        return { success: true, text: rawText, hindi: beautified.hindi, english: beautified.english, beautified: beautified.beautified, error: null };
      })(),
      ocrBeautified: (() => {
        if (ocrResult.status !== 'fulfilled') {
          return { beautified: null, hindi: null, english: null };
        }
        const rawText = ocrResult.value || '';
        const b = beautifyText(rawText);
        return { beautified: b.beautified, hindi: b.hindi, english: b.english };
      })(),
      objectDetection: {
        success: objectDetectionResult.status === 'fulfilled',
        objects: objectDetectionResult.status === 'fulfilled' ? objectDetectionResult.value : [],
        error: objectDetectionResult.status === 'rejected' ? objectDetectionResult.reason.message : null
      },
      imageAnalysis: {
        success: imageAnalysisResult.status === 'fulfilled',
        analysis: imageAnalysisResult.status === 'fulfilled' ? imageAnalysisResult.value : null,
        error: imageAnalysisResult.status === 'rejected' ? imageAnalysisResult.reason.message : null
      }
    };

    // Clean up uploaded file
    fs.unlinkSync(imagePath);

    res.json(results);
  } catch (error) {
    console.error('Analysis Error:', error);
    res.status(500).json({ 
      error: 'Analysis failed', 
      details: error.message 
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    models: {
      ocr: 'Superior Multi-Strategy OCR',
      imageProcessing: 'Sharp'
    },
    ocrCapabilities: {
      strategy1: 'High Accuracy (English + Hindi, 4000px)',
      strategy2: 'Fast (English + Hindi, 2000px, auto-segmentation)',
      strategy3: 'Binary (English + Hindi, 1500px, threshold)',
      strategy0: 'PaddleOCR (if service available)',
      fallback: 'Emergency OCR'
    },
    languages: {
      default: 'eng+hin',
      supported: ['eng', 'hin']
    },
    integrations: {
      paddleOCR: Boolean(process.env.PADDLE_OCR_URL)
    }
  });
});

// Text analysis endpoint - returns results in readable text format
app.post('/api/analyze-text', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).send('No image file provided');
    }

    const imagePath = req.file.path;
    console.log(`Processing image: ${imagePath}`);

    // Run all analyses in parallel
    const [ocrResult, objectDetectionResult, imageAnalysisResult] = await Promise.allSettled([
      performOCR(imagePath),
      performObjectDetection(imagePath),
      performImageAnalysis(imagePath)
    ]);

    // Format results as simple, clean text
    let textOutput = '';
    
    // OCR Results - just the extracted text
    if (ocrResult.status === 'fulfilled' && ocrResult.value && ocrResult.value.trim()) {
      const rawText = ocrResult.value.trim();
      const { hindi, english } = splitTextByScript(rawText);
      textOutput += `EXTRACTED TEXT (SEPARATED):\n`;
      if (hindi) textOutput += `\n[HINDI]\n${hindi}\n`;
      if (english) textOutput += `\n[ENGLISH]\n${english}\n`;
      if (!hindi && !english) textOutput += `${rawText}\n`;
    } else {
      textOutput += `No text found in the image.\n\n`;
    }

    // Image Analysis Results - simple format
    if (imageAnalysisResult.status === 'fulfilled' && imageAnalysisResult.value) {
      const analysis = imageAnalysisResult.value;
      textOutput += `IMAGE DETAILS:\n`;
      textOutput += `Size: ${analysis.width} x ${analysis.height} pixels\n`;
      textOutput += `Format: ${analysis.format}\n`;
      textOutput += `File size: ${Math.round(analysis.size / 1024)} KB\n`;
      if (analysis.density) {
        textOutput += `Quality: ${analysis.density} DPI\n`;
      }
    }

    // Clean up uploaded file
    fs.unlinkSync(imagePath);

    // Set content type to plain text
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.send(textOutput);
  } catch (error) {
    console.error('Analysis Error:', error);
    res.status(500).send(`Analysis failed: ${error.message}`);
  }
});

// Lightweight OCR endpoint using Python lite_ocr.py with strong preprocessing
app.post('/api/lite-ocr', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }
    const imagePath = req.file.path;
    const lang = (req.query.lang || 'eng').toString();

    const py = process.platform.startsWith('win') ? 'python' : 'python3';
    execFile(py, ['lite_ocr.py', '--image', imagePath, '--lang', lang], { timeout: 120000 }, (err, stdout, stderr) => {
      // Clean up uploaded file regardless of outcome
      try { if (imagePath && fs.existsSync(imagePath)) fs.unlinkSync(imagePath); } catch {}

      if (err) {
        console.error('lite-ocr error:', err, stderr);
        return res.status(500).json({ error: 'lite-ocr failed', details: String(err) });
      }
      const text = (stdout || '').toString();
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.send(text);
    });
  } catch (error) {
    console.error('lite-ocr endpoint error:', error);
    res.status(500).json({ error: 'lite-ocr failed', details: error.message });
  }
});

// Serve the main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  await initializeModels();
});

module.exports = app;
