/**
 * EmailJS Configuration
 * 
 * Setup Instructions:
 * 1. Go to https://www.emailjs.com/
 * 2. Create a free account
 * 3. Create an email service (Gmail, Outlook, etc.)
 * 4. Create an email template
 * 5. Get your credentials and replace the values below
 */

export const EMAILJS_CONFIG = {
  // Replace these with your actual EmailJS credentials
  SERVICE_ID: 'YOUR_SERVICE_ID',       // e.g., 'service_abc123'
  TEMPLATE_ID: 'YOUR_TEMPLATE_ID',     // e.g., 'template_xyz789'
  PUBLIC_KEY: 'YOUR_PUBLIC_KEY',       // e.g., 'user_abcdefghijklmnop'
};

/**
 * Email Template Variables (for reference):
 * These are the variables you can use in your EmailJS template:
 * 
 * {{from_name}}     - User's name (or "Anonymous")
 * {{from_email}}    - User's email (or "No email provided")
 * {{message}}       - The suggestion text
 * {{to_email}}      - admin@compears.shop
 * {{reply_to}}      - User's email for replies
 * 
 * Example EmailJS template:
 * 
 * Subject: New ComPear Suggestion from {{from_name}}
 * 
 * Body:
 * You have received a new suggestion for ComPear!
 * 
 * From: {{from_name}} ({{from_email}})
 * 
 * Message:
 * {{message}}
 * 
 * ---
 * Sent via ComPear Suggestion System
 */ 