import emailjs from '@emailjs/browser';
import { EMAILJS_CONFIG, isEmailJSConfigured } from '../config/emailjs';

/**
 * Email Service for sending suggestions using EmailJS
 * Configuration is managed through environment variables
 */

interface SuggestionData {
  name: string;
  email: string;
  suggestion: string;
}

// Get admin email from environment variables
const ADMIN_EMAIL = process.env.REACT_APP_ADMIN_EMAIL || 'admin@compears.shop';

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
// MAIN EXPORT: Send suggestion using EmailJS
// ========================================

export const sendSuggestion = async (data: SuggestionData) => {
  if (!isEmailJSConfigured) {
    throw new Error(
      'EmailJS is not properly configured. Please check your environment variables.'
    );
  }

  try {
    return await sendWithEmailJS(data);
  } catch (error) {
    console.error('Error sending suggestion:', error);
    throw error;
  }
}; 