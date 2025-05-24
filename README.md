# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Environment Setup

The application uses environment variables for configuration. You'll need to set up email service credentials for the suggestion feature to work.

### 1. Create Environment File

Create a `.env` file in the project root with the following variables:

```env
# Email Service Configuration
# Choose one of the following options:

# Option 1: EmailJS (Recommended)
# Get these from https://www.emailjs.com/
REACT_APP_EMAILJS_SERVICE_ID=your_service_id
REACT_APP_EMAILJS_TEMPLATE_ID=your_template_id
REACT_APP_EMAILJS_PUBLIC_KEY=your_public_key

# Option 2: Formspree (Alternative)
# Get this from https://formspree.io/
REACT_APP_FORMSPREE_FORM_ID=your_form_id

# Admin Email (where suggestions are sent)
REACT_APP_ADMIN_EMAIL=admin@compears.shop
```

### 2. Email Service Setup Options

#### Option A: EmailJS (Recommended)
1. Go to [EmailJS.com](https://www.emailjs.com/) and create a free account
2. Create an email service (Gmail, Outlook, etc.)
3. Create an email template with these variables:
   - `{{from_name}}` - User's name
   - `{{from_email}}` - User's email
   - `{{message}}` - The suggestion text
   - `{{to_email}}` - Admin email
   - `{{reply_to}}` - User's email for replies
4. Get your Service ID, Template ID, and Public Key
5. Add them to your `.env` file

#### Option B: Formspree
1. Go to [Formspree.io](https://formspree.io/) and create an account
2. Create a new form
3. Get your form ID
4. Add it to your `.env` file as `REACT_APP_FORMSPREE_FORM_ID`

### 3. Example Email Template (EmailJS)

**Subject:** `New ComPear Suggestion from {{from_name}}`

**Body:**
```
You have received a new suggestion for ComPear!

From: {{from_name}} ({{from_email}})

Message:
{{message}}

---
Sent via ComPear Suggestion System
```

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).
