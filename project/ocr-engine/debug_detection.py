#!/usr/bin/env python3
"""
🔍 Debug Image Type Detection
Test the image type detection algorithm independently
"""

from PIL import Image
import cv2
import numpy as np

def debug_image_detection(image_path):
    """Debug the image type detection algorithm"""
    
    print(f"🔍 Testing image: {image_path}")
    
    # Open image
    image = Image.open(image_path)
    img_array = np.array(image)
    
    # Convert to grayscale
    gray = cv2.cvtColor(img_array, cv2.COLOR_RGB2GRAY)
    
    # Calculate statistics
    mean_brightness = np.mean(gray)
    std_brightness = np.std(gray)
    
    # Check for very dark background with bright text
    dark_pixels = np.sum(gray < 50)  # Very dark pixels
    bright_pixels = np.sum(gray > 200)  # Very bright pixels
    total_pixels = gray.size
    
    dark_ratio = dark_pixels / total_pixels
    bright_ratio = bright_pixels / total_pixels
    
    print(f"📊 Image Statistics:")
    print(f"   Mean brightness: {mean_brightness:.1f}")
    print(f"   Std brightness: {std_brightness:.1f}")
    print(f"   Dark ratio: {dark_ratio:.3f}")
    print(f"   Bright ratio: {bright_ratio:.3f}")
    
    # Test detection logic
    print(f"\n🎯 Detection Logic Test:")
    
    if dark_ratio > 0.6 and bright_ratio > 0.05 and std_brightness > 40:
        print(f"   ✅ HIGH_CONTRAST_TERMINAL detected!")
        print(f"      - Dark ratio > 0.6: {dark_ratio:.3f} > 0.6")
        print(f"      - Bright ratio > 0.05: {bright_ratio:.3f} > 0.05")
        print(f"      - Std > 40: {std_brightness:.1f} > 40")
    else:
        print(f"   ❌ HIGH_CONTRAST_TERMINAL NOT detected")
        if dark_ratio <= 0.6:
            print(f"      - Dark ratio too low: {dark_ratio:.3f} <= 0.6")
        if bright_ratio <= 0.05:
            print(f"      - Bright ratio too low: {bright_ratio:.3f} <= 0.05")
        if std_brightness <= 40:
            print(f"      - Std too low: {std_brightness:.1f} <= 40")
    
    # Show pixel distribution
    print(f"\n📈 Pixel Distribution:")
    print(f"   Very dark (<50): {dark_pixels:,} pixels")
    print(f"   Dark (50-100): {np.sum((gray >= 50) & (gray < 100)):,} pixels")
    print(f"   Medium (100-150): {np.sum((gray >= 100) & (gray < 150)):,} pixels")
    print(f"   Bright (150-200): {np.sum((gray >= 150) & (gray < 200)):,} pixels")
    print(f"   Very bright (>200): {bright_pixels:,} pixels")

if __name__ == "__main__":
    debug_image_detection("test_powershell.png") 