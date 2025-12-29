"""
Configuration settings for Dental IQ application
"""

PAGE_CONFIG = {
    "page_title": "Dental IQ",
    "page_icon": "🦷",
    "layout": "wide"
}

CUSTOM_CSS = """
<style>
#MainMenu {visibility: hidden;}
footer {visibility: hidden;}
header {visibility: hidden;}
.stApp > header {visibility: hidden;}
.block-container {
    padding-top: 0rem !important;
    padding-bottom: 0rem !important;
}
iframe {
    display: block;
}
</style>
"""