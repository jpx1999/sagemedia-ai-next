'use client'

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useSelector } from 'react-redux';

const AuthWrapper = ({ 
  children, 
  requireAuth = false, 
  requireAdmin = false,
  allowPartialAccess = false 
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const [isClient, setIsClient] = useState(false);
  
  const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);
  const userRole = useSelector((state) => state.auth.role);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;

    // Check if this is a news detail page (allow partial access)
    const isNewsDetailPage = /\/news-intelligence\/newsid\/\w+/.test(pathname);
    
    if (isNewsDetailPage && allowPartialAccess) {
      // Allow access but component will show partial features if not logged in
      return;
    }

    // Check admin requirements
    if (requireAdmin) {
      if (!isLoggedIn) {
        router.push('/login');
        return;
      }
      if (userRole !== 'admin') {
        router.push('/news-intelligence');
        return;
      }
    }

    // Check general auth requirements
    if (requireAuth && !isLoggedIn) {
      router.push('/login');
      return;
    }

    // Redirect if logged in user tries to access login page
    if (pathname === '/login' && isLoggedIn) {
      router.push('/news-intelligence');
      return;
    }
  }, [isClient, isLoggedIn, userRole, pathname, requireAuth, requireAdmin, allowPartialAccess, router]);

  // Don't render anything during SSR or initial client load
  if (!isClient) {
    return null;
  }

  // For pages that allow partial access, pass the auth status to children
  if (allowPartialAccess) {
    const isNewsDetailPage = /\/news-intelligence\/newsid\/\w+/.test(pathname);
    if (isNewsDetailPage) {
      // Extract newsId to pass to component
      const newsId = pathname.split('/').pop();
      return React.cloneElement(children, { 
        partialAccess: !isLoggedIn, 
        newsIdParam: newsId 
      });
    }
    return React.cloneElement(children, { partialAccess: !isLoggedIn });
  }

  // For admin-only pages
  if (requireAdmin && (!isLoggedIn || userRole !== 'admin')) {
    return null;
  }

  // For auth-required pages
  if (requireAuth && !isLoggedIn) {
    return null;
  }

  // For login page when user is already logged in
  if (pathname === '/login' && isLoggedIn) {
    return null;
  }

  return children;
};

export default AuthWrapper; 