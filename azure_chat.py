"""
Azure OpenAI chat integration
"""
import os
import json
from openai import AzureOpenAI
from typing import Dict, List, Optional

# Azure OpenAI configuration
AZURE_OPENAI_ENDPOINT = os.getenv("AZURE_OPENAI_ENDPOINT", "")
AZURE_OPENAI_API_KEY = os.getenv("AZURE_OPENAI_API_KEY", "")
AZURE_OPENAI_API_VERSION = os.getenv("AZURE_OPENAI_API_VERSION", "2024-02-15-preview")
AZURE_OPENAI_DEPLOYMENT_NAME = os.getenv("AZURE_OPENAI_DEPLOYMENT_NAME", "gpt-4")

def get_azure_client() -> Optional[AzureOpenAI]:
    """Initialize Azure OpenAI client"""
    if not AZURE_OPENAI_ENDPOINT or not AZURE_OPENAI_API_KEY:
        return None
    try:
        return AzureOpenAI(
            api_key=AZURE_OPENAI_API_KEY,
            api_version=AZURE_OPENAI_API_VERSION,
            azure_endpoint=AZURE_OPENAI_ENDPOINT
        )
    except Exception as e:
        print(f"Error initializing Azure OpenAI client: {e}")
        return None

def build_context_from_agents_data(agents_data: List[Dict]) -> str:
    """
    Build context string from agents data for prompt template
    This will be filtered/pre-filtered in production
    """
    context_parts = []
    
    for agent in agents_data:
        agent_id = agent.get("id", "")
        agent_name = agent.get("name", "")
        agent_role = agent.get("role", "")
        
        # Get KPIs
        kpis = agent.get("kpis", [])
        kpi_str = ", ".join([f"{k[0]}: {k[1]}" for k in kpis])
        
        # Get rows (sample data)
        rows = agent.get("rows", [])
        if rows:
            # Take first 5 rows as sample
            sample_rows = rows[:5]
            rows_summary = []
            for row in sample_rows:
                row_str = ", ".join([f"{k}: {v}" for k, v in row.items() if v])
                rows_summary.append(f"  - {row_str}")
            
            context_parts.append(f"""
Agent: {agent_name} ({agent_role})
ID: {agent_id}
KPIs: {kpi_str}
Sample Data:
{chr(10).join(rows_summary)}
""")
    
    return "\n".join(context_parts)

def build_system_prompt() -> str:
    """Build system prompt for the AI assistant"""
    return """Jsi Axel, inteligentní asistent pro zubní ordinaci. Pomáháš personálu s administrativními úkoly a dotazy týkajícími se agentů a jejich dat.

Tvoje role:
- Pomáhat s dotazy o agentech (Isabella, Gabriel, Leo, Nora, Auditor)
- Poskytovat informace o datech a statistikách
- Navrhovat řešení problémů
- Odpovídat v češtině, přátelsky a profesionálně

Máš přístup k datům všech agentů včetně:
- KPIs a statistik
- Ukázkových dat z jejich práce
- Informací o jejich rolích

Odpovídej stručně, ale informativně. Pokud nevíš odpověď, upřímně to přiznej."""

def chat_with_azure(user_message: str, agents_data: List[Dict], chat_history: List[Dict] = None) -> str:
    """
    Send message to Azure OpenAI and get response
    
    Args:
        user_message: User's message
        agents_data: List of agent data dictionaries
        chat_history: Previous chat messages (optional)
    
    Returns:
        AI response text
    """
    client = get_azure_client()
    if not client:
        return "Chyba: Azure OpenAI není nakonfigurováno. Zkontrolujte proměnné prostředí AZURE_OPENAI_ENDPOINT a AZURE_OPENAI_API_KEY."
    
    try:
        # Build context from agents data
        context = build_context_from_agents_data(agents_data)
        
        # Build messages
        messages = [
            {"role": "system", "content": build_system_prompt()},
            {"role": "system", "content": f"Kontext z agentů:\n{context}\n\nPoužij tyto informace k zodpovězení dotazů uživatele."}
        ]
        
        # Add chat history if available
        if chat_history:
            for msg in chat_history[-10:]:  # Last 10 messages for context
                if msg.get("who") == "user":
                    messages.append({"role": "user", "content": msg.get("text", "")})
                elif msg.get("who") == "bot":
                    messages.append({"role": "assistant", "content": msg.get("text", "")})
        
        # Add current user message
        messages.append({"role": "user", "content": user_message})
        
        # Call Azure OpenAI
        response = client.chat.completions.create(
            model=AZURE_OPENAI_DEPLOYMENT_NAME,
            messages=messages,
            temperature=0.7,
            max_tokens=500
        )
        
        return response.choices[0].message.content.strip()
        
    except Exception as e:
        return f"Chyba při komunikaci s AI: {str(e)}"

