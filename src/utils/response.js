// src/utils/response.js

function success(res, message = "Success", data = {}) {
  return res.status(200).json({
    status: "success",
    message,
    data,
  });
}

function created(res, message = "Created successfully", data = {}) {
  return res.status(201).json({
    status: "success",
    message,
    data,
  });
}

module.exports = { success, created };
