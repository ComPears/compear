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
