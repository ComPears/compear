import emailjs from '@emailjs/browser';
import { EMAILJS_CONFIG, isEmailJSConfigured } from '../config/emailjs';

/**
 * Email Service for sending suggestions
 * Configuration is managed through environment variables
 */

interface SuggestionData {
  name: string;
  email: string;
  suggestion: string;
}

// Get admin email from environment variables
const ADMIN_EMAIL = process.env.REACT_APP_ADMIN_EMAIL || 'admin@compears.shop';
const FORMSPREE_FORM_ID = process.env.REACT_APP_FORMSPREE_FORM_ID || '';

// ========================================
// OPTION 1: EmailJS (Recommended - No backend needed)
// ========================================
// Install: npm install @emailjs/browser ✅
// Setup: Create account at https://www.emailjs.com/
// Configuration is managed through environment variables

export const sendWithEmailJS = async (data: SuggestionData) => {
  if (!isEmailJSConfigured) {
    throw new Error(
      'EmailJS is not properly configured. Please check your environment variables.'
    );
  }

  const templateParams = {
    from_name: data.name || 'Anonymous',
    from_email: data.email || 'No email provided',
    message: data.suggestion,
    to_email: ADMIN_EMAIL,
    reply_to: data.email || 'noreply@compears.shop'
  };

  try {
    const response = await emailjs.send(
      EMAILJS_CONFIG.SERVICE_ID,
      EMAILJS_CONFIG.TEMPLATE_ID,
      templateParams,
      EMAILJS_CONFIG.PUBLIC_KEY
    );
    
    console.log('Email sent successfully:', response);
    return response;
  } catch (error) {
    console.error('EmailJS error:', error);
    throw new Error('Failed to send email via EmailJS');
  }
};

// ========================================
// OPTION 2: Formspree (Simple form service)
// ========================================
// Setup: Create account at https://formspree.io/
// Set REACT_APP_FORMSPREE_FORM_ID in your .env file

export const sendWithFormspree = async (data: SuggestionData) => {
  if (!FORMSPREE_FORM_ID) {
    throw new Error(
      'Formspree form ID is not configured. Please set REACT_APP_FORMSPREE_FORM_ID in your .env file.'
    );
  }

  const response = await fetch(`https://formspree.io/f/${FORMSPREE_FORM_ID}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: data.name || 'Anonymous',
      email: data.email || 'No email provided',
      message: data.suggestion,
      _replyto: data.email,
      _subject: 'New Suggestion for ComPear'
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to send suggestion via Formspree');
  }

  return response.json();
};

// ========================================
// OPTION 3: Netlify Forms (If hosting on Netlify)
// ========================================
// Just add data-netlify="true" to your form and it will work automatically
// No additional setup needed if you're on Netlify

export const sendWithNetlifyForms = async (data: SuggestionData) => {
  const formData = new FormData();
  formData.append('form-name', 'suggestions');
  formData.append('name', data.name || 'Anonymous');
  formData.append('email', data.email || 'No email provided');
  formData.append('suggestion', data.suggestion);

  const response = await fetch('/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams(formData as any).toString()
  });

  if (!response.ok) {
    throw new Error('Failed to send suggestion via Netlify Forms');
  }

  return response;
};

// ========================================
// OPTION 4: Your Backend API
// ========================================
// Create an API endpoint that sends emails and call it here

export const sendWithBackendAPI = async (data: SuggestionData) => {
  const response = await fetch('/api/suggestions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: data.name || 'Anonymous',
      email: data.email || 'No email provided',
      suggestion: data.suggestion,
      to: ADMIN_EMAIL
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to send suggestion via backend API');
  }

  return response.json();
};

// ========================================
// MAIN EXPORT: Use this for sending suggestions
// ========================================

export const sendSuggestion = async (data: SuggestionData) => {
  try {
    // Primary method: EmailJS
    if (isEmailJSConfigured) {
      return await sendWithEmailJS(data);
    }
    
    // Fallback method: Formspree
    if (FORMSPREE_FORM_ID) {
      return await sendWithFormspree(data);
    }
    
    // If no service is configured, throw an error
    throw new Error(
      'No email service is configured. Please set up EmailJS or Formspree in your .env file.'
    );
    
  } catch (error) {
    console.error('Error sending suggestion:', error);
    throw error;
  }
}; 