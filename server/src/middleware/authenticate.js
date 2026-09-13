"use strict";

const jwt = require("jsonwebtoken");
const { jwtSecret } = require("../config/env");

module.exports = function authenticate(req, res, next) {
  const header = req.headers.authorization || "";
  const [scheme, token] = header.split(" ");

  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({
      error: { message: "Authentication required", status: 401 },
    });
  }

  try {
    const payload = jwt.verify(token, jwtSecret);
    req.user = { id: payload.sub, email: payload.email };
    return next();
  } catch {
    return res.status(401).json({
      error: { message: "Invalid or expired token", status: 401 },
    });
  }
};
