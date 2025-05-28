# ComPear - Grocery Price Comparison App

ComPear is a React application that helps users compare grocery prices across different supermarkets in the Netherlands, UK, and Germany. The app features dynamic country-specific content, multi-language support, and an integrated suggestion system.

## 🌍 Features

- **Multi-Country Support**: Netherlands (available), UK and Germany (coming soon)
- **Dynamic Content**: Headings and descriptions change based on selected country
- **Multi-Language**: English, Dutch, and German translations
- **Price Comparison**: Compare grocery prices across multiple supermarkets
- **Optimal Shopping Strategy**: Find the best stores to shop at for maximum savings
- **User Suggestions**: Built-in suggestion box for user feedback

## 🚀 Getting Started

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

### Prerequisites

- Node.js (version 22 or higher)
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables (see below)
4. Start the development server:
   ```bash
   npm start
   ```

## ⚙️ Environment Setup

The application uses EmailJS for the suggestion feature. You'll need to configure EmailJS credentials.

### 1. Create Environment File

Create a `.env` file in the project root:

```env
# EmailJS Configuration for Suggestions Box
REACT_APP_EMAILJS_SERVICE_ID=your_service_id
REACT_APP_EMAILJS_TEMPLATE_ID=your_template_id
REACT_APP_EMAILJS_PUBLIC_KEY=your_public_key

# Optional: Admin Email (where suggestions are sent)
REACT_APP_ADMIN_EMAIL=admin@compears.shop
```

### 2. EmailJS Setup

1. **Create EmailJS Account**
   - Go to [EmailJS.com](https://www.emailjs.com/) and create a free account

2. **Set up Email Service**
   - Create an email service (Gmail, Outlook, etc.)
   - Connect it to your EmailJS account

3. **Create Email Template**
   Create a template with these variables:
   - `{{from_name}}` - User's name (or "Anonymous")
   - `{{from_email}}` - User's email (or "No email provided")
   - `{{message}}` - The suggestion text
   - `{{to_email}}` - Admin email
   - `{{reply_to}}` - User's email for replies

4. **Get Credentials**
   - Service ID: From your EmailJS service
   - Template ID: From your EmailJS template
   - Public Key: From your EmailJS account settings

5. **Add to Environment**
   - Update your `.env` file with the credentials

### 3. Example Email Template

**Subject:** `New ComPear Suggestion from {{from_name}}`

**Body:**
```
You have received a new suggestion for ComPear!

From: {{from_name}}
Email: {{from_email}}

Message:
{{message}}

---
Reply-To: {{reply_to}}
Sent via ComPear Suggestion System
```

## 🛠️ Available Scripts

### `npm start`
Runs the app in development mode at [http://localhost:3000](http://localhost:3000).

### `npm test`
Launches the test runner in interactive watch mode.

### `npm run build`
Builds the app for production to the `build` folder.

### `npm run eject`
**Note: This is a one-way operation!** Ejects from Create React App configuration.

## 🚀 Deployment

The app is configured for deployment to Netlify via GitHub Actions. The deployment pipeline:

1. **Builds the application** with environment variables
2. **Deploys to Netlify** automatically on push
3. **Creates preview URLs** for pull requests

### Deployment Setup

1. **GitHub Secrets**: Add these to your repository secrets:
   - `NETLIFY_SITE_ID`
   - `NETLIFY_API_TOKEN`
   - `EMAILJS_SERVICE_ID`
   - `EMAILJS_TEMPLATE_ID`
   - `EMAILJS_PUBLIC_KEY`

2. **Environment Variables**: The pipeline will automatically inject EmailJS credentials during build.

## 🌐 Country & Language Support

- **Netherlands** 🇳🇱 - Fully supported (Dutch/English)
- **United Kingdom** 🇬🇧 - Coming soon (English)
- **Germany** 🇩🇪 - Coming soon (German/English)

The app automatically:
- Updates headings based on selected country
- Switches language based on country (with manual toggle)
- Shows appropriate "coming soon" messages for unavailable countries

## 🛡️ Security Notes

- EmailJS credentials are public by design (client-side usage)
- Secure your EmailJS account with domain restrictions
- Environment variables with `REACT_APP_` prefix are publicly visible in the built bundle

## 📁 Project Structure

```
src/
├── components/          # React components
├── context/            # Country & Language contexts
├── services/           # EmailJS service
├── translations/       # Multi-language support
├── config/            # EmailJS configuration
├── types/             # TypeScript types
└── utils/             # Utility functions
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📝 Learn More

- [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started)
- [React documentation](https://reactjs.org/)
- [EmailJS documentation](https://www.emailjs.com/docs/)
- [Material-UI documentation](https://mui.com/)
