# Security Documentation

## Authentication System

### Current Implementation (Demo)

The application uses a basic authentication system suitable for **demonstration purposes only**.

### Security Features

#### 1. Password Hashing
- Passwords are hashed using SHA256
- Plain text passwords are never stored
- Hash comparison for authentication

#### 2. Session Management
- User sessions managed via Streamlit session state
- Sessions cleared on logout
- No persistent login tokens

#### 3. Role-Based Access
- Two roles: `user` and `admin`
- Admin-specific features (admin panel) only visible to admins
- Role stored in session after authentication

### Demo User Database

```python
USERS_DB = {
    "demo_user": {
        "client_id": "client001",
        "password_hash": "...",  # SHA256 hash
        "name": "Demo User",
        "role": "user"
    },
    "admin": {
        "client_id": "client001",
        "password_hash": "...",  # SHA256 hash
        "name": "Administrator",
        "role": "admin"
    },
    "dr_novak": {
        "client_id": "clinic_dental",
        "password_hash": "...",  # SHA256 hash
        "name": "Dr. Novák",
        "role": "user"
    }
}
```

## ⚠️ Production Security Recommendations

**IMPORTANT**: This demo authentication is NOT suitable for production use.

### Required Changes for Production

#### 1. Password Security
```python
# Replace SHA256 with bcrypt or Argon2
import bcrypt

# Hashing
hashed = bcrypt.hashpw(password.encode(), bcrypt.gensalt())

# Verification
bcrypt.checkpw(password.encode(), stored_hash)
```

#### 2. Database Integration
- Move from in-memory dict to proper database (PostgreSQL, MySQL)
- Use SQLAlchemy or similar ORM
- Implement proper user table with indexes

#### 3. Session Security
- Implement JWT tokens
- Add session expiration (timeout)
- Use secure session storage (Redis, Memcached)
- Add CSRF protection

#### 4. Additional Security Layers

**Rate Limiting:**
```python
from streamlit_extras.ratelimit import ratelimit

@ratelimit(max_calls=5, period=60)  # 5 attempts per minute
def verify_credentials(...):
    pass
```

**Password Requirements:**
- Minimum 12 characters
- Require uppercase, lowercase, numbers, symbols
- Password strength meter
- Password history (prevent reuse)

**Two-Factor Authentication:**
- TOTP (Time-based One-Time Password)
- SMS verification
- Email verification codes

**Account Security:**
- Account lockout after failed attempts
- Password reset functionality
- Email verification on signup
- Security questions
- Login notifications

#### 5. HTTPS/SSL
```bash
# Use HTTPS in production
streamlit run main.py --server.enableCORS false --server.enableXsrfProtection true
```

#### 6. Environment Variables
```python
# Never hardcode credentials
import os
from dotenv import load_dotenv

load_dotenv()
SECRET_KEY = os.getenv('SECRET_KEY')
DATABASE_URL = os.getenv('DATABASE_URL')
```

#### 7. Input Validation
```python
import re

def validate_user_id(user_id: str) -> bool:
    # Only alphanumeric and underscore
    return bool(re.match(r'^[a-zA-Z0-9_]{3,20}$', user_id))

def validate_client_id(client_id: str) -> bool:
    return bool(re.match(r'^[a-zA-Z0-9_]{3,30}$', client_id))
```

#### 8. Logging and Monitoring
```python
import logging

logger = logging.getLogger(__name__)

def login_user(user_info: dict):
    logger.info(f"User logged in: {user_info['user_id']}")
    # Log IP address, timestamp, user agent
    
def failed_login_attempt(user_id: str, reason: str):
    logger.warning(f"Failed login: {user_id} - {reason}")
    # Alert on multiple failures
```

## Security Checklist for Production

- [ ] Replace SHA256 with bcrypt/Argon2
- [ ] Move to database (PostgreSQL/MySQL)
- [ ] Implement JWT or secure session tokens
- [ ] Add session expiration
- [ ] Enable HTTPS/SSL
- [ ] Add rate limiting
- [ ] Implement password requirements
- [ ] Add two-factor authentication
- [ ] Implement account lockout
- [ ] Add password reset functionality
- [ ] Use environment variables for secrets
- [ ] Add comprehensive logging
- [ ] Implement input validation
- [ ] Add CSRF protection
- [ ] Regular security audits
- [ ] Penetration testing
- [ ] Compliance check (GDPR, HIPAA if applicable)

## Data Privacy

### Patient Data (GDPR/HIPAA Compliance)

If handling real patient data:

1. **Data Encryption**
   - Encrypt at rest (database)
   - Encrypt in transit (HTTPS)
   - Use field-level encryption for sensitive data

2. **Access Control**
   - Principle of least privilege
   - Audit logs for all data access
   - Regular access reviews

3. **Data Retention**
   - Define retention policies
   - Automatic data purging
   - Secure data deletion

4. **Backup & Recovery**
   - Encrypted backups
   - Regular backup testing
   - Disaster recovery plan

## Incident Response

### In Case of Security Breach

1. **Immediate Actions**
   - Isolate affected systems
   - Preserve evidence
   - Notify security team

2. **Investigation**
   - Review logs
   - Identify scope of breach
   - Determine data affected

3. **Remediation**
   - Patch vulnerabilities
   - Reset compromised credentials
   - Update security measures

4. **Notification**
   - Notify affected users
   - Comply with legal requirements
   - Document incident

## Regular Security Tasks

### Weekly
- Review authentication logs
- Check for suspicious activity
- Update dependencies

### Monthly
- Security patch updates
- Access right review
- Backup verification

### Quarterly
- Password rotation policy
- Security training
- Third-party audit

### Annually
- Comprehensive security audit
- Penetration testing
- Compliance certification renewal

## Contact

For security concerns or to report vulnerabilities:
- Email: security@dental-iq.com
- Emergency: +420 XXX XXX XXX

**DO NOT** disclose security vulnerabilities publicly.