#!/usr/bin/env python3
"""
Generate PWA icons for Einbürgerungstest app
Creates 192x192 and 512x512 PNG icons with German flag colors
"""

from PIL import Image, ImageDraw, ImageFont
import os

def create_icon(size, filename):
    """Create a simple icon with German flag colors and text"""
    # Create image with white background
    img = Image.new('RGB', (size, size), '#FFFFFF')
    draw = ImageDraw.Draw(img)

    # Draw German flag stripes (black, red, gold)
    stripe_height = size // 3

    # Black stripe
    draw.rectangle([(0, 0), (size, stripe_height)], fill='#000000')

    # Red stripe
    draw.rectangle([(0, stripe_height), (size, stripe_height * 2)], fill='#DD0000')

    # Gold stripe
    draw.rectangle([(0, stripe_height * 2), (size, size)], fill='#FFCE00')

    # Add a circular overlay with gradient for modern look
    overlay = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    overlay_draw = ImageDraw.Draw(overlay)

    # Draw a circle in the center
    circle_size = int(size * 0.6)
    circle_pos = (size - circle_size) // 2
    overlay_draw.ellipse(
        [(circle_pos, circle_pos), (circle_pos + circle_size, circle_pos + circle_size)],
        fill=(102, 126, 234, 220)  # #667eea with transparency
    )

    # Composite the overlay
    img = img.convert('RGBA')
    img = Image.alpha_composite(img, overlay)

    # Try to add text (fallback if font not available)
    try:
        # Try to use a system font
        font_size = size // 8
        font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", font_size)
    except:
        # Fallback to default font
        font = ImageFont.load_default()

    # Add "DE" text in the center
    text = "🇩🇪"

    # Draw text shadow for better readability
    text_bbox = draw.textbbox((0, 0), "DE", font=font)
    text_width = text_bbox[2] - text_bbox[0]
    text_height = text_bbox[3] - text_bbox[1]
    text_x = (size - text_width) // 2
    text_y = (size - text_height) // 2

    draw = ImageDraw.Draw(img)

    # Draw "DE" in white with shadow
    shadow_offset = size // 100
    draw.text((text_x + shadow_offset, text_y + shadow_offset), "DE", fill=(0, 0, 0, 180), font=font)
    draw.text((text_x, text_y), "DE", fill=(255, 255, 255, 255), font=font)

    # Convert back to RGB for saving as PNG
    img = img.convert('RGB')

    # Save the image
    img.save(filename, 'PNG', quality=95)
    print(f"✅ Created {filename} ({size}x{size})")

def main():
    # Create icons
    create_icon(192, 'icon-192.png')
    create_icon(512, 'icon-512.png')
    print("\n🎉 PWA icons generated successfully!")
    print("📱 Your app is now ready to be installed on mobile devices!")

if __name__ == '__main__':
    main()
