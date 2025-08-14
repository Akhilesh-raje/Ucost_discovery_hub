#!/usr/bin/env python3
"""
🔧 Test PowerShell Image Generator
Creates a test image with PowerShell text for OCR testing
"""

from PIL import Image, ImageDraw, ImageFont
import os

def create_powershell_test_image():
    """Create a test image with PowerShell command text"""
    
    # Create a black background image (like a terminal)
    width, height = 800, 200
    background_color = (0, 0, 0)  # Black
    text_color = (255, 255, 255)  # White
    
    # Create image
    image = Image.new('RGB', (width, height), background_color)
    draw = ImageDraw.Draw(image)
    
    # Try to use a monospace font (PowerShell-like)
    try:
        # Try to use a system monospace font
        font = ImageFont.truetype("C:\\Windows\\Fonts\\consola.ttf", 24)
    except:
        try:
            font = ImageFont.truetype("C:\\Windows\\Fonts\\cour.ttf", 24)
        except:
            # Fallback to default font
            font = ImageFont.load_default()
    
    # PowerShell command text
    command_text = "Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope LocalMachine"
    
    # Calculate text position (center)
    bbox = draw.textbbox((0, 0), command_text, font=font)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]
    
    x = (width - text_width) // 2
    y = (height - text_height) // 2
    
    # Draw the text
    draw.text((x, y), command_text, fill=text_color, font=font)
    
    # Add some additional text below
    additional_text = "PowerShell Command - Execution Policy Setting"
    bbox2 = draw.textbbox((0, 0), additional_text, font=font)
    text_width2 = bbox2[2] - bbox2[0]
    
    x2 = (width - text_width2) // 2
    y2 = y + text_height + 20
    
    draw.text((x2, y2), additional_text, fill=text_color, font=font)
    
    # Save the image
    output_path = "test_powershell.png"
    image.save(output_path)
    
    print(f"✅ Test PowerShell image created: {output_path}")
    print(f"📊 Image size: {width}x{height}")
    print(f"🔍 Text: {command_text}")
    
    return output_path

if __name__ == "__main__":
    create_powershell_test_image() 