/**
 * EmailJS Configuration
 * 
 * Setup Instructions:
 * 1. Go to https://www.emailjs.com/
 * 2. Create a free account
 * 3. Create an email service (Gmail, Outlook, etc.)
 * 4. Create an email template
 * 5. Create a .env file in the project root with your credentials
 * 
 * Required Environment Variables:
 * - REACT_APP_EMAILJS_SERVICE_ID
 * - REACT_APP_EMAILJS_TEMPLATE_ID
 * - REACT_APP_EMAILJS_PUBLIC_KEY
 */

export const EMAILJS_CONFIG = {
  SERVICE_ID: process.env.REACT_APP_EMAILJS_SERVICE_ID || '',
  TEMPLATE_ID: process.env.REACT_APP_EMAILJS_TEMPLATE_ID || '',
  PUBLIC_KEY: process.env.REACT_APP_EMAILJS_PUBLIC_KEY || '',
};

// Validate that required environment variables are set
const validateConfig = () => {
  const missingVars = [];
  
  if (!EMAILJS_CONFIG.SERVICE_ID) {
    missingVars.push('REACT_APP_EMAILJS_SERVICE_ID');
  }
  if (!EMAILJS_CONFIG.TEMPLATE_ID) {
    missingVars.push('REACT_APP_EMAILJS_TEMPLATE_ID');
  }
  if (!EMAILJS_CONFIG.PUBLIC_KEY) {
    missingVars.push('REACT_APP_EMAILJS_PUBLIC_KEY');
  }
  
  if (missingVars.length > 0) {
    console.warn(
      'Missing EmailJS environment variables:',
      missingVars.join(', '),
      '\nPlease create a .env file with these variables.'
    );
  }
  
  return missingVars.length === 0;
};

export const isEmailJSConfigured = validateConfig();

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