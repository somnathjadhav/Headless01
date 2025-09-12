# Email Configuration Setup

This guide will help you configure SMTP settings to enable email verification and password reset functionality.

## 📧 SMTP Configuration Options

### Option 1: Gmail (Recommended for Development)

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate an App Password**:
   - Go to [Google Account Settings](https://myaccount.google.com/)
   - Security → 2-Step Verification → App passwords
   - Generate a new app password for "Mail"
   - Copy the 16-character password

3. **Add to your `.env.local` file**:
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-16-character-app-password
SMTP_FROM_NAME=Your Site Name
```

### Option 2: Other Email Providers

#### Outlook/Hotmail
```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@outlook.com
SMTP_PASS=your-password
SMTP_FROM_NAME=Your Site Name
```

#### Yahoo Mail
```env
SMTP_HOST=smtp.mail.yahoo.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@yahoo.com
SMTP_PASS=your-app-password
SMTP_FROM_NAME=Your Site Name
```

#### Custom SMTP Server
```env
SMTP_HOST=your-smtp-server.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-username
SMTP_PASS=your-password
SMTP_FROM_NAME=Your Site Name
```

## 🔧 Environment Variables

Create or update your `.env.local` file with the following variables:

```env
# Email Configuration (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM_NAME=Your Site Name

# Site Configuration
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## 🚀 Production Email Services

For production, consider using dedicated email services:

### SendGrid
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-api-key
SMTP_FROM_NAME=Your Site Name
```

### Mailgun
```env
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-mailgun-username
SMTP_PASS=your-mailgun-password
SMTP_FROM_NAME=Your Site Name
```

### Amazon SES
```env
SMTP_HOST=email-smtp.us-east-1.amazonaws.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-ses-username
SMTP_PASS=your-ses-password
SMTP_FROM_NAME=Your Site Name
```

## ✅ Testing Email Configuration

1. **Start your development server**:
   ```bash
   npm run dev
   ```

2. **Test email sending** by signing up a new user:
   - Go to `/signup`
   - Create a new account
   - Check your email for the verification link

3. **Check server logs** for email sending status:
   - Look for `📧 Email sent successfully` messages
   - Check for any SMTP errors

## 🔍 Troubleshooting

### Common Issues

1. **"Email service not configured"**
   - Make sure all SMTP variables are set in `.env.local`
   - Restart your development server after adding environment variables

2. **"Authentication failed"**
   - Check your email and password
   - For Gmail, make sure you're using an App Password, not your regular password
   - Ensure 2FA is enabled for Gmail

3. **"Connection timeout"**
   - Check your SMTP host and port settings
   - Verify your firewall isn't blocking the connection

4. **"Invalid credentials"**
   - Double-check your SMTP_USER and SMTP_PASS
   - For Gmail, ensure you're using the App Password format

### Debug Mode

To see detailed email sending logs, check your terminal where `npm run dev` is running. You should see:
- `📧 Email sent successfully: [message-id]` for successful sends
- `⚠️ SMTP credentials not configured. Email sending disabled.` if not configured
- Error messages for failed attempts

## 📱 Email Templates

The system includes beautiful HTML email templates for:
- **Email Verification**: Welcome email with verification link
- **Password Reset**: Password reset instructions

Templates are automatically styled and responsive.

## 🔒 Security Notes

- Never commit your `.env.local` file to version control
- Use App Passwords instead of your main email password
- Consider using environment-specific SMTP settings for production
- Monitor email sending limits and quotas

## 📊 Email Features

Once configured, the system will automatically:
- Send verification emails on user signup
- Block unverified users from signing in
- Provide password reset functionality
- Handle email verification token expiration (24 hours)
- Support resending verification emails

---

**Need help?** Check the server logs for detailed error messages or refer to your email provider's SMTP documentation.
