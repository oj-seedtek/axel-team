"""
Icons configuration for the application
All icons can be easily changed here according to design requirements
"""

# Main application icons
ICONS = {
    # Header icons
    "logo": "🦷",
    "simulate": "▶️",
    "config": "⚙️",
    "user": "👤",
    "chat": "💬",
    
    # Chat icons
    "chat_bot": "🤖",
    "chat_close": "✕",
    
    # Agent avatars (fallback emojis - can be replaced with custom images)
    "agent_isabella": "👩",
    "agent_leo": "👨",
    "agent_gabriel": "👨‍💼",
    "agent_nora": "👩‍⚕️",
    "agent_auditor": "👨‍💻",
    
    # Status icons
    "notification": "!",
    "check": "✅",
    "warning": "⚠️",
    "clock": "⏳",
    "phone": "📞",
    "email": "📪",
    "file": "📘",
    "summary": "🧾",
    "audit": "📋",
    
    # Action icons
    "save": "💾",
    "apply": "⚡",
    "maximize": "⛶",
    "close": "×",
    
    # User menu icons
    "settings": "⚙️",
    "admin": "🛡️",
    "logout": "🚪",
    
    # Priority icons
    "priority_high": "🔴",
    "priority_medium": "🟡",
    "priority_low": "🟢",
}

def get_icon(icon_name: str) -> str:
    """Get icon by name, returns emoji or empty string if not found"""
    return ICONS.get(icon_name, "")

def set_icon(icon_name: str, icon_value: str):
    """Set or update an icon"""
    ICONS[icon_name] = icon_value



