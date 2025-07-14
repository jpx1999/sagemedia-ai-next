# Migration to Next.js App Router

This document outlines the migration from React Router to Next.js App Router while retaining all functionality from the original App.jsx.

## Key Changes Made

### 1. Routing Structure

**Before (React Router):**
```jsx
<Routes>
  <Route path="/news-intelligence" element={<NewsIntelligence />} />
  <Route path="/news-intelligence/newsid/:newsId" element={<NewsIntelligence />} />
  <Route path="/login" element={<SignUpAndLogin />} />
  // ... other routes
</Routes>
```

**After (Next.js App Router):**
```
src/app/
├── news-intelligence/
│   ├── page.js                    # Base news intelligence
│   └── newsid/[newsId]/page.js   # Individual news details
├── login/page.js
├── bookmarks/page.js
├── admin-dashboard/page.js
└── ... other pages
```

### 2. Component Structure

#### Main NewsIntelligence Component
- **Location**: `src/components/NewsIntelligence.jsx`
- **Purpose**: Central component handling both base news intelligence and individual news details
- **Props**: 
  - `newsIdParam`: When accessing individual news items
  - `partialAccess`: For non-authenticated users
  - `isDarkTheme`: Theme state

#### Page Wrappers
- **Base Route**: `src/app/news-intelligence/page.js`
  ```jsx
  export default function NewsIntelligencePage() {
    return (
      <Suspense fallback={<Loading />}>
        <NewsIntelligence />
      </Suspense>
    )
  }
  ```

- **Detail Route**: `src/app/news-intelligence/newsid/[newsId]/page.js`
  ```jsx
  export default function NewsDetailPage({ params }) {
    return (
      <Suspense fallback={<Loading />}>
        <NewsIntelligence newsIdParam={newsId} />
      </Suspense>
    )
  }
  ```

### 3. Authentication & Protection

#### AuthWrapper Component
- **Location**: `src/components/AuthWrapper.jsx`
- **Purpose**: Client-side route protection replacing React Router's Protected component
- **Features**:
  - `requireAuth`: Requires user authentication
  - `requireAdmin`: Requires admin role
  - `allowPartialAccess`: Allows partial access for news details

#### Usage Examples:
```jsx
// Admin-only page
<AuthWrapper requireAdmin={true}>
  <AdminDashboard />
</AuthWrapper>

// Auth-required page
<AuthWrapper requireAuth={true}>
  <Bookmarks />
</AuthWrapper>

// Partial access (for news details)
<AuthWrapper allowPartialAccess={true}>
  <NewsIntelligence />
</AuthWrapper>
```

### 4. App-Level State Management

#### Providers Component
- **Location**: `src/components/Providers.jsx`
- **Features**:
  - Redux store provider
  - Firebase authentication handling
  - Silktide consent manager initialization
  - Theme management
  - Notification service initialization

### 5. Navigation Updates

**Before (React Router):**
```jsx
import { useNavigate, useLocation, useParams } from 'react-router-dom'
const navigate = useNavigate()
navigate('/news-intelligence/newsid/123')
```

**After (Next.js):**
```jsx
import { useRouter, usePathname, useParams } from 'next/navigation'
const router = useRouter()
router.replace('/news-intelligence/newsid/123')
```

### 6. Middleware

- **Location**: `middleware.js`
- **Purpose**: Server-side route protection and redirects
- **Features**:
  - Protects admin routes
  - Handles guest-only routes (login)
  - Allows partial access to news detail pages

### 7. Firebase Auth Actions

- **Integration**: Login page checks for Firebase auth action parameters
- **Behavior**: Shows `AuthActionHandler` component when `mode` and `oobCode` parameters are present
- **Example**: `/login?mode=resetPassword&oobCode=xxx` → Shows password reset interface

## Protected Routes

### Authentication Required:
- `/bookmarks`
- `/search-history`
- `/subscription`
- `/support`

### Admin Required:
- `/admin-dashboard`

### Partial Access Allowed:
- `/news-intelligence/newsid/[newsId]` (can view with limited features when not logged in)

### Public Routes:
- `/` (homepage)
- `/login`
- `/pricing`
- `/contact-us`
- `/terms-and-conditions`
- `/privacy-policy`
- `/refund-policy`

## Key Features Retained

✅ **Complete news intelligence functionality**
✅ **Search and filtering capabilities**
✅ **Real-time news updates**
✅ **User authentication with Firebase**
✅ **Admin dashboard with role-based access**
✅ **Partial access for non-authenticated users**
✅ **Theme management**
✅ **Notification system**
✅ **Redux state management**
✅ **SEO optimization with dynamic meta tags**
✅ **Responsive design**

## Development Guidelines

### Adding New Protected Routes

1. Create the page component in `src/app/[route]/page.js`
2. Wrap with appropriate AuthWrapper:
   ```jsx
   export default function MyProtectedPage() {
     return (
       <AuthWrapper requireAuth={true}>
         <MyComponent />
       </AuthWrapper>
     );
   }
   ```

### Adding New Public Routes

1. Create the page component in `src/app/[route]/page.js`
2. No wrapper needed for public routes

### Navigation Between Routes

Use Next.js navigation hooks:
```jsx
import { useRouter } from 'next/navigation'

const router = useRouter()
router.push('/target-route') // For new navigation
router.replace('/target-route') // For replacing current route
```

## Testing

Ensure to test:
- [ ] Authentication flow works correctly
- [ ] Protected routes redirect to login when not authenticated
- [ ] Admin routes require admin role
- [ ] Partial access works for news details
- [ ] All existing functionality remains intact
- [ ] SEO meta tags update correctly
- [ ] Search and filtering work as expected

## Notes

- All original functionality has been preserved
- The app now benefits from Next.js App Router features like automatic code splitting
- SEO is improved with better meta tag management
- Server-side protection adds an extra layer of security
- Client-side protection ensures smooth user experience 