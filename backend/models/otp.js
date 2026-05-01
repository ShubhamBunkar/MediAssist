const db = require("../config/db"); // your MySQL connection

// Save OTP
const saveOTP = (email, otp, callback) => {
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 min expiry

  const sql = "INSERT INTO otp (email, otp, expires_at) VALUES (?, ?, ?)";

  db.query(sql, [email, otp, expiresAt], callback);
};

// Get latest OTP by email
const getOTPByEmail = (email, callback) => {
  const sql = "SELECT * FROM otp WHERE email = ? ORDER BY id DESC LIMIT 1";

  db.query(sql, [email], callback);
};

module.exports = {
  saveOTP,
  getOTPByEmail,
};