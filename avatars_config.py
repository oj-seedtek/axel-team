"""
Avatar configuration for agents
Place your custom PNG avatars in the 'static/avatars/' directory
"""
import os
import base64

# Default emoji avatars (fallback)
DEFAULT_AVATARS = {
    "isabella": "👩🏽‍💼",
    "leo": "👨🏼‍💼", 
    "gabriel": "🕵🏼‍♂️",
    "nora": "👩🏼‍⚕️",
    "auditor": "🛡️"
}

def get_avatar_path(agent_id: str) -> str:
    """Get the path to the avatar file for an agent"""
    avatars_dir = os.path.join(os.path.dirname(__file__), 'static', 'avatars')
    avatar_file = os.path.join(avatars_dir, f"{agent_id}.png")
    return avatar_file if os.path.exists(avatar_file) else None

def get_avatar_data_url(agent_id: str) -> str:
    """
    Get avatar as data URL for embedding in HTML
    Returns either:
    - data:image/png;base64,... for custom PNG
    - emoji character for default
    """
    avatar_path = get_avatar_path(agent_id)
    
    if avatar_path and os.path.exists(avatar_path):
        # Read and encode PNG file
        try:
            with open(avatar_path, 'rb') as f:
                image_data = f.read()
                base64_data = base64.b64encode(image_data).decode('utf-8')
                return f"data:image/png;base64,{base64_data}"
        except Exception as e:
            print(f"Error loading avatar for {agent_id}: {e}")
            return DEFAULT_AVATARS.get(agent_id, "👤")
    else:
        # Return emoji fallback
        return DEFAULT_AVATARS.get(agent_id, "👤")

def get_avatar_html(agent_id: str, size: str = "44px") -> str:
    """
    Generate HTML for displaying avatar
    """
    avatar = get_avatar_data_url(agent_id)
    
    if avatar.startswith("data:image"):
        # It's a custom image - use img tag
        return f'<img src="{avatar}" style="width:{size};height:{size};border-radius:50%;object-fit:cover;" alt="{agent_id}">'
    else:
        # It's an emoji - use div with emoji
        return f'<div style="font-size:{size};">{avatar}</div>'

def setup_avatars_directory():
    """
    Create avatars directory if it doesn't exist
    """
    avatars_dir = os.path.join(os.path.dirname(__file__), 'static', 'avatars')
    os.makedirs(avatars_dir, exist_ok=True)
    
    # Create a README file in the avatars directory
    readme_path = os.path.join(avatars_dir, 'README.md')
    if not os.path.exists(readme_path):
        with open(readme_path, 'w') as f:
            f.write("""# Agent Avatars

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
""")
    
    return avatars_dir

# Initialize avatars directory on import
setup_avatars_directory()