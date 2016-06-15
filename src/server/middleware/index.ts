import { ReflectiveInjector } from '@angular/core';
import { Response } from '../controllers/response';
import { Request } from '../controllers/request';

export interface Middleware {
  (request: Request, response: Response): Response | Promise<Response>;
}

export interface InjectableMiddleware {
  middlewareFactory(...args: any[]): Middleware;
}

export interface InjectableMiddlewareFactory {
  (injector: ReflectiveInjector): Middleware;
}

export interface IsolatedMiddlewareFactory {
  (injector?: ReflectiveInjector): Middleware;
}

export type MiddlewareFactory = InjectableMiddlewareFactory | IsolatedMiddlewareFactory;

export * from './middleware.decorator';
export * from './debugLog.middleware';
