
# SMTP Configuration Instructions
# ==============================
# 
# To get your SMTP settings from WordPress theme options:
# 1. Go to your WordPress admin: https://woo.local/wp-admin/
# 2. Navigate to Appearance > Theme Options (or similar)
# 3. Look for SMTP/Email settings section
# 4. Copy the following values and update your .env.local file:
#
# SMTP_HOST=your-smtp-host
# SMTP_PORT=587
# SMTP_SECURE=false
# SMTP_USER=your-email@domain.com
# SMTP_PASS=your-app-password
# SMTP_FROM_NAME=Your Site Name
#
# Common SMTP providers:
# - Gmail: smtp.gmail.com:587
# - Outlook: smtp-mail.outlook.com:587
# - Yahoo: smtp.mail.yahoo.com:587
# - Custom: your-provider-smtp-host:port
#
# Note: For Gmail, you need to use an App Password, not your regular password

