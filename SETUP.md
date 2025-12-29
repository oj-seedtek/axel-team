# Dental IQ - Setup Guide

## Installation

### 1. Create Project Structure

```bash
mkdir dental-iq
cd dental-iq

# Create directories
mkdir -p static/js

# Create files
touch main.py
touch config.py
touch auth.py
touch login_ui.py
touch data_simulator.py
touch agents_config.py
touch ui_template.py
touch static/js/main.js
touch README.md
touch requirements.txt
```

### 2. Install Dependencies

Create `requirements.txt`:
```
streamlit>=1.28.0
```

Install:
```bash
pip install -r requirements.txt
```

### 3. Copy Code Files

Copy the content from each artifact into the corresponding file:
- `main.py` - Application entry point with authentication
- `config.py` - Configuration settings
- `auth.py` - Authentication module
- `login_ui.py` - Login page UI
- `data_simulator.py` - Data simulation utilities
- `agents_config.py` - Agent definitions
- `ui_template.py` - HTML/CSS template
- `static/js/main.js` - JavaScript functionality
- `README.md` - Documentation

### 4. Verify File Structure

Your directory should look like this:
```
dental-iq/
├── main.py
├── config.py
├── auth.py
├── login_ui.py
├── data_simulator.py
├── agents_config.py
├── ui_template.py
├── static/
│   └── js/
│       └── main.js
├── requirements.txt
├── README.md
└── SETUP.md (this file)
```

## Running the Application

### First Time Setup

1. **Login Credentials**: Use one of the demo accounts (see below)
2. **Welcome Message**: On successful login, you'll see "Vítej v našem AI týmu"
3. **Main Dashboard**: Access all AI agent features

### Demo Accounts

**Regular User:**
```
User ID: demo_user
Client ID: client001
Password: password123
```

**Administrator:**
```
User ID: admin
Client ID: client001  
Password: admin123
```

**Doctor:**
```
User ID: dr_novak
Client ID: clinic_dental
Password: dental2024
```

### Development Mode

```bash
streamlit run main.py
```

The application will open in your default browser at `http://localhost:8501`

### Production Mode

For production deployment, consider:

1. **Using Streamlit Cloud**:
   - Push to GitHub
   - Connect to Streamlit Cloud
   - Deploy directly

2. **Using Docker**:
   ```dockerfile
   FROM python:3.9-slim
   WORKDIR /app
   COPY requirements.txt .
   RUN pip install -r requirements.txt
   COPY . .
   EXPOSE 8501
   CMD ["streamlit", "run", "main.py"]
   ```

3. **Using a WSGI Server**:
   - Not directly applicable to Streamlit
   - Use Streamlit's built-in server with process manager like PM2

## Configuration

### Environment Variables

You can set environment variables in a `.env` file:
```bash
STREAMLIT_SERVER_PORT=8501
STREAMLIT_SERVER_ADDRESS=0.0.0.0
```

### Streamlit Config

Create `.streamlit/config.toml`:
```toml
[server]
port = 8501
enableCORS = false
enableXsrfProtection = true

[browser]
gatherUsageStats = false
```

## Troubleshooting

### Issue: Login page not showing

**Solution**: Ensure all authentication files are in place (`auth.py`, `login_ui.py`).

### Issue: Cannot log out

**Solution**: 
1. Click the user icon (👤) in the top right
2. Select "Odhlásit se" from the dropdown
3. Confirm the logout dialog

### Issue: "Vítej v našem AI týmu" message not appearing

**Solution**: The message only appears on first login. Clear session state by logging out and in again.

### Issue: Encoding errors with Czech characters

**Solution**: Ensure all files are saved with UTF-8 encoding.

### Issue: Agents not appearing

**Solution**: 
1. Check browser console for JavaScript errors
2. Verify `agents_config.py` has valid data
3. Ensure `window.APP_DATA` is properly injected

### Issue: Simulation mode not working

**Solution**:
1. Check `data_simulator.py` methods are returning correct format
2. Verify session state is properly initialized
3. Check dropdown selection is triggering re-render

## Development Tips

### Hot Reload

Streamlit automatically reloads when Python files change. For JavaScript changes:
1. Save `static/js/main.js`
2. Force browser refresh (Ctrl+F5 or Cmd+Shift+R)

### Debugging

1. **Python errors**: Check terminal/console
2. **JavaScript errors**: Check browser console (F12)
3. **State issues**: Use Streamlit's session state viewer

### Adding New Features

1. **New Agent**: 
   - Add to `agents_config.py`
   - Add simulator method in `data_simulator.py`
   - Update main.py simulation logic

2. **New UI Component**:
   - Add HTML/CSS to `ui_template.py`
   - Add JavaScript logic to `static/js/main.js`

3. **New Configuration**:
   - Add to `config.py`
   - Update `main.py` to use the config

## Performance Optimization

### For Large Datasets

If simulating more data:
1. Use pagination in tables
2. Implement lazy loading
3. Cache data with `@st.cache_data`

### For Better UI Performance

1. Minimize re-renders by managing state carefully
2. Use `st.fragment` for isolated components
3. Optimize JavaScript with debouncing/throttling

## Security Considerations

1. **Input Validation**: Validate all user inputs
2. **Authentication**: Add user authentication if needed
3. **Data Privacy**: Ensure patient data is properly protected
4. **HTTPS**: Use HTTPS in production

## Next Steps

- [ ] Set up version control (Git)
- [ ] Configure CI/CD pipeline
- [ ] Add unit tests
- [ ] Set up monitoring/logging
- [ ] Configure backup strategy
- [ ] Add user authentication
- [ ] Implement real data sources
- [ ] Add API integrations

## Support

For issues or questions:
1. Check README.md for documentation
2. Review code comments
3. Check Streamlit documentation
4. Review browser console for errors

## License

Proprietary - Dental IQ