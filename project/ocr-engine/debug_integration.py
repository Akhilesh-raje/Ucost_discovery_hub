#!/usr/bin/env python3
"""
🔧 Debug script to test backend-OCR integration
"""

import sys
import json
import os

def debug_integration():
    """Test the integration flow"""
    try:
        print("🔧 DEBUGGING BACKEND-OCR INTEGRATION", file=sys.stderr)
        print("=" * 50, file=sys.stderr)
        
        # Check if called with image path (backend mode)
        if len(sys.argv) > 1:
            image_path = sys.argv[1]
            print(f"📸 Backend mode - processing image: {image_path}", file=sys.stderr)
            
            # Check if image exists
            if not os.path.exists(image_path):
                error_result = {
                    "success": False,
                    "error": f"Image not found: {image_path}",
                    "text": "",
                    "hindi_text": "",
                    "english_text": "",
                    "confidence": 0.0,
                    "processing_time": 0.0,
                    "zones_count": 0
                }
                print(json.dumps(error_result))
                return
            
            # Simulate OCR processing
            print(f"✅ Image found: {image_path}", file=sys.stderr)
            print(f"📊 File size: {os.path.getsize(image_path)} bytes", file=sys.stderr)
            
            # Return test result
            test_result = {
                "success": True,
                "text": "Test OCR integration successful",
                "hindi_text": "परीक्षण सफल",
                "english_text": "Test successful",
                "confidence": 0.95,
                "processing_time": 1.5,
                "zones_count": 3
            }
            
            print("📤 Outputting JSON result:", file=sys.stderr)
            print(json.dumps(test_result))
            
        else:
            print("❌ No image path provided", file=sys.stderr)
            print("Usage: python debug_integration.py <image_path>", file=sys.stderr)
            
    except Exception as e:
        error_result = {
            "success": False,
            "error": f"Script error: {str(e)}",
            "text": "",
            "hindi_text": "",
            "english_text": "",
            "confidence": 0.0,
            "processing_time": 0.0,
            "zones_count": 0
        }
        print(json.dumps(error_result))

if __name__ == "__main__":
    debug_integration() 