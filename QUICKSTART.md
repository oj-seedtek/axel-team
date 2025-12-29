# Quick Start Guide

Get Dental IQ up and running in 5 minutes!

## 🚀 5-Minute Setup

### Step 1: Create Project (1 min)

```bash
# Create directory
mkdir dental-iq
cd dental-iq

# Create subdirectories
mkdir -p static/js
```

### Step 2: Create Files (1 min)

Create these empty files:
```bash
touch main.py config.py auth.py login_ui.py
touch data_simulator.py agents_config.py ui_template.py
touch static/js/main.js
touch requirements.txt
```

### Step 3: Copy Code (2 min)

Copy the content from the artifacts into each file:

| File | Content Source |
|------|----------------|
| `main.py` | main.py artifact |
| `config.py` | config.py artifact |
| `auth.py` | auth.py artifact |
| `login_ui.py` | login_ui.py artifact |
| `data_simulator.py` | data_simulator.py artifact |
| `agents_config.py` | agents_config.py artifact |
| `ui_template.py` | ui_template.py artifact |
| `static/js/main.js` | static/js/main.js artifact |
| `requirements.txt` | requirements.txt artifact |

### Step 4: Install & Run (1 min)

```bash
# Install dependencies
pip install streamlit

# Run the app
streamlit run main.py
```

The app will open at `http://localhost:8501`

## 🔐 First Login

Use any of these demo accounts:

**Quick Test (Recommended):**
```
User ID: demo_user
Client ID: client001
Password: password123
```

**Admin Access:**
```
User ID: admin
Client ID: client001
Password: admin123
```

**Medical Professional:**
```
User ID: dr_novak
Client ID: clinic_dental
Password: dental2024
```

## ✅ Verify Installation

After login, you should see:
1. ✅ Welcome message: "🎉 Vítej v našem AI týmu"
2. ✅ 5 agents in a circle
3. ✅ User icon (👤) in top-right
4. ✅ AI chat icon (💬) available

## 🎯 Quick Feature Tour

### 1. View Agents (10 seconds)
- See 5 AI agents in circular layout
- Hover to see animations

### 2. Agent Details (30 seconds)
- Click any agent
- View KPIs and data table
- Close with × or click outside

### 3. Mini KPIs (20 seconds)
- Click center tooth icon (🦷)
- See mini KPI popups around agents
- Click again to hide

### 4. Simulation Mode (1 min)
- Click ▶️ button
- Select an agent
- See live simulation data
- Click agent to see tasks

### 5. Configuration (30 seconds)
- Click ⚙️ button
- Select agent
- View/change settings
- Save configuration

### 6. AI Chat (30 seconds)
- Click 💬 button
- Type a message
- See typing indicator
- Get demo response

### 7. User Menu (20 seconds)
- Click 👤 icon
- See your name and role
- Try "Osobní nastavení"
- Test logout

## 🎓 Tutorial Path

### Beginner (5 minutes)
1. Login with demo account
2. Click each agent once
3. Try the center button
4. Send one chat message
5. Logout

### Intermediate (15 minutes)
1. Enable simulation mode
2. Test all 5 agents
3. Review simulation tasks
4. Configure agent settings
5. Use AI chat for questions
6. Test admin features (if admin)

### Advanced (30 minutes)
1. Review all agents' data
2. Test different user accounts
3. Explore configuration options
4. Review code structure
5. Read documentation
6. Plan customizations

## 📋 Quick Reference

### Keyboard Shortcuts
- `Enter` in chat - Send message
- `Ctrl + F5` - Hard refresh
- `Esc` - Close modals (browser default)

### UI Elements
- 🦷 Center - Toggle mini KPIs
- 👤 User - User menu
- ⚙️ Gear - Configuration
- 💬 Chat - AI assistant
- ▶️ Play - Simulation mode

### Agent Colors
- 🔵 Blue border - Selected
- 🔴 Red border - Simulated/Active
- ⚪ White - Inactive

## ⚡ Common Tasks

### Start Simulation
```
1. Click ▶️
2. Select agent from dropdown
3. Click agent to see tasks
```

### View All Agent Data
```
1. Turn off simulation (▶️)
2. Click each agent
3. Review table data
```

### Change Settings
```
1. Click ⚙️
2. Select agent
3. Modify settings
4. Click "Uložit nastavení"
```

### Log Out
```
1. Click 👤
2. Click "Odhlásit se"
3. Confirm dialog
```

## 🐛 Quick Troubleshooting

| Problem | Quick Fix |
|---------|-----------|
| Won't login | Check caps lock, try `demo_user` |
| No agents | Hard refresh (Ctrl + F5) |
| Simulation not working | Click ▶️, select agent |
| Can't logout | Click 👤, then "Odhlásit se" |
| JavaScript errors | Check browser console (F12) |

## 📚 Next Steps

After the quick start:

1. **Read Full Documentation**
   - `README.md` - Project overview
   - `AUTHENTICATION.md` - Login guide
   - `SETUP.md` - Detailed setup

2. **Explore Features**
   - Try all 5 agents
   - Test simulation mode
   - Configure settings

3. **Customize**
   - Review code structure
   - Modify agent configurations
   - Add new features

4. **Production Planning**
   - Read `SECURITY.md`
   - Plan database integration
   - Design real AI backends

## 🎉 You're Ready!

You should now have:
- ✅ Working Dental IQ application
- ✅ Understanding of basic features
- ✅ Demo account access
- ✅ Knowledge of UI layout

**Enjoy exploring your AI administrative team!** 🦷

---

Need help? Check:
- 📖 `README.md` for full documentation
- 🔧 `SETUP.md` for detailed setup
- 🔐 `AUTHENTICATION.md` for login help
- 🛡️ `SECURITY.md` for security info