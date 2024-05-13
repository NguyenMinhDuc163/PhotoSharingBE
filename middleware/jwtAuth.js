// middleware/jwtAuth.js
const jwt = require("jsonwebtoken");
const JWT_SECRET = 'your-secret-key';

function jwtAuth(req, res, next) {
  const token = req.headers.authorization && req.headers.authorization.split(" ")[1];

  if (!token) {
    return res.status(401).send({ error: "Unauthorized" });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.userId = payload.userId; // Attach userId to the request
    next();
  } catch (err) {
    res.status(403).send({ error: "Forbidden" });
  }
}

module.exports = jwtAuth;
