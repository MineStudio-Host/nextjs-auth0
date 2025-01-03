import { NextApiResponse, NextApiRequest } from 'next';
import { NextRequest } from 'next/server';
import { AuthorizationParameters, HandleCallback as BaseHandleCallback } from '../auth0-session';
import { Session } from '../session';
import { GetConfig } from '../config';
import { AuthHandler, Handler, OptionsProvider } from './router-helpers';
/**
 * afterCallback hook for page router {@link AfterCallbackPageRoute} and app router {@link AfterCallbackAppRoute}
 */
export type AfterCallback = AfterCallbackPageRoute | AfterCallbackAppRoute;
/**
 * Use this function for validating additional claims on the user's ID token or adding removing items from
 * the session after login.
 *
 * @example Validate additional claims
 *
 * ```js
 * // pages/api/auth/[auth0].js
 * import { handleAuth, handleCallback } from '@auth0/nextjs-auth0';
 *
 * const afterCallback = (req, res, session, state) => {
 *   if (session.user.isAdmin) {
 *     return session;
 *   } else {
 *     res.status(401).end('User is not admin');
 *   }
 * };
 *
 * export default handleAuth({
 *   async callback(req, res) {
 *     try {
 *       await handleCallback(req, res, { afterCallback });
 *     } catch (error) {
 *       res.status(error.status || 500).end();
 *     }
 *   }
 * });
 * ```
 *
 * @example Modify the session after login
 *
 * ```js
 * // pages/api/auth/[auth0].js
 * import { handleAuth, handleCallback } from '@auth0/nextjs-auth0';
 *
 * const afterCallback = (req, res, session, state) => {
 *   session.user.customProperty = 'foo';
 *   delete session.refreshToken;
 *   return session;
 * };
 *
 * export default handleAuth({
 *   async callback(req, res) {
 *     try {
 *       await handleCallback(req, res, { afterCallback });
 *     } catch (error) {
 *       res.status(error.status || 500).end();
 *     }
 *   }
 * });
 * ```
 *
 * @example Redirect successful login based on claim
 *
 * ```js
 * // pages/api/auth/[auth0].js
 * import { handleAuth, handleCallback } from '@auth0/nextjs-auth0';
 *
 * const afterCallback = (req, res, session, state) => {
 *   if (!session.user.isAdmin) {
 *     res.setHeader('Location', '/admin');
 *   }
 *   return session;
 * };
 *
 * export default handleAuth({
 *   async callback(req, res) {
 *     try {
 *       await handleCallback(req, res, { afterCallback });
 *     } catch (error) {
 *       res.status(error.status || 500).end(error.message);
 *     }
 *   }
 * });
 * ```
 *
 * @throws {@link HandlerError}
 *
 * @category Server
 */
export type AfterCallbackPageRoute = (req: NextApiRequest, res: NextApiResponse, session: Session, state?: {
    [key: string]: any;
}) => Promise<Session | undefined> | Session | undefined;
/**
 * Use this function for validating additional claims on the user's ID token or adding removing items from
 * the session after login.
 *
 * @example Validate additional claims
 *
 * ```js
 * // app/api/auth/[auth0]/route.js
 * import { handleAuth, handleCallback } from '@auth0/nextjs-auth0';
 * import { NextResponse } from 'next/server';
 *
 * const afterCallback = (req, session) => {
 *   if (session.user.isAdmin) {
 *     return session;
 *   }
 * };

 * export const GET = handleAuth({
 *   async callback(req, ctx) {
 *     const res = await handleCallback(req, ctx, { afterCallback });
 *     const session = await getSession(req, res);
 *     if (!session) {
 *       return NextResponse.redirect(`${process.env.AUTH0_BASE_URL}/fail`, res);
 *     }
 *     return res;
 *   },
 * });
 * ```
 *
 * @example Modify the session after login
 *
 * ```js
 * // pages/api/auth/[auth0].js
 * import { handleAuth, handleCallback } from '@auth0/nextjs-auth0';
 * import { NextResponse } from 'next/server';
 *
 * const afterCallback = (req, session, state) => {
 *   session.user.customProperty = 'foo';
 *   delete session.refreshToken;
 *   return session;
 * };
 *
 * export const GET = handleAuth({
 *   callback: handleCallback({ afterCallback })
 * });
 * ```
 *
 * @example Redirect successful login based on claim (afterCallback is not required).
 *
 * ```js
 * // pages/api/auth/[auth0].js
 * import { handleAuth, handleCallback } from '@auth0/nextjs-auth0';
 * import { NextResponse } from 'next/server';
 *
 * export const GET = handleAuth({
 *   async callback(req, ctx) {
 *     const res = await handleCallback(req, ctx);
 *     const session = await getSession(req, res);
 *     if (session?.user.isAdmin) {
 *       return NextResponse.redirect(`${process.env.AUTH0_BASE_URL}/admin`, res);
 *     }
 *     return res;
 *   },
 * });
 * ```
 *
 * @throws {@link HandlerError}
 *
 * @category Server
 */
export type AfterCallbackAppRoute = (req: NextRequest, session: Session, state?: {
    [key: string]: any;
}) => Promise<Session | Response | undefined> | Session | Response | undefined;
/**
 * Options to customize the callback handler.
 *
 * @see {@link HandleCallback}
 *
 * @category Server
 */
export interface CallbackOptions {
    afterCallback?: AfterCallback;
    /**
     * This is useful to specify in addition to {@link BaseConfig.baseURL} when your app runs on multiple domains,
     * it should match {@link LoginOptions.authorizationParams.redirect_uri}.
     */
    redirectUri?: string;
    /**
     * This is useful to specify instead of {@link NextConfig.organization} when your app has multiple
     * organizations, it should match {@link LoginOptions.authorizationParams}.
     */
    organization?: string;
    /**
     * This is useful for sending custom query parameters in the body of the code exchange request
     * for use in Actions/Rules.
     */
    authorizationParams?: Partial<AuthorizationParameters>;
}
/**
 * Options provider for the default callback handler.
 * Use this to generate options that depend on values from the request.
 *
 * @category Server
 */
export type CallbackOptionsProvider = OptionsProvider<CallbackOptions>;
/**
 * Use this to customize the default callback handler without overriding it.
 * You can still override the handler if needed.
 *
 * @example Pass an options object
 *
 * ```js
 * // pages/api/auth/[auth0].js
 * import { handleAuth, handleCallback } from '@auth0/nextjs-auth0';
 *
 * export default handleAuth({
 *   callback: handleCallback({ redirectUri: 'https://example.com' })
 * });
 * ```
 *
 * @example Pass a function that receives the request and returns an options object
 *
 * ```js
 * // pages/api/auth/[auth0].js
 * import { handleAuth, handleCallback } from '@auth0/nextjs-auth0';
 *
 * export default handleAuth({
 *   callback: handleCallback((req) => {
 *     return { redirectUri: 'https://example.com' };
 *   })
 * });
 * ```
 *
 * This is useful for generating options that depend on values from the request.
 *
 * @example Override the callback handler
 *
 * ```js
 * import { handleAuth, handleCallback } from '@auth0/nextjs-auth0';
 *
 * export default handleAuth({
 *   callback: async (req, res) => {
 *     try {
 *       await handleCallback(req, res, {
 *         redirectUri: 'https://example.com'
 *       });
 *     } catch (error) {
 *       console.error(error);
 *     }
 *   }
 * });
 * ```
 *
 * @category Server
 */
export type HandleCallback = AuthHandler<CallbackOptions>;
/**
 * The handler for the `/api/auth/callback` API route.
 *
 * @throws {@link HandlerError}
 *
 * @category Server
 */
export type CallbackHandler = Handler<CallbackOptions>;
/**
 * @ignore
 */
export default function handleCallbackFactory(handler: BaseHandleCallback, getConfig: GetConfig): HandleCallback;
//# sourceMappingURL=callback.d.ts.map