import express from 'express';
import cors from 'cors';
import { spawn } from 'child_process';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// File upload configuration
const upload = multer({ storage: multer.memoryStorage() });

// Simple OCR endpoint that works
app.post('/api/ocr/describe', upload.single('image'), async (req: any, res: any) => {
  try {
    console.log('🔍 OCR describe endpoint called');
    
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        error: 'No image file provided' 
      });
    }

    // Save uploaded file temporarily
    const tempImagePath = path.join(__dirname, '..', '..', 'temp_upload.png');
    fs.writeFileSync(tempImagePath, req.file.buffer);

    // Path to OCR script
    const pythonScriptPath = path.join(__dirname, '..', '..', '..', 'ocr-engine', 'simple_ocr.py');
    
    console.log('🔍 Python script path:', pythonScriptPath);
    console.log('🔍 Script exists:', fs.existsSync(pythonScriptPath));

    if (!fs.existsSync(pythonScriptPath)) {
      return res.status(500).json({
        success: false,
        error: 'OCR script not found',
        path: pythonScriptPath
      });
    }

    // Run OCR
    const pythonProcess = spawn('python', [pythonScriptPath, tempImagePath]);
    
    let output = '';
    let errorOutput = '';
    
    pythonProcess.stdout.on('data', (data: any) => {
      output += data.toString();
    });
    
    pythonProcess.stderr.on('data', (data: any) => {
      errorOutput += data.toString();
    });

    // Set timeout
    const timeout = setTimeout(() => {
      pythonProcess.kill();
      res.status(408).json({
        success: false,
        error: 'OCR processing timeout'
      });
    }, 120000); // 2 minutes timeout

    pythonProcess.on('close', (code: any) => {
      clearTimeout(timeout);
      
      // Clean up temp file
      try {
        fs.unlinkSync(tempImagePath);
      } catch (e: any) {
        console.log('Could not delete temp file:', e);
      }

      console.log('🔍 Python process closed with code:', code);
      console.log('🔍 Output:', output);
      console.log('🔍 Error:', errorOutput);

      if (code !== 0) {
        return res.status(500).json({
          success: false,
          error: 'OCR processing failed',
          details: errorOutput
        });
      }

      try {
        const result = JSON.parse(output.trim());
        res.json({
          success: true,
          text: result.text,
          confidence: result.confidence,
          processing_time: result.processing_time,
          enhanced: {
            englishFinal: result.english_text,
            hindiFinal: result.hindi_text
          },
          raw_ocr: {
            hindi_text: result.hindi_text,
            english_text: result.english_text,
            zones_count: result.zones_count
          }
        });
      } catch (e: any) {
        console.error('❌ Failed to parse Python OCR output:', e);
        res.status(500).json({
          success: false,
          error: 'Invalid OCR output format',
          raw_output: output
        });
      }
    });

    pythonProcess.on('error', (err: any) => {
      clearTimeout(timeout);
      console.error('Failed to start Python OCR process:', err);
      res.status(500).json({
        success: false,
        error: 'Failed to start OCR process'
      });
    });

  } catch (error: any) {
    console.error('OCR describe error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Test endpoint
app.get('/api/ocr/test', (req: any, res: any) => {
  res.json({
    success: true,
    message: 'OCR API is working!',
    timestamp: new Date().toISOString()
  });
});

// Health check
app.get('/health', (req: any, res: any) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'UCOST Discovery Hub Backend'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 UCOST Discovery Hub Backend running on port ${PORT}`);
  console.log(`🔍 OCR API available at http://localhost:${PORT}/api/ocr/describe`);
  console.log(`🏥 Health check at http://localhost:${PORT}/health`);
}); 