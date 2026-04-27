from PIL import Image, ImageDraw

def generate_jpg_icon():
    # Colors
    midnight = (2, 6, 23)
    amber = (245, 158, 11)
    emerald = (16, 185, 129)
    slate_border = (30, 41, 59)
    
    # Create 512x512 image
    size = 512
    img = Image.new('RGB', (size, size), color=midnight)
    draw = ImageDraw.Draw(img)
    
    # Draw instrument ring
    margin = 80
    draw.ellipse([margin, margin, size-margin, size-margin], outline=slate_border, width=24)
    
    # Draw progress arc (simulated by drawing a partial circle in emerald)
    draw.arc([margin, margin, size-margin, size-margin], start=-90, end=45, fill=emerald, width=24)

    # Draw Chevrons (Arrow heads)
    def draw_chevron(x_offset, opacity_color):
        points = [
            (256 + x_offset, 160),
            (336 + x_offset, 240),
            (256 + x_offset, 320)
        ]
        draw.line(points, fill=opacity_color, width=48, joint="curve")

    # Draw half-transparent chevron
    draw_chevron(-80, (122, 79, 5)) # Dimmed amber
    # Draw solid chevron
    draw_chevron(0, amber)
    
    # Save as JPG
    img.save('../frontend/public/cockpit-icon.jpg', 'JPEG', quality=95)
    print("JPG Icon generated at frontend/public/cockpit-icon.jpg")

if __name__ == "__main__":
    generate_jpg_icon()
