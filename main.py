import streamlit as st
from config import PAGE_CONFIG, CUSTOM_CSS
from data_simulator import DataSimulator
from agents_config import AGENTS_DATA
from ui_template import get_html_template
from auth import init_auth_state, is_logged_in, get_current_user, logout_user
from login_ui import render_login_page
import json

# Page configuration
st.set_page_config(**PAGE_CONFIG)

# Apply custom CSS
st.markdown(CUSTOM_CSS, unsafe_allow_html=True)

# Initialize session state
def init_session_state():
    init_auth_state()  # Initialize auth state first
    if "simulate_active" not in st.session_state:
        st.session_state.simulate_active = False
    if "selected_agent" not in st.session_state:
        st.session_state.selected_agent = ""
    if "chat_history" not in st.session_state:
        st.session_state.chat_history = []

init_session_state()

# Check for logout query parameter
query_params = st.query_params
if "logout" in query_params:
    logout_user()
    st.query_params.clear()
    st.rerun()

# Check if user is logged in
if not is_logged_in():
    render_login_page()
    st.stop()

# Get current user info
current_user = get_current_user()

# Check if we should show welcome message
show_welcome_msg = st.session_state.get("show_welcome", False)
if show_welcome_msg:
    st.session_state.show_welcome = False  # Clear it immediately

# Initialize data simulator
simulator = DataSimulator()

# Generate simulation data based on state
def should_simulate(agent_id):
    if not st.session_state.simulate_active:
        return False
    if st.session_state.selected_agent == "":
        return False
    return agent_id == st.session_state.selected_agent

# Update agents with simulated data
agents_data = AGENTS_DATA.copy()
for agent in agents_data:
    agent_id = agent["id"]
    if should_simulate(agent_id):
        # Add simulated rows based on agent type
        if agent_id == "isabella":
            agent["rows"].extend(simulator.simulate_isabella(12))
        elif agent_id == "gabriel":
            agent["rows"].extend(simulator.simulate_gabriel(12))
        elif agent_id == "nora":
            agent["rows"].extend(simulator.simulate_nora(12))
        elif agent_id == "leo":
            agent["rows"].extend(simulator.simulate_leo(12))
        elif agent_id == "auditor":
            agent["rows"].extend(simulator.simulate_auditor(5))

# Prepare payload
payload = {
    "agents": agents_data,
    "simulate_active": st.session_state.simulate_active,
    "selected_agent": st.session_state.selected_agent,
    "user_info": {
        "name": current_user["name"],
        "user_id": current_user["user_id"],
        "role": current_user["role"],
        "job_role": current_user.get("job_role", "admin")
    },
    "show_welcome": show_welcome_msg
}

payload_json = json.dumps(payload, ensure_ascii=False)

# Render HTML component
html_content = get_html_template().replace('__PAYLOAD__', payload_json)
st.components.v1.html(html_content, height=800, scrolling=False)