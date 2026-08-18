// middleware/error.middleware.js
// Catches any error passed to next(err) from controllers and returns
// a consistent JSON error response instead of leaking stack traces
// or crashing the server.

function errorHandler(err, req, res, next) {
  console.error(err.stack);

  const statusCode = err.statusCode || 500;
  const message =
    process.env.NODE_ENV === "production"
      ? "Something went wrong. Please try again."
      : err.message;

  res.status(statusCode).json({
    success: false,
    message,
  });
}

// Handles requests to routes that don't exist.
function notFound(req, res) {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
}

module.exports = { errorHandler, notFound };
