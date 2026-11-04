/**
 * Request Logger Middleware
 * Logs incoming HTTP requests with timestamp, method, URL, and response status.
 */
const logger = (req, res, next) => {
  const timestamp = new Date().toISOString();
  const { method, originalUrl } = req;
  const startTime = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const statusCode = res.statusCode;
    console.log(`[${timestamp}] ${method} ${originalUrl} -> Status: ${statusCode} (${duration}ms)`);
  });

  next();
};

module.exports = logger;
