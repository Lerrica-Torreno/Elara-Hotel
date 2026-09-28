import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

import { prisma } from '../config/prisma.js';
import { HttpError } from '../utils/httpError.js';

const ADMIN_COOKIE_NAME =
  'elara_admin_session';

const CUSTOMER_COOKIE_NAME =
  'elara_customer_session';

const ADMIN_ROLES = [
  'SUPER_ADMIN',
  'ADMIN',
  'FRONT_DESK',
  'HOUSEKEEPING',
  'MAINTENANCE'
];

// ============================================================
// JWT
// ============================================================

function jwtSecret() {
  if (
    !process.env.JWT_SECRET
  ) {
    throw new Error(
      'JWT_SECRET is not configured'
    );
  }

  return process.env.JWT_SECRET;
}

export function publicUser(
  user
) {
  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role
  };
}

export function issueToken(
  user
) {
  return jwt.sign(
    {
      sub: user.id,
      role: user.role
    },
    jwtSecret(),
    {
      expiresIn:
        process.env.JWT_EXPIRES_IN ||
        '8h'
    }
  );
}

export function verifyToken(
  token
) {
  return jwt.verify(
    token,
    jwtSecret()
  );
}

// ============================================================
// PORTAL / COOKIE HELPERS
// ============================================================

function normalizeOrigin(
  value
) {
  return String(
    value ?? ''
  )
    .trim()
    .replace(
      /\/$/,
      ''
    );
}

function getRequestOrigin(
  req
) {
  const origin =
    normalizeOrigin(
      req?.headers?.origin
    );

  if (
    origin
  ) {
    return origin;
  }

  const referer =
    String(
      req?.headers?.referer ??
      ''
    );

  if (
    !referer
  ) {
    return '';
  }

  try {
    return normalizeOrigin(
      new URL(
        referer
      ).origin
    );
  } catch {
    return '';
  }
}

export function detectPortal(
  req
) {
  /*
   * Optional explicit header.
   *
   * This is useful if admin and customer
   * frontends are eventually hosted under
   * the same origin.
   */
  const requestedPortal =
    String(
      req?.headers?.[
        'x-elara-portal'
      ] ??
      ''
    )
      .trim()
      .toLowerCase();

  if (
    requestedPortal ===
      'admin' ||
    requestedPortal ===
      'customer'
  ) {
    return requestedPortal;
  }

  const requestOrigin =
    getRequestOrigin(
      req
    );

  const adminOrigin =
    normalizeOrigin(
      process.env
        .ADMIN_APP_ORIGIN
    );

  const customerOrigin =
    normalizeOrigin(
      process.env
        .CUSTOMER_APP_ORIGIN
    );

  if (
    requestOrigin &&
    adminOrigin &&
    requestOrigin ===
      adminOrigin
  ) {
    return 'admin';
  }

  if (
    requestOrigin &&
    customerOrigin &&
    requestOrigin ===
      customerOrigin
  ) {
    return 'customer';
  }

  return null;
}

function cookieNameForRole(
  role
) {
  if (
    role ===
    'CUSTOMER'
  ) {
    return CUSTOMER_COOKIE_NAME;
  }

  if (
    ADMIN_ROLES.includes(
      role
    )
  ) {
    return ADMIN_COOKIE_NAME;
  }

  return null;
}

function cookieOptions() {
  return {
    httpOnly: true,

    secure:
      String(
        process.env.COOKIE_SECURE
      ).toLowerCase() ===
      'true',

    sameSite:
      'lax',

    maxAge:
      8 *
      60 *
      60 *
      1000,

    path:
      '/'
  };
}

function clearCookieOptions() {
  return {
    httpOnly: true,

    secure:
      String(
        process.env.COOKIE_SECURE
      ).toLowerCase() ===
      'true',

    sameSite:
      'lax',

    path:
      '/'
  };
}

// ============================================================
// COOKIE MANAGEMENT
// ============================================================

export function setAuthCookie(
  res,
  token
) {
  /*
   * We issue the token ourselves, so verify it
   * and use its role to determine which portal
   * cookie should be written.
   */
  const payload =
    verifyToken(
      token
    );

  const cookieName =
    cookieNameForRole(
      payload.role
    );

  if (
    !cookieName
  ) {
    throw new Error(
      'Unable to determine authentication cookie.'
    );
  }

  res.cookie(
    cookieName,
    token,
    cookieOptions()
  );
}

export function clearAuthCookie(
  res
) {
  /*
   * Existing routes call:
   *
   * clearAuthCookie(res)
   *
   * Express keeps the original request on
   * res.req, so we can determine which portal
   * initiated logout without changing all of
   * your auth routes.
   */
  const portal =
    detectPortal(
      res?.req
    );

  if (
    portal ===
    'admin'
  ) {
    res.clearCookie(
      ADMIN_COOKIE_NAME,
      clearCookieOptions()
    );

    return;
  }

  if (
    portal ===
    'customer'
  ) {
    res.clearCookie(
      CUSTOMER_COOKIE_NAME,
      clearCookieOptions()
    );

    return;
  }

  /*
   * Fallback when the request source cannot
   * be identified.
   */
  res.clearCookie(
    ADMIN_COOKIE_NAME,
    clearCookieOptions()
  );

  res.clearCookie(
    CUSTOMER_COOKIE_NAME,
    clearCookieOptions()
  );
}

export function readToken(
  req
) {
  // ----------------------------------------------------------
  // Authorization header takes precedence
  // ----------------------------------------------------------

  const authorization =
    req.headers
      .authorization;

  const bearer =
    authorization?.startsWith(
      'Bearer '
    )
      ? authorization.slice(
          7
        )
      : null;

  if (
    bearer
  ) {
    return bearer;
  }

  const portal =
    detectPortal(
      req
    );

  const adminToken =
    req.cookies?.[
      ADMIN_COOKIE_NAME
    ];

  const customerToken =
    req.cookies?.[
      CUSTOMER_COOKIE_NAME
    ];

  // ----------------------------------------------------------
  // Explicit portal
  // ----------------------------------------------------------

  if (
    portal ===
    'admin'
  ) {
    return (
      adminToken ||
      null
    );
  }

  if (
    portal ===
    'customer'
  ) {
    return (
      customerToken ||
      null
    );
  }

  // ----------------------------------------------------------
  // Safe fallback when only one session exists
  // ----------------------------------------------------------

  if (
    adminToken &&
    !customerToken
  ) {
    return adminToken;
  }

  if (
    customerToken &&
    !adminToken
  ) {
    return customerToken;
  }

  /*
   * If both exist and we cannot identify the
   * portal, do not guess which identity should
   * be used.
   */
  return null;
}

// ============================================================
// CUSTOMER REGISTRATION
// ============================================================

export async function createCustomer({
  firstName,
  lastName,
  email,
  phone,
  password
}) {
  const normalizedEmail =
    email
      .trim()
      .toLowerCase();

  const exists =
    await prisma.user.findUnique({
      where: {
        email:
          normalizedEmail
      }
    });

  if (
    exists
  ) {
    throw new HttpError(
      409,
      'An account with this email already exists.'
    );
  }

  const passwordHash =
    await bcrypt.hash(
      password,
      12
    );

  return prisma.user.create({
    data: {
      email:
        normalizedEmail,

      passwordHash,

      firstName:
        firstName.trim(),

      lastName:
        lastName.trim(),

      role:
        'CUSTOMER',

      customerProfile: {
        create: {
          phone:
            phone?.trim() ||
            null
        }
      }
    },

    include: {
      customerProfile:
        true
    }
  });
}

// ============================================================
// ADMIN BOOTSTRAP
// ============================================================

export async function bootstrapAdmin({
  firstName,
  lastName,
  email,
  password
}) {
  const existingAdmins =
    await prisma.user.count({
      where: {
        role: {
          in:
            ADMIN_ROLES
        }
      }
    });

  if (
    existingAdmins >
    0
  ) {
    throw new HttpError(
      403,
      'Admin bootstrap is disabled because an administrator already exists.'
    );
  }

  const normalizedEmail =
    email
      .trim()
      .toLowerCase();

  const existingUser =
    await prisma.user.findUnique({
      where: {
        email:
          normalizedEmail
      }
    });

  if (
    existingUser
  ) {
    throw new HttpError(
      409,
      'An account with this email already exists.'
    );
  }

  const passwordHash =
    await bcrypt.hash(
      password,
      12
    );

  return prisma.user.create({
    data: {
      email:
        normalizedEmail,

      passwordHash,

      firstName:
        firstName.trim(),

      lastName:
        lastName.trim(),

      role:
        'SUPER_ADMIN'
    }
  });
}

// ============================================================
// AUTHENTICATE
// ============================================================

export async function authenticate(
  email,
  password,
  allowedRoles = null
) {
  const normalizedEmail =
    email
      .trim()
      .toLowerCase();

  const user =
    await prisma.user.findUnique({
      where: {
        email:
          normalizedEmail
      }
    });

  if (
    !user ||
    !user.isActive ||
    !user.passwordHash
  ) {
    throw new HttpError(
      401,
      'Incorrect email or password.'
    );
  }

  if (
    allowedRoles &&
    !allowedRoles.includes(
      user.role
    )
  ) {
    throw new HttpError(
      403,
      'This account cannot access this portal.'
    );
  }

  const valid =
    await bcrypt.compare(
      password,
      user.passwordHash
    );

  if (
    !valid
  ) {
    throw new HttpError(
      401,
      'Incorrect email or password.'
    );
  }

  await prisma.user.update({
    where: {
      id:
        user.id
    },

    data: {
      lastLoginAt:
        new Date()
    }
  });

  return user;
}

export {
  ADMIN_COOKIE_NAME,
  CUSTOMER_COOKIE_NAME,
  ADMIN_ROLES
};