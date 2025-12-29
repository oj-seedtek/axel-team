# Dental IQ - Project Structure

## Overview
Modular Streamlit application for dental practice management with AI agents.

## File Structure

```
dental-iq/
├── main.py                 # Application entry point
├── config.py               # Configuration settings
├── auth.py                 # Authentication module
├── login_ui.py             # Login page UI
├── data_simulator.py       # Data simulation utilities
├── agents_config.py        # Agent definitions and static data
├── ui_template.py          # HTML/CSS template
├── static/
│   └── js/
│       └── main.js         # JavaScript functionality
├── README.md               # This file
├── SETUP.md                # Installation and setup guide
└── requirements.txt        # Python dependencies
```

## Files Description

### main.py
- Entry point for the Streamlit application
- Handles authentication flow (login check)
- Initializes session state
- Coordinates data simulation
- Renders the UI component
- Handles logout actions

### config.py
- Page configuration (title, icon, layout)
- Custom CSS for hiding Streamlit default elements
- Environment-specific settings

### auth.py
- User authentication and session management
- Password hashing and verification
- Mock user database (for demo purposes)
- Login/logout functions
- User role management (user/admin)

### login_ui.py
- Login page UI rendering
- Form handling for user credentials
- Demo credentials display
- Error and success messaging

### data_simulator.py
- `DataSimulator` class with methods for each agent type
- Generates realistic test data for:
  - Isabella (phone reception)
  - Leo (patient cards)
  - Gabriel (email monitoring)
  - Nora (patient summaries)
  - Auditor (record checking)

### agents_config.py
- Static configuration for all 5 agents
- Base data rows, KPIs, and simulation tasks
- Agent metadata (avatars, roles, notifications)

### ui_template.py
- Complete HTML template with embedded CSS
- Loads and embeds JavaScript from `static/js/main.js`
- Returns HTML string with placeholder for data payload
- CSS includes all styling for agents, popups, modals, chat

### static/js/main.js
- Complete interactive JavaScript functionality
- Agent positioning and rendering logic
- Modal and popup management
- Chat interface functionality
- Configuration panel handling
- Event listeners and user interactions

## Running the Application

```bash
streamlit run main.py
```

## Key Features

1. **User Authentication**: Secure login system with user roles
2. **Circular Agent Layout**: 5 AI agents arranged in a circle
3. **Simulation Mode**: Test data generation for selected agents
4. **Agent Details**: Click agents to see detailed information
5. **Mini KPIs**: Click center to show/hide KPI popups
6. **Configuration Panel**: Customize agent settings
7. **AI Chat**: Interactive assistant interface
8. **User Menu**: Personal settings, admin panel, and logout functionality

## Development Notes

### Demo User Accounts

The application includes three demo accounts:

**Regular User:**
- User ID: `demo_user`
- Client ID: `client001`
- Password: `password123`

**Administrator:**
- User ID: `admin`
- Client ID: `client001`
- Password: `admin123`

**Doctor:**
- User ID: `dr_novak`
- Client ID: `clinic_dental`
- Password: `dental2024`

### Adding a New Agent

1. Add agent data to `agents_config.py`:
   ```python
   {
       "id": "new_agent",
       "name": "Agent Name",
       "role": "Agent Role",
       # ... other fields
   }
   ```

2. Add simulation method to `data_simulator.py`:
   ```python
   def simulate_new_agent(self, n=8):
       # Generate data
       return rows
   ```

3. Update `main.py` to include the new agent in simulation logic

### Future Improvements

- [ ] Add backend API integration
- [ ] Implement real data sources
- [ ] Add user authentication
- [ ] Create agent configuration persistence
- [ ] Add unit tests
- [ ] Implement logging system
- [ ] Add data export functionality
- [ ] Implement real-time updates

## Dependencies

```
streamlit>=1.28.0
```

## License

Proprietary - Dental IQ