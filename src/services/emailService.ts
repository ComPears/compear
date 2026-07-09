import emailjs from '@emailjs/browser';
import { EMAILJS_CONFIG, isEmailJSConfigured } from '../config/emailjs';

interface SuggestionData {
  name: string;
  email: string;
  suggestion: string;
}

const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL || 'admin@compears.shop';
const MIN_SUBMIT_INTERVAL_MS = 60_000;
const MAX_SUGGESTION_LENGTH = 2000;
const MAX_NAME_LENGTH = 100;
const MAX_EMAIL_LENGTH = 254;

let lastSubmitAt = 0;

function validateSuggestionData(data: SuggestionData): void {
  if (!data.suggestion.trim()) {
    throw new Error('Suggestion is required');
  }
  if (data.suggestion.length > MAX_SUGGESTION_LENGTH) {
    throw new Error('Suggestion is too long');
  }
  if (data.name.length > MAX_NAME_LENGTH) {
    throw new Error('Name is too long');
  }
  if (data.email.length > MAX_EMAIL_LENGTH) {
    throw new Error('Email is too long');
  }
}

function assertSubmitAllowed(): void {
  const now = Date.now();
  if (now - lastSubmitAt < MIN_SUBMIT_INTERVAL_MS) {
    throw new Error('Please wait before submitting another suggestion');
  }
  lastSubmitAt = now;
}

export const sendWithEmailJS = async (data: SuggestionData) => {
  if (!isEmailJSConfigured) {
    throw new Error(
      'EmailJS is not properly configured. Please check your environment variables.'
    );
  }

  validateSuggestionData(data);
  assertSubmitAllowed();

  const templateParams = {
    from_name: data.name.trim() || 'Anonymous',
    from_email: data.email.trim() || 'No email provided',
    message: data.suggestion.trim(),
    to_email: ADMIN_EMAIL,
    reply_to: data.email.trim() || 'noreply@compears.shop',
  };

  try {
    const response = await emailjs.send(
      EMAILJS_CONFIG.SERVICE_ID,
      EMAILJS_CONFIG.TEMPLATE_ID,
      templateParams,
      EMAILJS_CONFIG.PUBLIC_KEY
    );

    return response;
  } catch (error) {
    console.error('EmailJS error:', error);
    throw new Error('Failed to send email via EmailJS');
  }
};

export const sendSuggestion = async (data: SuggestionData) => {
  if (!isEmailJSConfigured) {
    throw new Error(
      'EmailJS is not properly configured. Please check your environment variables.'
    );
  }

  return sendWithEmailJS(data);
};
