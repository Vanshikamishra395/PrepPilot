// utils/response.util.js
// Small helpers so every API response has the same shape:
// { success: true/false, message, data }
// This makes the frontend's fetch handling predictable.

function success(res, statusCode, message, data = null) {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
}

function error(res, statusCode, message) {
  return res.status(statusCode).json({
    success: false,
    message,
  });
}

module.exports = { success, error };
