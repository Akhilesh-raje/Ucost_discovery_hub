const express = require('express');
const multer = require('multer');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

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
      buffer_length: req.file.buffer.length
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Upload test failed',
      error: error.message
    });
  }
});

// Main OCR endpoint - FULLY FUNCTIONAL
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
    
    // Set timeout for Python process
    const timeout = setTimeout(() => {
      pythonProcess.kill();
      console.error('❌ Python OCR process timed out');
      return res.status(500).json({
        success: false,
        message: 'OCR processing timed out',
        error: 'Python OCR process timed out'
      });
    }, 30000); // 30 seconds timeout
    
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
        fs.unlinkSync(tempImagePath);
      } catch (e: any) {
        console.log('Could not delete temp file:', e);
      }
      
      if (code !== 0) {
        console.error('❌ Python OCR failed with code:', code);
        console.error('❌ Error output:', errorOutput);
        return res.status(500).json({
          success: false,
          message: 'OCR processing failed',
          error: `Python OCR process failed with code ${code}: ${errorOutput}`
        });
      }
      
      if (!output.trim()) {
        console.error('❌ No output from Python OCR');
        console.error('❌ Error output:', errorOutput);
        return res.status(500).json({
          success: false,
          message: 'No OCR output',
          error: 'No output from Python OCR'
        });
      }
      
      try {
        console.log('🔍 Raw Python output:', output.substring(0, 500) + '...');
        const result = JSON.parse(output);
        console.log('✅ Successfully parsed Python output');
        
        // AI-powered text balancing and enhancement
        const balancedResult = balanceAndEnhanceText(result);
        
        res.json({
          success: true,
          text: balancedResult.enhanced,
          confidence: balancedResult.original.confidence,
          processing_time: balancedResult.original.processing_time,
          enhanced: {
            englishFinal: balancedResult.english,
            hindiFinal: balancedResult.hindi
          },
          raw_ocr: {
            hindi_text: balancedResult.original.hindi_text,
            english_text: balancedResult.original.english_text,
            zones_count: balancedResult.original.zones_count
          }
        });
        
      } catch (e: any) {
        console.error('❌ Failed to parse Python OCR output:', e);
        console.error('❌ Raw output:', output);
        return res.status(500).json({
          success: false,
          message: 'Invalid OCR output',
          error: `Invalid output from Python OCR: ${e.message}`
        });
      }
    });
    
    pythonProcess.on('error', (err: any) => {
      clearTimeout(timeout);
      console.error('Failed to start Python OCR process:', err);
      return res.status(500).json({
        success: false,
        message: 'Failed to start OCR process',
        error: err.message
      });
    });

  } catch (error: any) {
    console.error('OCR describe error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process image for description',
      error: error.message
    });
  }
});

// AI-powered text balancing and enhancement
function balanceAndEnhanceText(ocrResult: any) {
  let englishText = ocrResult.english_text || '';
  let hindiText = ocrResult.hindi_text || '';
  
  // Clean and enhance text
  englishText = englishText.trim().replace(/\s+/g, ' ');
  hindiText = hindiText.trim().replace(/\s+/g, ' ');
  
  // Add emojis and formatting
  const enhancedText = `🔍 **Extracted Information:**\n\n📝 **English Text:**\n${englishText}\n\nहिंदी **Text:**\n${hindiText}\n\n✨ **AI Enhanced:**\n${ocrResult.enhanced_text || 'No enhancement available'}`;
  
  return {
    original: ocrResult,
    enhanced: enhancedText,
    english: englishText,
    hindi: hindiText
  };
}

export default router; 