# Authentication User Guide

## Login Process

### Step 1: Access the Application
Navigate to your Dental IQ application URL (default: `http://localhost:8501`)

### Step 2: Enter Credentials
Fill in the three required fields:
- **User ID**: Your unique username
- **Client ID**: Your clinic/organization ID
- **Password**: Your password

### Step 3: Login
Click the "🔐 Přihlásit se" button

### Step 4: Welcome
On successful login, you'll see:
> 🎉 Vítej v našem AI týmu, [Your Name]!

## Demo Accounts

### Regular User Account
Perfect for testing standard features:
```
User ID: demo_user
Client ID: client001
Password: password123
```

**Access Level:** Standard user features
- View agents
- Run simulations
- Use AI chat
- Personal settings

### Administrator Account
Full access including admin features:
```
User ID: admin
Client ID: client001
Password: admin123
```

**Access Level:** All features including
- All standard user features
- Admin panel access (coming soon)
- System configuration

### Doctor Account
Specialized for medical professionals:
```
User ID: dr_novak
Client ID: clinic_dental
Password: dental2024
```

**Access Level:** Standard user features
- Clinical agent access
- Patient data views
- Medical summaries

## User Menu

### Accessing User Menu
Click the user icon (👤) in the top-right corner

### Menu Options

#### ⚙️ Osobní nastavení (Personal Settings)
Configure your personal preferences:
- Language settings
- Notification preferences
- Display options
- *Coming soon*

#### 🛡️ Administrační panel (Admin Panel)
*Only visible for administrators*

Access system administration:
- User management
- System settings
- Audit logs
- *Coming soon*

#### 🚪 Odhlásit se (Logout)
Securely log out of the system:
1. Click "Odhlásit se"
2. Confirm logout
3. Session cleared
4. Return to login page

## Session Management

### Session Duration
- Sessions remain active until logout
- Auto-logout on browser close (browser-dependent)
- No persistent login tokens (demo version)

### Session Security
- All session data stored in Streamlit session state
- Cleared completely on logout
- No data persisted between sessions

## Troubleshooting

### Cannot Login

**Problem:** "Neplatné přihlašovací údaje" error

**Solutions:**
1. Verify all three fields are filled correctly
2. Check caps lock is off
3. Ensure no extra spaces in credentials
4. Try one of the demo accounts

**Common Mistakes:**
- Wrong Client ID for the user
- Typo in User ID (case-sensitive)
- Incorrect password

### Stuck on Login Page

**Problem:** Login button doesn't work

**Solutions:**
1. Check browser console for errors (F12)
2. Refresh the page (F5)
3. Clear browser cache
4. Try a different browser

### Session Expired

**Problem:** Logged out unexpectedly

**Causes:**
- Browser closed
- Tab refreshed
- Server restarted

**Solution:**
Simply log in again with your credentials

### Cannot Access Admin Features

**Problem:** Admin panel not visible

**Solutions:**
1. Verify you're using an admin account
2. Check User ID is `admin`
3. Ensure role is set to `admin`
4. Re-login if needed

## Security Best Practices

### For Users

1. **Keep Credentials Secure**
   - Don't share your password
   - Don't write passwords down
   - Use unique passwords

2. **Logout When Done**
   - Always logout on shared computers
   - Use logout button, not just close browser
   - Verify logout confirmation

3. **Report Issues**
   - Report suspicious activity
   - Report login problems immediately
   - Don't share error messages publicly

### For Administrators

1. **User Management**
   - Regularly review user accounts
   - Remove inactive users
   - Monitor failed login attempts

2. **Access Control**
   - Follow principle of least privilege
   - Regular permission audits
   - Document access changes

3. **Monitoring**
   - Review logs regularly
   - Watch for unusual patterns
   - Set up alerts for failures

## Password Requirements

### Current (Demo)
- No specific requirements
- Any password accepted
- For demonstration only

### Production (Recommended)
- Minimum 12 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character
- No common passwords
- No dictionary words

## Multi-User Scenarios

### Multiple Clinics
Each clinic has unique Client ID:
- `clinic_dental` - Dental Clinic Prague
- `client001` - Demo Clinic
- More can be added

### Multiple Users Per Clinic
Multiple users can share Client ID:
- Different User IDs
- Different roles/permissions
- Separate sessions

## Feature Availability by Role

### All Users
✅ View agents  
✅ Agent simulations  
✅ AI chat assistant  
✅ Personal settings  
✅ Configuration panel  

### Admin Only
✅ All user features  
✅ Admin panel (coming soon)  
✅ User management (coming soon)  
✅ System logs (coming soon)  

## Getting Help

### Login Issues
1. Check demo credentials above
2. Review troubleshooting section
3. Contact support

### Feature Access
1. Verify your role
2. Check user menu for available options
3. Contact admin for permission changes

### Technical Problems
1. Check browser console (F12)
2. Try different browser
3. Clear cache and cookies
4. Contact technical support

## Future Authentication Features

Coming soon:
- [ ] Two-factor authentication (2FA)
- [ ] Password reset via email
- [ ] Remember me option
- [ ] Social login (Google, Microsoft)
- [ ] Biometric authentication
- [ ] Single Sign-On (SSO)
- [ ] Session timeout warnings
- [ ] Password strength meter
- [ ] Login history
- [ ] Active sessions management