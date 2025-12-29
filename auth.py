"""
Authentication module for Dental IQ
Handles user login, logout, and session management
"""
import hashlib
import streamlit as st

# Mock user database - in production, this would be a real database
USERS_DB = {
    "demo_user": {
        "client_id": "client001",
        "password_hash": hashlib.sha256("password123".encode()).hexdigest(),
        "name": "Demo User",
        "role": "user",
        "job_role": "admin"  # Can see all agents
    },
    "admin": {
        "client_id": "client001",
        "password_hash": hashlib.sha256("admin123".encode()).hexdigest(),
        "name": "Administrator",
        "role": "admin",
        "job_role": "admin"  # Can see all agents
    },
    "dr_novak": {
        "client_id": "clinic_dental",
        "password_hash": hashlib.sha256("dental2024".encode()).hexdigest(),
        "name": "Dr. Novák",
        "role": "user",
        "job_role": "doctor"  # Can only see Nora and Auditor
    },
    "receptionist": {
        "client_id": "clinic_dental",
        "password_hash": hashlib.sha256("reception123".encode()).hexdigest(),
        "name": "Recepční",
        "role": "user",
        "job_role": "receptionist"  # Can only see Isabella, Gabriel, Leo
    }
}

def hash_password(password: str) -> str:
    """Hash a password using SHA256"""
    return hashlib.sha256(password.encode()).hexdigest()

def verify_credentials(user_id: str, client_id: str, password: str) -> dict:
    """
    Verify user credentials
    Returns user info dict if successful, None otherwise
    """
    if user_id not in USERS_DB:
        return None
    
    user = USERS_DB[user_id]
    
    # Check client ID and password
    if user["client_id"] != client_id:
        return None
    
    if user["password_hash"] != hash_password(password):
        return None
    
    # Return user info without password hash
    return {
        "user_id": user_id,
        "client_id": client_id,
        "name": user["name"],
        "role": user["role"],
        "job_role": user.get("job_role", "admin")
    }

def login_user(user_info: dict):
    """Store user info in session state"""
    st.session_state.logged_in = True
    st.session_state.user_info = user_info
    st.session_state.show_welcome = True

def logout_user():
    """Clear user session"""
    st.session_state.logged_in = False
    st.session_state.user_info = None
    st.session_state.show_welcome = False
    # Clear other session data
    if "simulate_active" in st.session_state:
        st.session_state.simulate_active = False
    if "selected_agent" in st.session_state:
        st.session_state.selected_agent = ""
    if "chat_history" in st.session_state:
        st.session_state.chat_history = []

def is_logged_in() -> bool:
    """Check if user is logged in"""
    return st.session_state.get("logged_in", False)

def get_current_user() -> dict:
    """Get current logged in user info"""
    return st.session_state.get("user_info", None)

def init_auth_state():
    """Initialize authentication-related session state"""
    if "logged_in" not in st.session_state:
        st.session_state.logged_in = False
    if "user_info" not in st.session_state:
        st.session_state.user_info = None
    if "show_welcome" not in st.session_state:
        st.session_state.show_welcome = False