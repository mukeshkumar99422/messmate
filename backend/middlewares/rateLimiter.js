const { Ratelimit } = require("@upstash/ratelimit");
const { redisClient } = require("../config/redis");

/**
 * =============================================================================
 * RATE LIMITER
 * =============================================================================
 *
 *   PUBLIC        - unauthenticated, no req.user/req.existingUser yet
 *     credentialGuess  : login, signup, otp verification             -> IP
 *     emailSend        : resend-otp, send-login-otp, forgot-password -> EMAIL
 *     publicRead       : GET /api/hostels                            -> IP
 *
 *   AUTHENTICATED - req.user exists (after `protect`)
 *     read             : cheap GETs (menus, extras, analytics)       -> USER
 *     write            : normal mutations (purchase, rating, price)  -> USER
 *     aiHeavy          : Gemini-backed routes (extract, analyse)     -> USER
 *     adminWrite       : admin create/update/delete operations       -> USER
 *
 *   GLOBAL        - every single request, regardless of auth state   -> IP
 *
 * All limiters use Upstash's sliding-window-counter algorithm (approximated via two fixed windows, O(1) storage per key)
 * =============================================================================
 */

/**
 * -----------------------------------------------------------------------
 * Rate limiter builder
 * -----------------------------------------------------------------------
 */
const buildLimiter = (prefix, count, window) =>
  new Ratelimit({
    redis: redisClient,
    limiter: Ratelimit.slidingWindow(count, window),
    analytics: true,
    prefix: `rl:${prefix}`,
  });

  /**
 * -----------------------------------------------------------------------
 * builder store
 * -----------------------------------------------------------------------
 */
const store = {
  // ---- OVERALL REQUESTS ON SERVER ----
  global: buildLimiter("global", 300, "1 m"),

  // ---- PER USER/EMAIL/IP REQUESTS ---- 
  // public / unauthenticated
  credentialGuess: buildLimiter("cred", 5, "5 m"),
  emailSend: buildLimiter("email", 10, "5 m"),
  publicRead: buildLimiter("pubread", 50, "5 m"),

  // authenticated
  read: buildLimiter("read", 50, "1 m"),
  write: buildLimiter("write", 10, "1 m"),
  aiHeavy: buildLimiter("ai", 10, "5 m"),
  adminWrite: buildLimiter("adminwrite", 10, "1 m"),
};

/**
 * -----------------------------------------------------------------------
 * Identifier resolution
 * -----------------------------------------------------------------------
 */
const identify = (req, byEmail = false) => {
  if (byEmail) {
    if (req.existingUser?.email) return `email:${req.existingUser.email}`;
    console.warn("[RateLimiter] byEmail requested but req.existingUser missing - falling back to IP");
  }

  if (req.user?._id) return `user:${req.user._id}`;

  const rawIp = req.ip || req.socket?.remoteAddress || "";
  const ip = rawIp.replace(/^::ffff:/, "");
  return ip ? `ip:${ip}` : "anonymous";
};

/**
 * -----------------------------------------------------------------------
 * Middleware factory
 * -----------------------------------------------------------------------
 */
const limit = (limiterInstance, { message, label, byEmail = false }) => {
  return async (req, res, next) => {
    const identifier = identify(req, byEmail);

    try {
      const { success, limit: cap, remaining, reset } = await limiterInstance.limit(identifier);

      res.setHeader("X-RateLimit-Limit", cap);
      res.setHeader("X-RateLimit-Remaining", remaining);
      res.setHeader("X-RateLimit-Reset", Math.max(0, Math.ceil((reset - Date.now()) / 1000)));

      if (!success) {
        const retryAfter = Math.max(0, Math.ceil((reset - Date.now()) / 1000));
        res.setHeader("X-Retry-After", retryAfter);
        console.warn(`[RateLimit:${label}] blocked ${identifier} on ${req.originalUrl}`);
        return res.status(429).json({ message, retryAfter });
      }

      next();
    } catch (error) {
      // Fail-open so an Upstash outage doesn't take the API down with it.
      console.error(`[RateLimit:${label}] Redis error, failing open:`, error.message);
      next();
    }
  };
};

module.exports = {
    //DDoS/botnet attack
  globalLimiter: limit(store.global, {
    message: "Server is busy right now, please try again shortly.",
    label: "global",
  }),

  //brute force atack
  credentialGuessLimiter: limit(store.credentialGuess, {
    message: "Too many attempts. Please try again in 5 minutes.",
    label: "credential-guess",
  }),

  emailSendLimiter: limit(store.emailSend, {
    message: "Too many code requests for this account. Please wait before requesting another.",
    label: "email-send",
    byEmail: true,
  }),

  publicReadLimiter: limit(store.publicRead, {
    message: "Too many requests, please slow down.",
    label: "public-read",
  }),

  readLimiter: limit(store.read, {
    message: "Too many requests, please slow down.",
    label: "read",
  }),

  writeLimiter: limit(store.write, {
    message: "Too many requests, please slow down.",
    label: "write",
  }),

  aiHeavyLimiter: limit(store.aiHeavy, {
    message: "This operation is rate limited due to processing cost. Please wait a few minutes.",
    label: "ai-heavy",
  }),

  adminWriteLimiter: limit(store.adminWrite, {
    message: "Too many requests, please slow down.",
    label: "admin-write",
  }),

  identify,
};