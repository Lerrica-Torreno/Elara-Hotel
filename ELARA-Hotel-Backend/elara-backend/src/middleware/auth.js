import {
  prisma
} from '../config/prisma.js';

import {
  readToken,
  verifyToken
} from '../services/auth.service.js';

import {
  HttpError
} from '../utils/httpError.js';

// Roles permitted to enter staff-only API areas.
export const adminRoles = [
  'SUPER_ADMIN',
  'ADMIN',
  'FRONT_DESK',
  'HOUSEKEEPING',
  'MAINTENANCE'
];

// ============================================================
// LOAD USER FROM TOKEN
// ============================================================

async function userFromRequest(
  req
) {
  // Resolve the session token and reload its user so disabled or changed accounts cannot retain access.
  const token =
    readToken(
      req
    );

  if (
    !token
  ) {
    return null;
  }

  const payload =
    verifyToken(
      token
    );

  if (
    !payload?.sub
  ) {
    return null;
  }

  const user =
    await prisma.user.findUnique({
      where: {
        id:
          payload.sub
      }
    });

  if (
    !user ||
    !user.isActive
  ) {
    return null;
  }

  /*
   * Protect against a stale JWT containing
   * an old role after the database role has
   * changed.
   */
  if (
    payload.role &&
    payload.role !==
      user.role
  ) {
    return null;
  }

  return user;
}

// ============================================================
// OPTIONAL AUTH
// ============================================================

export async function optionalAuth(
  req,
  _res,
  next
) {
  // Attach a valid user when present, but allow requests with missing or invalid sessions to continue.
  try {
    const user =
      await userFromRequest(
        req
      );

    if (
      user
    ) {
      req.user =
        user;
    }

    next();
  } catch {
    /*
     * Optional authentication should never
     * block an anonymous request just because
     * a cookie is invalid or expired.
     */
    next();
  }
}

// ============================================================
// REQUIRE AUTH
// ============================================================

export async function requireAuth(
  req,
  _res,
  next
) {
  // Reject requests without a valid active-user session before protected handlers run.
  try {
    const token =
      readToken(
        req
      );

    if (
      !token
    ) {
      throw new HttpError(
        401,
        'Authentication required.'
      );
    }

    const payload =
      verifyToken(
        token
      );

    if (
      !payload?.sub
    ) {
      throw new HttpError(
        401,
        'Invalid or expired session.'
      );
    }

    const user =
      await prisma.user.findUnique({
        where: {
          id:
            payload.sub
        }
      });

    if (
      !user ||
      !user.isActive
    ) {
      throw new HttpError(
        401,
        'Session is no longer valid.'
      );
    }

    /*
     * Prevent stale sessions from retaining
     * privileges if a user's role is changed.
     */
    if (
      payload.role &&
      payload.role !==
        user.role
    ) {
      throw new HttpError(
        401,
        'Session is no longer valid.'
      );
    }

    req.user =
      user;

    next();
  } catch (
    error
  ) {
    if (
      error?.status
    ) {
      return next(
        error
      );
    }

    return next(
      new HttpError(
        401,
        'Invalid or expired session.'
      )
    );
  }
}

// ============================================================
// REQUIRE ROLE
// ============================================================

export function requireRoles(
  ...roles
) {
  // Build route middleware that grants access only to the listed user roles.
  return (
    req,
    _res,
    next
  ) => {
    if (
      !req.user ||
      !roles.includes(
        req.user.role
      )
    ) {
      return next(
        new HttpError(
          403,
          'You do not have permission to perform this action.'
        )
      );
    }

    next();
  };
}

// ============================================================
// CUSTOMER ONLY
// ============================================================

export function requireCustomer(
  req,
  _res,
  next
) {
  // Restrict customer-owned operations to authenticated customer accounts.
  if (
    !req.user ||
    req.user.role !==
      'CUSTOMER'
  ) {
    return next(
      new HttpError(
        403,
        'Customer account required.'
      )
    );
  }

  next();
}

// ============================================================
// ADMIN / STAFF ONLY
// ============================================================

export function requireAdmin(
  req,
  _res,
  next
) {
  // Restrict staff operations to the shared set of administrative roles.
  if (
    !req.user ||
    !adminRoles.includes(
      req.user.role
    )
  ) {
    return next(
      new HttpError(
        403,
        'Administrator account required.'
      )
    );
  }

  next();
}