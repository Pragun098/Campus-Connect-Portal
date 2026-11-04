/**
 * 404 Not Found Middleware
 * Triggered when a requested endpoint does not match any registered routes.
 */
const notFoundHandler = (req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Resource not found: ${req.method} ${req.originalUrl}`
  });
};

/**
 * Global Error Handler Middleware
 * Catches unhandled errors and sends a clean JSON response with an appropriate status code.
 */
const errorHandler = (err, req, res, next) => {
  const isMalformedJson = err.type === 'entity.parse.failed';
  const requestedStatus = Number(err.statusCode || err.status);
  const isClientError =
    Number.isInteger(requestedStatus) &&
    requestedStatus >= 400 &&
    requestedStatus < 500;
  const statusCode = isClientError ? requestedStatus : 500;

  if (statusCode >= 500) {
    console.error('[Error Details]:', err.stack || err.message);
  }

  res.status(statusCode).json({
    success: false,
    message: isMalformedJson
      ? 'Invalid JSON request body.'
      : statusCode >= 500
        ? 'Internal Server Error'
        : err.message
  });
};

module.exports = {
  notFoundHandler,
  errorHandler
};
