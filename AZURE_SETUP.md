# Azure OpenAI Setup Guide

## Environment Variables

To connect the chatbot to Azure OpenAI, you need to set the following environment variables:

```bash
export AZURE_OPENAI_ENDPOINT="https://your-resource-name.openai.azure.com/"
export AZURE_OPENAI_API_KEY="your-api-key-here"
export AZURE_OPENAI_API_VERSION="2024-02-15-preview"
export AZURE_OPENAI_DEPLOYMENT_NAME="gpt-4"
```

## Configuration

1. **AZURE_OPENAI_ENDPOINT**: Your Azure OpenAI resource endpoint URL
   - Format: `https://<your-resource-name>.openai.azure.com/`
   - Find this in your Azure Portal under your OpenAI resource

2. **AZURE_OPENAI_API_KEY**: Your Azure OpenAI API key
   - Find this in Azure Portal under "Keys and Endpoint"
   - You can use either KEY1 or KEY2

3. **AZURE_OPENAI_API_VERSION**: API version (default: "2024-02-15-preview")
   - Check available versions in Azure Portal

4. **AZURE_OPENAI_DEPLOYMENT_NAME**: Name of your deployed model
   - This is the deployment name you created in Azure Portal
   - Common names: "gpt-4", "gpt-35-turbo", etc.

## Installation

Install the required package:

```bash
pip install openai>=1.12.0
```

Or install all requirements:

```bash
pip install -r requirements.txt
```

## How It Works

The chatbot:
1. Receives user messages from the frontend
2. Builds context from all agent data (sample/simulation data)
3. Sends prompt to Azure OpenAI with:
   - System prompt defining Axel's role
   - Context from all agents (KPIs, sample data)
   - Chat history (last 10 messages)
   - User's current message
4. Returns AI response to the user

## Production Considerations

The current implementation includes ALL agent data in the context. In production:

1. **Filter data before sending**: Only include relevant agent data based on user query
2. **Limit context size**: Use only necessary fields to reduce token usage
3. **Add data filtering**: Implement pre-filtering logic in `build_context_from_agents_data()`
4. **Add rate limiting**: Prevent excessive API calls
5. **Add error handling**: Better error messages and retry logic
6. **Add caching**: Cache common queries to reduce API calls

## Testing

To test the integration:

1. Set environment variables
2. Start the application: `streamlit run main.py`
3. Click the chat button (💬) in the UI
4. Send a message like "Kolik hovorů zpracovala Isabella?"
5. You should receive an AI-generated response

## Troubleshooting

- **"Azure OpenAI není nakonfigurováno"**: Check that all environment variables are set
- **"Chyba při komunikaci s AI"**: Check your API key and endpoint URL
- **Timeout errors**: Check your network connection and Azure service status
- **Empty responses**: Check that your deployment name is correct

