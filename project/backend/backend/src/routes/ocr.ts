import express from 'express';
import multer from 'multer';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';

const router = express.Router();

const upload = multer({ storage: multer.memoryStorage() });

// Test endpoint
router.get('/test', async (req: any, res: any) => {
  try {
    console.log('🔍 Testing OCR endpoint...');
    
    // Use absolute path to bypass path resolution issues
    const pythonScriptPath = 'C:\\Users\\rajea\\Desktop\\Internship 2025\\uc work\\project\\ocr-engine\\simple_ocr.py';
    
    console.log('🔍 Python script path:', pythonScriptPath);
    console.log('🔍 Script exists:', fs.existsSync(pythonScriptPath));
    console.log('🔍 Current working directory:', process.cwd());
    console.log('🔍 __dirname:', __dirname);
    
    if (!fs.existsSync(pythonScriptPath)) {
      return res.json({
        success: false,
        error: 'OCR script not found',
        path: pythonScriptPath,
        cwd: process.cwd(),
        dirname: __dirname
      });
    }
    
    // Test the OCR script with a sample image
    const testImagePath = 'C:\\Users\\rajea\\Desktop\\Internship 2025\\uc work\\project\\ocr-engine\\demo_fish_board.png';
    
    if (fs.existsSync(testImagePath)) {
      console.log('🔍 Testing with sample image:', testImagePath);
      
      const pythonProcess = spawn('python', [pythonScriptPath, testImagePath]);
      
      let output = '';
      let errorOutput = '';
      
      pythonProcess.stdout.on('data', (data: any) => {
        output += data.toString();
      });
      
      pythonProcess.stderr.on('data', (data: any) => {
        errorOutput += data.toString();
      });
      
      pythonProcess.on('close', (code: any) => {
        console.log('🔍 OCR test output:', output);
        console.log('🔍 OCR test error:', errorOutput);
        console.log('🔍 OCR test code:', code);
        
        res.json({
          success: true,
          output: output.trim(),
          error: errorOutput.trim(),
          code: code,
          script_path: pythonScriptPath,
          script_exists: fs.existsSync(pythonScriptPath),
          test_image_path: testImagePath,
          test_image_exists: fs.existsSync(testImagePath)
        });
      });
    } else {
      res.json({
        success: false,
        error: 'Test image not found',
        script_path: pythonScriptPath,
        script_exists: fs.existsSync(pythonScriptPath),
        test_image_path: testImagePath,
        test_image_exists: fs.existsSync(testImagePath)
      });
    }
  } catch (error: any) {
    res.json({
      success: false,
      error: error.message
    });
  }
});

// Test file upload endpoint
router.post('/test-upload', upload.single('image'), async (req: any, res: any) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: 'No image file provided' 
      });
    }

    res.json({
      success: true,
      filename: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype,
      message: 'File upload test successful'
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Main OCR endpoint - OPTIMIZED WITH BETTER TIMEOUT HANDLING
router.post('/describe', upload.single('image'), async (req: any, res: any) => {
  try {
    console.log('🔍 OCR describe endpoint called');
    
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: 'No image file provided' 
      });
    }

    console.log('🔍 File received:', req.file.originalname, 'Size:', req.file.size);
    
    // Save image to temporary file
    const tempImagePath = path.join(__dirname, '../../uploads', `temp_${Date.now()}.png`);
    
    // Ensure uploads directory exists
    if (!fs.existsSync(path.dirname(tempImagePath))) {
      fs.mkdirSync(path.dirname(tempImagePath), { recursive: true });
    }
    
    fs.writeFileSync(tempImagePath, req.file.buffer);
    console.log('🔍 Image saved to:', tempImagePath);
    
    // Path to the Python OCR script - CORRECTED PATH
    const pythonScriptPath = 'C:\\Users\\rajea\\Desktop\\Internship 2025\\uc work\\project\\ocr-engine\\simple_ocr.py';
    
    console.log('🔍 OCR Script Path:', pythonScriptPath);
    console.log('🔍 Script exists:', fs.existsSync(pythonScriptPath));
    
    // Check if Python script exists
    if (!fs.existsSync(pythonScriptPath)) {
      console.error('❌ Python OCR script not found');
      return res.status(500).json({
        success: false,
        message: 'OCR script not found',
        error: 'Python OCR script not found'
      });
    }
    
    // Call Python script
    console.log('🔍 Calling Python script with:', pythonScriptPath, tempImagePath);
    const pythonProcess = spawn('python', [pythonScriptPath, tempImagePath]);
    
    // Set timeout for Python process - OPTIMIZED TO PREVENT 408 ERRORS
    const timeout = setTimeout(() => {
      pythonProcess.kill();
      console.error('❌ Python OCR process timed out');
      
      // Clean up temp file on timeout
      try {
        if (fs.existsSync(tempImagePath)) {
          fs.unlinkSync(tempImagePath);
        }
      } catch (e: any) {
        console.log('Could not delete temp file on timeout:', e);
      }
      
      return res.status(500).json({
        success: false,
        message: 'OCR processing timed out - please try with a smaller image or better quality',
        error: 'Python OCR process timed out',
        suggestion: 'Try uploading a clearer image with better contrast'
      });
    }, 45000); // 45 seconds timeout - OPTIMIZED
    
    let output = '';
    let errorOutput = '';
    
    pythonProcess.stdout.on('data', (data: any) => {
      output += data.toString();
    });
    
    pythonProcess.stderr.on('data', (data: any) => {
      errorOutput += data.toString();
    });
    
    pythonProcess.on('close', (code: any) => {
      clearTimeout(timeout);
      console.log('🔍 Python process closed with code:', code);
      console.log('🔍 Output length:', output.length);
      console.log('🔍 Error output length:', errorOutput.length);
      console.log('🔍 Full output:', output);
      console.log('🔍 Full error output:', errorOutput);
      
      // Clean up temp file
      try {
        if (fs.existsSync(tempImagePath)) {
          fs.unlinkSync(tempImagePath);
        }
      } catch (e: any) {
        console.log('Could not delete temp file:', e);
      }
      
      if (code !== 0) {
        console.error('❌ Python OCR failed with code:', code);
        console.error('❌ Error output:', errorOutput);
        return res.status(500).json({
          success: false,
          message: 'OCR processing failed - please try again',
          error: `Python OCR process failed with code ${code}: ${errorOutput}`,
          suggestion: 'Check image quality and try again'
        });
      }
      
      if (!output.trim()) {
        console.error('❌ No output from Python OCR');
        console.error('❌ Error output:', errorOutput);
        return res.status(500).json({
          success: false,
          message: 'No text found in image - please try with a different image',
          error: 'No output from Python OCR',
          suggestion: 'Try an image with clearer, more prominent text'
        });
      }
      
      try {
        console.log('🔍 Raw Python output:', output.substring(0, 500) + '...');
        const result = JSON.parse(output);
        console.log('✅ Successfully parsed Python output');
        
        // Enhanced response with better formatting
        res.json({
          success: true,
          message: 'OCR processing completed successfully',
          text: result.text || result.english_text || result.hindi_text || 'Text extracted successfully',
          confidence: result.confidence || 0.8,
          processing_time: result.processing_time || 'Unknown',
          enhanced: {
            englishFinal: result.english_text || result.text || 'English text extracted',
            hindiFinal: result.hindi_text || 'Hindi text extracted'
          },
          raw_ocr: {
            hindi_text: result.hindi_text || '',
            english_text: result.english_text || result.text || '',
            zones_count: result.zones_count || 1
          },
          metadata: {
            filename: req.file.originalname,
            fileSize: req.file.size,
            processingTimestamp: new Date().toISOString()
          }
        });
        
      } catch (parseError: any) {
        console.error('❌ Failed to parse Python OCR output:', parseError);
        console.error('❌ Raw output:', output);
        
        // Fallback response if JSON parsing fails
        res.json({
          success: true,
          message: 'OCR completed but output format unexpected',
          text: output.trim() || 'Text extracted (format issue)',
          confidence: 0.7,
          processing_time: 'Unknown',
          enhanced: {
            englishFinal: output.trim(),
            hindiFinal: 'Text extracted'
          },
          raw_ocr: {
            hindi_text: '',
            english_text: output.trim(),
            zones_count: 1
          },
          warning: 'Output format parsing issue - using raw text',
          raw_output: output.substring(0, 1000)
        });
      }
    });
    
    pythonProcess.on('error', (err: any) => {
      clearTimeout(timeout);
      console.error('❌ Failed to start Python OCR process:', err);
      
      // Clean up temp file on error
      try {
        if (fs.existsSync(tempImagePath)) {
          fs.unlinkSync(tempImagePath);
        }
      } catch (e: any) {
        console.log('Could not delete temp file on error:', e);
      }
      
      res.status(500).json({
        success: false,
        message: 'Failed to start OCR process - please try again',
        error: 'Failed to start OCR process',
        details: err.message,
        suggestion: 'Check if Python is installed and accessible'
      });
    });
    
  } catch (error: any) {
    console.error('❌ OCR describe error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error - please try again',
      error: 'Internal server error',
      details: error.message
    });
  }
});

export default router; 