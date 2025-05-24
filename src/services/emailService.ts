import emailjs from '@emailjs/browser';
import { EMAILJS_CONFIG } from '../config/emailjs';

/**
 * Email Service for sending suggestions to admin@compears.shop
 * Choose one of the following methods based on your preference
 */

interface SuggestionData {
  name: string;
  email: string;
  suggestion: string;
}

// ========================================
// OPTION 1: EmailJS (Recommended - No backend needed)
// ========================================
// Install: npm install @emailjs/browser ✅
// Setup: Create account at https://www.emailjs.com/
// Configuration is now in src/config/emailjs.ts

export const sendWithEmailJS = async (data: SuggestionData) => {
  const templateParams = {
    from_name: data.name || 'Anonymous',
    from_email: data.email || 'No email provided',
    message: data.suggestion,
    to_email: 'admin@compears.shop',
    reply_to: data.email || 'noreply@compears.shop'
  };

  return emailjs.send(
    EMAILJS_CONFIG.SERVICE_ID,
    EMAILJS_CONFIG.TEMPLATE_ID,
    templateParams,
    EMAILJS_CONFIG.PUBLIC_KEY
  );
};

// ========================================
// OPTION 2: Formspree (Simple form service)
// ========================================
// Setup: Create account at https://formspree.io/
// Get your form endpoint and replace YOUR_FORM_ID

export const sendWithFormspree = async (data: SuggestionData) => {
  const response = await fetch('https://formspree.io/f/YOUR_FORM_ID', {
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
    throw new Error('Failed to send suggestion');
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
    throw new Error('Failed to send suggestion');
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
      to: 'admin@compears.shop'
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to send suggestion');
  }

  return response.json();
};

// ========================================
// QUICK START: Use this for testing
// ========================================
// This just logs to console - replace with your chosen method above

export const sendSuggestion = async (data: SuggestionData) => {
  // Using EmailJS to send suggestions to admin@compears.shop
  return sendWithEmailJS(data);
  
  // Alternative methods (uncomment to use):
  // return sendWithFormspree(data);
  // return sendWithNetlifyForms(data);
  // return sendWithBackendAPI(data);
}; 