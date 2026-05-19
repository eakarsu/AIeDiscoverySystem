const rateLimit = require('express-rate-limit');
const { ipKeyGenerator } = rateLimit;

const aiRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20,
  keyGenerator: (req, res) => {
    if (req.user && req.user.id) return `user:${req.user.id}`;
    return typeof ipKeyGenerator === 'function' ? ipKeyGenerator(req, res) : (req.ip || 'anon');
  },
  message: { error: 'AI rate limit exceeded. Max 20 requests/hour.' },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { aiRateLimiter };
