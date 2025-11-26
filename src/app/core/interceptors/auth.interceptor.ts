import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

/**
 * Functional HTTP interceptor that adds authentication token to requests.
 * Automatically injects the Bearer token into the Authorization header
 * for all HTTP requests except authentication endpoints.
 *
 * @example
 * Add to app.config.ts providers:
 * ```typescript
 * provideHttpClient(
 *   withInterceptors([authInterceptor])
 * )
 * ```
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  // Skip adding token for auth endpoints
  if (req.url.includes('/auth/login') || req.url.includes('/auth/register')) {
    return next(req);
  }

  // Get the auth token from the service
  const token = authService.getAuthToken();

  // Clone the request and add the authorization header if token exists
  if (token) {
    const authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });

    return next(authReq);
  }

  // If no token, proceed with the original request
  return next(req);
};
