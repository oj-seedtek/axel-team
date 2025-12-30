"""
Login page UI components
"""
import streamlit as st
from auth import verify_credentials, login_user


def render_login_page():
    """Render the login page"""

    # Custom CSS for login page
    st.markdown("""
    <style>
    .login-logo-container {
        text-align: center;
        margin: 30px auto 20px auto;
    }
    .login-logo {
        width: 80px;
        height: 80px;
        margin: 0 auto 10px auto;
        border-radius: 50%;
        background: linear-gradient(135deg, #00acc1, #00e5ff);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 36px;
        box-shadow: 0 6px 20px rgba(0,172,193,0.3);
        cursor: pointer;
        transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        animation: logoPulse 2s ease-in-out infinite;
    }
    .login-logo:hover {
        transform: scale(1.15) rotate(5deg);
        box-shadow: 0 12px 40px rgba(0,172,193,0.5),
                    0 0 30px rgba(0,229,255,0.4);
    }
    @keyframes logoPulse {
        0%, 100% {
            box-shadow: 0 6px 20px rgba(0,172,193,0.3);
        }
        50% {
            box-shadow: 0 6px 20px rgba(0,172,193,0.3),
                        0 0 20px 10px rgba(0,229,255,0.3);
        }
    }
    .login-title {
        color: #007c91;
        font-size: 22px;
        font-weight: 800;
        margin-bottom: 3px;
    }
    .login-subtitle {
        color: #00acc1;
        font-size: 12px;
        font-style: italic;
        margin-bottom: 25px;
    }

    /* Center form */
    div[data-testid="stForm"] {
        max-width: 400px !important;
        margin: 30px auto !important;
        background: transparent !important;
        border: none !important;
        box-shadow: none !important;
    }

    /* Inputs */
    div[data-testid="stForm"] .stTextInput {
        margin-bottom: 16px !important;
    }
    div[data-testid="stForm"] input {
        border-radius: 12px !important;
        border: 2px solid #e0f7fa !important;
        padding: 12px 16px !important;
    }
    div[data-testid="stForm"] input:focus {
        border-color: #00acc1 !important;
        box-shadow: 0 0 0 4px rgba(0,172,193,0.1) !important;
        outline: none !important;
    }

    /* Hide password eye */
    div[data-testid="stForm"] .stTextInput button {
        display: none !important;
    }

    /* === GUARANTEED SUBMIT BUTTON FIX === */

    /* Center submit button container */
    div[data-testid="stForm"] div:has(> button[type="submit"]) {
        display: flex !important;
        justify-content: center !important;
        margin-top: 24px !important;
    }

    /* Submit button */
    div[data-testid="stForm"] button[type="submit"] {
        background: linear-gradient(135deg, #7dd1fc, #c0ebff) !important;
        color: #006d7a !important;
        border: 2px solid #5ac8fa !important;
        border-radius: 12px !important;
        padding: 12px 36px !important;
        font-size: 15px !important;
        font-weight: 600 !important;
        min-width: 170px !important;
        cursor: pointer !important;
        box-shadow: 0 4px 12px rgba(125, 209, 252, 0.3) !important;
        transition: all 0.3s ease !important;
    }

    div[data-testid="stForm"] button[type="submit"]:hover {
        background: linear-gradient(135deg, #5ac8fa, #a8e0ff) !important;
        border-color: #00acc1 !important;
        transform: translateY(-2px) !important;
    }
    </style>
    """, unsafe_allow_html=True)

    # Logo
    st.markdown("""
    <div class="login-logo-container">
        <div class="login-logo">🦷</div>
        <div class="login-title">Dental IQ</div>
        <div class="login-subtitle">Váš administrativní tým</div>
    </div>
    """, unsafe_allow_html=True)

    # Login form
    with st.form("login_form", clear_on_submit=False):
        user_id = st.text_input(
            "User ID",
            placeholder="Zadejte vaše uživatelské jméno"
        )

        client_id = st.text_input(
            "Client ID",
            placeholder="Zadejte Client ID"
        )

        password = st.text_input(
            "Heslo",
            type="password",
            placeholder="Zadejte heslo"
        )

        submit = st.form_submit_button("Přihlásit se")

        if submit:
            if not user_id or not client_id or not password:
                st.error("⚠️ Vyplňte prosím všechna pole")
            else:
                user_info = verify_credentials(user_id, client_id, password)
                if user_info:
                    login_user(user_info)
                    st.success(f"✅ Přihlášení úspěšné! Vítejte, {user_info['name']}")
                    st.rerun()
                else:
                    st.error("❌ Neplatné přihlašovací údaje. Zkuste to znovu.")
