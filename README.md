# ComPear - Grocery Price Comparison App

ComPear is a React application that helps users compare grocery prices across different supermarkets in the Netherlands, UK, and Germany. The app features dynamic country-specific content, multi-language support, and an integrated suggestion system.

## 🌍 Features

- **Multi-Country Support**: Netherlands (available), UK and Germany (coming soon). App is built for Europe with paths like **compears.shop/nl**, **compears.shop/de**, **compears.shop/uk**.
- **Dynamic Content**: Headings and descriptions change based on selected country
- **Multi-Language**: English, Dutch, and German translations
- **Product Search & Deals**: Compare grocery prices across Dutch supermarkets via the backend API
- **Product Categorization**: Automatic product categorization for easy browsing and filtering
- **Price Comparison**: Compare grocery prices across multiple supermarkets
- **Optimal Shopping Strategy**: Find the best stores to shop at for maximum savings
- **User Suggestions**: Built-in suggestion box for user feedback

## 🚀 Getting Started

This project uses [Vite](https://vite.dev/) with React and TypeScript.

### Prerequisites

- **Node.js 20 LTS or 22 LTS** (recommended). If you use [nvm](https://github.com/nvm-sh/nvm), run `nvm use` in the `compear` folder (`.nvmrc` is set to 20).
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables (see below)
4. (Optional) Start the backend API for product search, deals, and basket (see [Backend](#backend-api) below).
5. Start the development server:
   ```bash
   npm start
   ```

### Backend API

The app can use a local backend for product data (search, deals, compare, basket). From the project root (parent of `compear` and `backend`):

1. In `backend/`: `npm install`, `cp .env.example .env`, `npm run seed` (to load data from `compears-data-wrangling`), then `npm run dev`.
2. In `compear/`: set `VITE_API_URL=http://localhost:4000` in `.env` (or leave unset to use the default).

Then open the app; all product search and price comparison uses the backend API.

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
   # optional: echo "VITE_API_URL=http://localhost:4000" >> .env
   npm start
   ```
   Browser opens at http://localhost:3000 (redirects to /nl).

4. **In the app**
   - **Home** – Add a grocery and compare prices across stores (backend API).
   - **Zoek** – Search e.g. “melk” or “eieren”; filter by store; click a result → product page.
   - **Aanbiedingen** – List of deals (if any in seeded data).
   - **Product page** – Compare prices per store; click “In mandje”.
   - **Mandje (basket)** – See items; “Optie 1” vs “Optie 2” and “Je bespaart €X door te splitsen” if relevant.

If Search/Deals stay empty, run `npm run seed` in `backend` again (with `compears-data-wrangling` present) so `backend/src/data/*.json` are populated.

## ⚙️ Environment Setup

The application uses EmailJS for the suggestion feature. You'll need to configure EmailJS credentials.

### 1. Create Environment File

Create a `.env` file in the project root:

```env
# EmailJS Configuration for Suggestions Box
VITE_EMAILJS_SERVICE_ID=your_service_id
VITE_EMAILJS_TEMPLATE_ID=your_template_id
VITE_EMAILJS_PUBLIC_KEY=your_public_key

# Optional: Admin Email (where suggestions are sent)
VITE_ADMIN_EMAIL=admin@compears.shop
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

### `npm start` / `npm run dev`
Runs the app in development mode at [http://localhost:3000](http://localhost:3000).

### `npm test`
Launches Vitest in watch mode.

### `npm run test:run`
Runs the test suite once (CI-friendly).

### `npm run build`
Type-checks with TypeScript and builds the app for production to the `dist` folder.

### `npm run preview`
Serves the production build locally for smoke testing.

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

2. **Environment Variables**: The pipeline injects EmailJS credentials during build via `VITE_*` variables.

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
- Environment variables with `VITE_` prefix are publicly visible in the built bundle

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

- [Vite documentation](https://vite.dev/)
- [React documentation](https://react.dev/)
- [EmailJS documentation](https://www.emailjs.com/docs/)
- [Material-UI documentation](https://mui.com/)
