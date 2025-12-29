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
    .login-form-container {
        max-width: 400px;
        margin: 0 auto;
        padding: 30px 40px;
        background: linear-gradient(145deg, #ffffff, #f0f9fa);
        border-radius: 20px;
        box-shadow: 0 10px 40px rgba(0,172,193,0.2);
    }
    .login-form-container h3 {
        text-align: center;
        margin-bottom: 20px;
    }
    .stTextInput > div > div > input {
        border-radius: 10px;
        border: 2px solid #e0f7fa;
        padding: 12px;
    }
    .stTextInput > div > div > input:focus {
        border-color: #00acc1;
        box-shadow: 0 0 0 3px rgba(0,172,193,0.1);
    }
    </style>
    """, unsafe_allow_html=True)
    
    # Floating logo without container
    st.markdown("""
    <div class="login-logo-container">
        <div class="login-logo">🦷</div>
        <div class="login-title">Dental IQ</div>
        <div class="login-subtitle">Váš administrativní tým</div>
    </div>
    """, unsafe_allow_html=True)
    
    # Create centered columns for form
    col1, col2, col3 = st.columns([1, 2, 1])
    
    with col2:
        # Form container with background
        st.markdown('<div class="login-form-container">', unsafe_allow_html=True)
        st.markdown("### Přihlášení")
        
        # Login form
        with st.form("login_form", clear_on_submit=False):
            user_id = st.text_input(
                "User ID",
                placeholder="Zadejte vaše uživatelské jméno",
                help="Vaše uživatelské ID"
            )
            
            client_id = st.text_input(
                "Client ID",
                placeholder="Zadejte Client ID",
                help="ID vaší kliniky/organizace"
            )
            
            password = st.text_input(
                "Heslo",
                type="password",
                placeholder="Zadejte heslo",
                help="Vaše heslo"
            )
            
            submit = st.form_submit_button(
                "🔐 Přihlásit se",
                use_container_width=True
            )
            
            if submit:
                if not user_id or not client_id or not password:
                    st.error("⚠️ Vyplňte prosím všechna pole")
                else:
                    # Verify credentials
                    user_info = verify_credentials(user_id, client_id, password)
                    
                    if user_info:
                        login_user(user_info)
                        st.success(f"✅ Přihlášení úspěšné! Vítejte, {user_info['name']}")
                        st.rerun()
                    else:
                        st.error("❌ Neplatné přihlašovací údaje. Zkuste to znovu.")
        
        st.markdown('</div>', unsafe_allow_html=True)