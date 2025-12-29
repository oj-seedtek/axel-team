# Custom Avatar Guide

## Overview
You can now upload your own PNG avatars for each agent! The system will automatically use your custom images if available, otherwise it falls back to emoji avatars.

## Quick Start

### 1. Prepare Your Avatars
Create or prepare PNG images for your agents:
- **Format**: PNG (transparent background recommended)
- **Size**: 200x200 pixels or larger (square)
- **Quality**: High resolution for best display
- **File size**: Keep under 500KB each

### 2. Name Your Files
Name each file according to the agent ID:
```
isabella.png  - Reception agent
leo.png       - Patient cards agent  
gabriel.png   - Email monitoring agent
nora.png      - Patient summaries agent
auditor.png   - Record checking agent
```

### 3. Place Files in Directory
Put your PNG files in: `static/avatars/`

The directory structure should look like:
```
dental-iq/
├── static/
│   ├── avatars/
│   │   ├── isabella.png
│   │   ├── leo.png
│   │   ├── gabriel.png
│   │   ├── nora.png
│   │   └── auditor.png
│   └── js/
│       └── main.js
├── main.py
└── ...
```

### 4. Restart Application
```bash
streamlit run main.py
```

Your custom avatars will now appear in the agent circles!

## Technical Details

### How It Works

1. **Avatar Loading (`avatars_config.py`)**
   - Checks if PNG file exists for each agent
   - Reads and converts PNG to base64 data URL
   - Falls back to emoji if PNG not found

2. **Agent Configuration (`agents_config.py`)**
   - Calls `get_agent_avatar(agent_id)` for each agent
   - Stores either data URL or emoji string

3. **Frontend Display (`main.js`)**
   - Detects if avatar is data URL (starts with `data:image`)
   - Renders as `<img>` tag for custom images
   - Renders as text for emoji fallbacks

### Avatar Specifications

#### Recommended Specs
- **Dimensions**: 200x200px to 500x500px
- **Aspect Ratio**: 1:1 (square)
- **Format**: PNG with transparency
- **Color Mode**: RGB or RGBA
- **Resolution**: 72-150 DPI

#### File Size Optimization
Keep files under 500KB for best performance:
- Use PNG optimization tools
- Reduce dimensions if needed
- Consider using PNG-8 for simple graphics

### Fallback Behavior

If a PNG is not found, the system uses these emoji defaults:
- Isabella: 👩🏽‍💼
- Leo: 👨🏼‍💼
- Gabriel: 🕵🏼‍♂️
- Nora: 👩🏼‍⚕️
- Auditor: 🛡️

## Design Tips

### Creating Great Avatars

1. **Professional Look**
   - Use consistent style across all avatars
   - Consider your brand colors
   - Keep designs simple and recognizable

2. **Visibility**
   - Ensure avatars are clear at 120px circle size
   - Use good contrast
   - Avoid too much fine detail

3. **Personality**
   - Match avatar style to agent role
   - Use visual cues (e.g., headset for reception)
   - Keep it professional but approachable

### Tools for Creating Avatars

**Free Options:**
- **GIMP** - Full-featured image editor
- **Inkscape** - Vector graphics editor
- **Photopea** - Online Photoshop alternative
- **Remove.bg** - Remove image backgrounds

**Paid Options:**
- **Adobe Photoshop** - Professional editing
- **Affinity Photo** - One-time purchase alternative
- **Canva Pro** - Easy design templates

**AI Generation:**
- **Midjourney** - AI avatar generation
- **DALL-E** - OpenAI image generation
- **Stable Diffusion** - Open source AI

## Troubleshooting

### Avatar Not Appearing

**Problem**: Custom avatar doesn't show

**Solutions:**
1. Check filename matches exactly (case-sensitive)
2. Verify file is PNG format
3. Ensure file is in `static/avatars/` directory
4. Check file permissions (readable)
5. Restart Streamlit application

### Avatar Looks Pixelated

**Problem**: Image appears low quality

**Solutions:**
1. Use higher resolution source (500x500px+)
2. Ensure image is square
3. Save at higher quality settings
4. Use PNG-24 instead of PNG-8

### Avatar Too Large

**Problem**: Circular display cuts off image

**Solutions:**
1. Ensure image is perfectly square
2. Add padding to original image
3. Center important elements in square
4. Test at 120x120px preview size

### File Not Loading

**Problem**: Error in console about avatar

**Solutions:**
1. Check file size (keep under 500KB)
2. Verify PNG format (not JPG/GIF)
3. Check for file corruption
4. Try re-exporting from image editor

## Examples

### Example 1: Professional Headshot
```
Dimensions: 400x400px
Format: PNG with transparent background
Style: Professional photo, centered face
File size: 180KB
```

### Example 2: Illustrated Character
```
Dimensions: 300x300px
Format: PNG with transparency
Style: Cartoon illustration, flat colors
File size: 95KB
```

### Example 3: Logo/Icon Style
```
Dimensions: 512x512px
Format: PNG with transparency
Style: Simple icon, minimal details
File size: 45KB
```

## Advanced Usage

### Dynamic Avatar Loading

If you want to implement dynamic avatar uploads through the UI:

1. **Create Upload Interface** (future feature)
2. **Store Uploaded Files** in `static/avatars/`
3. **Update Avatar Config** to refresh
4. **Reload Application** to see changes

### Avatar Caching

The system caches avatar data URLs for performance. To force refresh:
1. Rename the file temporarily
2. Restart application
3. Rename back to original name
4. Restart again

### Multiple Avatar Sets

To support multiple themes/styles:
1. Create subdirectories: `avatars/theme1/`, `avatars/theme2/`
2. Modify `avatars_config.py` to support theme parameter
3. Add theme selection to UI

## Best Practices

### ✅ Do
- Use consistent style across all avatars
- Test at actual display size (120px circle)
- Optimize file sizes
- Use transparent backgrounds
- Keep backups of originals

### ❌ Don't
- Use rectangular images (use square)
- Exceed 500KB file size
- Use low resolution sources
- Forget to test all agents
- Use copyrighted images without permission

## Support

Need help with avatars?
- Check the README in `static/avatars/` directory
- Review console logs for errors
- Verify file naming matches agent IDs exactly
- Contact support if issues persist

Happy customizing! 🎨