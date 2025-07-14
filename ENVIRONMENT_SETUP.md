# Environment Variables Setup

## Migration from Vite to Next.js

### Original Vite Format
In your Vite project, you had environment variables like:
```bash
VITE_CLIENT_ID=your-google-client-id
VITE_AUTH0_DOMAIN=your-auth0-domain.auth0.com
VITE_AUTH0_CLIENT_ID=your-auth0-client-id
VITE_AUTH0_AUDIENCE=your-auth0-audience
```

### New Next.js Format
In Next.js, create a `.env.local` file with:

#### Public Variables (accessible in browser)
```bash
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id
NEXT_PUBLIC_AUTH0_DOMAIN=your-auth0-domain.auth0.com
NEXT_PUBLIC_AUTH0_CLIENT_ID=your-auth0-client-id
NEXT_PUBLIC_AUTH0_AUDIENCE=your-auth0-audience
```

#### Private Variables (server-side only)
```bash
API_SECRET_KEY=your-secret-api-key
DATABASE_URL=your-database-url
JWT_SECRET=your-jwt-secret
```

### Key Differences

1. **Prefix Change**: `VITE_` → `NEXT_PUBLIC_`
2. **Access**: Only `NEXT_PUBLIC_` variables are accessible in client-side code
3. **Security**: Private variables (without prefix) are only available on the server

### Code Changes Required

Update your code from:
```javascript
// Old Vite way
const clientId = import.meta.env.VITE_CLIENT_ID

// New Next.js way
const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
```

### Firebase Configuration
If you're using Firebase, update your config:

```javascript
// firebase/firebaseConfig.js
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
}
```

### Complete Example .env.local File

```bash
# Authentication - Google OAuth
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id

# Authentication - Auth0
NEXT_PUBLIC_AUTH0_DOMAIN=your-domain.auth0.com
NEXT_PUBLIC_AUTH0_CLIENT_ID=your-auth0-client-id
NEXT_PUBLIC_AUTH0_AUDIENCE=your-auth0-audience

# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your-firebase-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id

# Private Variables (server-side only)
API_SECRET_KEY=your-secret-key
DATABASE_URL=your-database-url
JWT_SECRET=your-jwt-secret
```

⚠️ **Important**: Never commit your `.env.local` file to version control. Add it to `.gitignore`. 