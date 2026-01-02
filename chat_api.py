"""
Chat API endpoint handler for Streamlit
"""
import streamlit as st
from azure_chat import chat_with_azure
import json

def handle_chat_request(request_data):
    """Handle chat request and return response"""
    if not request_data:
        return {"error": "No request data"}
    
    user_message = request_data.get("message", "")
    agents_data = request_data.get("agents_data", [])
    chat_history = request_data.get("chat_history", [])
    
    if not user_message:
        return {"error": "No message provided"}
    
    # Get AI response
    response = chat_with_azure(user_message, agents_data, chat_history)
    
    return {"response": response}

