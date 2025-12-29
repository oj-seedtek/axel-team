# Agent Avatars

Place your custom PNG avatar images in this directory.

## File Naming Convention
Name your avatar files according to the agent ID:
- `isabella.png` - For Isabella (Reception)
- `leo.png` - For Leo (Patient cards)
- `gabriel.png` - For Gabriel (Email monitoring)
- `nora.png` - For Nora (Patient summaries)
- `auditor.png` - For Auditor (Record checking)

## Image Requirements
- Format: PNG (transparent background recommended)
- Size: Recommended 200x200 pixels or larger
- Aspect ratio: Square (1:1)
- File size: Keep under 500KB for best performance

## Usage
Once you place the PNG files here, the system will automatically:
1. Detect the custom avatars
2. Convert them to base64 data URLs
3. Display them in the circular agent buttons
4. Fall back to emoji avatars if PNG not found

## Example Structure
```
static/avatars/
├── README.md (this file)
├── isabella.png
├── leo.png
├── gabriel.png
├── nora.png
└── auditor.png
```
