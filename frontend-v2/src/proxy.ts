import createMiddleware from 'next-intl/middleware';

import {routing} from './i18n/routing';
 
export default createMiddleware(routing);
 
export const config = {
  // Match only internationalized pathnames
  matcher: [
    // Match all pathnames except for
    // - API routes
    // - Static files (_next, etc.)
    // - Metadata files (favicon.ico, etc.)
    '/((?!api|_next|_vercel|.*\\..*).*)',
    // Match all pathnames within locales
    '/',
    '/(es|en)/:path*'
  ]
};
