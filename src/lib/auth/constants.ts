export const SESSION_COOKIE_NAME = "fitflow_session";

/** Seven days in seconds */
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7;

export const PROTECTED_ROUTE_PREFIXES = ["/chat", "/home"] as const;

export const AUTH_ROUTES = ["/sign-in", "/sign-up"] as const;
