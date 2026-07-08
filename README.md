# ComPear - Grocery Price Comparison App

ComPear is a React application that helps users compare grocery prices across different supermarkets in the Netherlands, UK, and Germany. The app features dynamic country-specific content, multi-language support, and an integrated suggestion system.

## 🌍 Features

- **Multi-Country Support**: Netherlands (available), UK and Germany (coming soon). App is built for Europe with paths like **compears.shop/nl**, **compears.shop/de**, **compears.shop/uk**.
- **Dynamic Content**: Headings and descriptions change based on selected country
- **Multi-Language**: English, Dutch, and German translations
- **AI-Powered Price Fetching**: Real-time price extraction from supermarket websites using OpenAI
- **Product Categorization**: Automatic product categorization for easy browsing and filtering
- **Price Comparison**: Compare grocery prices across multiple supermarkets
- **Optimal Shopping Strategy**: Find the best stores to shop at for maximum savings
- **User Suggestions**: Built-in suggestion box for user feedback

## 🚀 Getting Started

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

### Prerequisites

- **Node.js 18 LTS or 20 LTS** (recommended). Node 19 or 25 can cause `ajv`/`fork-ts-checker-webpack-plugin` errors on `npm start`. If you use [nvm](https://github.com/nvm-sh/nvm), run `nvm use` in the `compear` folder (`.nvmrc` is set to 20).
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies (use `--legacy-peer-deps` if you see peer dependency conflicts):
   ```bash
   npm install --legacy-peer-deps
   ```
   If install fails on a Netlify CLI postinstall, run: `npm install --legacy-peer-deps --ignore-scripts`

3. Set up environment variables (see below)
4. (Optional) Start the backend API for product search, deals, and basket (see [Backend](#backend-api) below).
5. Start the development server:
   ```bash
   npm start
   ```

### Backend API

The app can use a local backend for product data (search, deals, compare, basket). From the project root (parent of `compear` and `backend`):

1. In `backend/`: `npm install`, `cp .env.example .env`, `npm run seed` (to load data from `compears-data-wrangling`), then `npm run dev`.
2. In `compear/`: set `REACT_APP_API_URL=http://localhost:4000` in `.env` (or leave unset to use the default).

Then open the app; Search, Aanbiedingen, and Basket pages will use the backend. The home page still supports the existing AI/static price flow.

### Test end-to-end

From the **project root** (folder that contains `compear` and `backend`):

1. **Backend**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   npm run seed          # needs compears-data-wrangling as sibling folder (or set WRANGLING_PATH)
   npm run dev
   ```
   Leave this running. You should see `Backend listening on port 4000`.

2. **Check API**
   - Open http://localhost:4000/health → `{"status":"ok",...}`
   - Open http://localhost:4000/stores → list of 7 stores with `productCount`
   - Open http://localhost:4000/products?search=melk → product list (or empty if no seed)

3. **Frontend**
   In a **new terminal**:
   ```bash
   cd compear
   npm install
   # optional: echo "REACT_APP_API_URL=http://localhost:4000" >> .env
   npm start
   ```
   Browser opens at http://localhost:3000 (redirects to /nl).

4. **In the app**
   - **Home** – Add a grocery and compare (uses AI/static; works without backend).
   - **Zoek** – Search e.g. “melk” or “eieren”; filter by store; click a result → product page.
   - **Aanbiedingen** – List of deals (if any in seeded data).
   - **Product page** – Compare prices per store; click “In mandje”.
   - **Mandje (basket)** – See items; “Optie 1” vs “Optie 2” and “Je bespaart €X door te splitsen” if relevant.

If Search/Deals stay empty, run `npm run seed` in `backend` again (with `compears-data-wrangling` present) so `backend/src/data/*.json` are populated.

### Troubleshooting `npm start`

- **"Unknown keyword formatMinimum"** (from `ajv-keywords` / `schema-utils`)  
  The app uses **overrides** for `ajv` and `ajv-keywords` plus a **postinstall** that patches `schema-utils` in `fork-ts-checker-webpack-plugin`, `babel-loader`, and `file-loader`. If you skipped scripts, run once: `node scripts/patch-schema-utils.js`. Then run `npm start` again.
- **"Cannot find module 'ajv/dist/compile/codegen'" or "Cannot read properties of undefined (reading 'date')"**  
  Use **Node 18 or 20 LTS**. With nvm: `nvm install 20 && nvm use 20`, then `rm -rf node_modules package-lock.json && npm install --legacy-peer-deps --ignore-scripts && npm run postinstall && npm start`.
- **"config.logger.log is not a function"** (fork-ts-checker-webpack-plugin)  
  The postinstall script patches the plugin to fall back to `console.log` when the webpack logger has no `.log`. If you used `--ignore-scripts`, run `node scripts/patch-fork-ts-checker-logger.js` then `npm start`.
- **"[eslint] Cannot set properties of undefined (setting 'defaultMeta')"** (Html Webpack Plugin / child compilation)  
  Set `DISABLE_ESLINT_PLUGIN=true` in `.env` (or run `DISABLE_ESLINT_PLUGIN=true npm start`). ESLint will no longer run in the webpack build; you can still use your editor’s ESLint.
- **Peer dependency / ERESOLVE errors on `npm install`**  
  Run `npm install --legacy-peer-deps` (or add `legacy-peer-deps=true` in `.npmrc`).

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

# OpenAI API Key (for local development only)
# In production, this should be set in Netlify environment variables
OPENAI_API_KEY=your_openai_api_key_here
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
   - `OPENAI_API_KEY` - Your OpenAI API key for AI-powered price fetching

2. **Netlify Environment Variables**: Set these in Netlify dashboard (Site settings > Environment variables):
   - `OPENAI_API_KEY` - Your OpenAI API key (required for production)

3. **Environment Variables**: The pipeline will automatically inject EmailJS credentials during build and set OpenAI API key in Netlify.

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
- **OpenAI API Key**: Never commit your OpenAI API key to the repository. It should only be set in:
  - Local `.env` file (for development, already in `.gitignore`)
  - Netlify environment variables (for production)
  - GitHub Secrets (for CI/CD pipeline)

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
