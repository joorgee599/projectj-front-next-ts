import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  // Get locale from cookie or use default
  const locale = request.cookies.get('NEXT_LOCALE')?.value || 'es';
  
  // Continue with the request
  const response = NextResponse.next();
  
  // Ensure locale cookie is set
  if (!request.cookies.has('NEXT_LOCALE')) {
    response.cookies.set('NEXT_LOCALE', locale);
  }
  
  return response;
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)']
};
