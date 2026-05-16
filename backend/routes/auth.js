const express = require("express");
const router = express.Router();
const db = require("../db");
const bcrypt = require("bcryptjs");
const sendOTP = require("../utils/sendOTP");
const jwt = require("jsonwebtoken");

// TEMP STORE (dev only)
const otpStore = {};

/* ===================== SEND OTP ===================== */
router.post("/send-otp", async (req, res) => {
  try {
    const { name, email, password, bloodGroup, phone } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        msg: "Email and password required",
      });
    }

    const cleanEmail = email.toLowerCase().trim();

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000);

    // Store OTP
    otpStore[cleanEmail] = {
      otp,
      createdAt: Date.now(),
      name,
      email: cleanEmail,
      password,
      bloodGroup,
      phone,
    };

    console.log("OTP STORED:", otpStore[cleanEmail]);

    // Send Email
    const emailSent = await sendOTP(cleanEmail, otp);

    // IMPORTANT CHECK
    if (!emailSent) {
      return res.status(500).json({
        msg: "Failed to send OTP email",
      });
    }

    res.json({
      msg: "OTP sent successfully",
    });
  } catch (err) {
    console.log("SEND OTP ERROR:", err);

    res.status(500).json({
      msg: "Server error",
      error: err.message,
    });
  }
});
/* ===================== VERIFY OTP ===================== */
router.post("/verify-email", async (req, res) => {
  console.log("✅ VERIFY ROUTE HIT");

  try {
    const { email, otp } = req.body;

    // ✅ Validate input
    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        msg: "Email and OTP required",
      });
    }

    // ✅ Normalize email
    const cleanEmail = email.trim().toLowerCase();

    // ✅ Get stored OTP data
    const stored = otpStore[cleanEmail];

    // ✅ Check OTP exists
    if (!stored) {
      return res.status(400).json({
        success: false,
        msg: "OTP expired or not found",
      });
    }

    console.log("OTP RECEIVED:", otp);
    console.log("OTP STORED:", stored.otp);

    // ✅ Check expiry (5 min)
    const isExpired =
      Date.now() - stored.createdAt >
      5 * 60 * 1000;

    if (isExpired) {
      delete otpStore[cleanEmail];

      return res.status(400).json({
        success: false,
        msg: "OTP expired",
      });
    }

    // ✅ Verify OTP
    if (String(otp) !== String(stored.otp)) {
      console.log("❌ OTP MISMATCH");

      return res.status(400).json({
        success: false,
        msg: "Invalid OTP",
      });
    }

    console.log("✅ OTP VERIFIED");

    // ✅ Check if user already exists
    const checkSql =
      "SELECT * FROM users WHERE email = ?";

    db.query(checkSql, [cleanEmail], async (checkErr, result) => {
      if (checkErr) {
        console.log("CHECK USER ERROR:", checkErr);

        return res.status(500).json({
          success: false,
          msg: "Database error",
        });
      }

      // ✅ Duplicate email
      if (result.length > 0) {
        delete otpStore[cleanEmail];

        return res.status(400).json({
          success: false,
          msg: "Email already exists",
        });
      }

      // ✅ Hash password
      const hashedPassword = await bcrypt.hash(
        stored.password,
        10
      );

      console.log("✅ PASSWORD HASHED");

      // ✅ Insert user
      const insertSql = `
        INSERT INTO users
        (name, email, password, bloodGroup, phone)
        VALUES (?, ?, ?, ?, ?)
      `;

      db.query(
        insertSql,
        [
          stored.name,
          stored.email,
          hashedPassword,
          stored.bloodGroup,
          stored.phone,
        ],
        (insertErr) => {
          if (insertErr) {
            console.log("INSERT ERROR:", insertErr);

            return res.status(500).json({
              success: false,
              msg: "Failed to register user",
            });
          }

          // ✅ Remove OTP after success
          delete otpStore[cleanEmail];

          console.log("✅ USER REGISTERED");

          return res.status(200).json({
            success: true,
            msg: "User registered successfully ✅",
          });
        }
      );
    });
  } catch (err) {
    console.log("VERIFY ERROR:", err);

    return res.status(500).json({
      success: false,
      msg: "Server error",
    });
  }
});

/* ===================== LOGIN ===================== */
router.post("/login", (req, res) => {
  const email = req.body.email.toLowerCase().trim();
  const { password } = req.body;

  const sql = "SELECT * FROM users WHERE email = ?";

  db.query(sql, [email], async (err, result) => {
    if (err) {
      console.log("LOGIN DB ERROR:", err);
      return res.status(500).json({ msg: "Server error" });
    }

    if (result.length === 0) {
      return res.status(400).json({ msg: "User not found" });
    }

    const user = result[0];

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET || "secret123",
      { expiresIn: "7d" },
    );

    res.json({
      msg: "Login successful ✅",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  });
});


 router.post("/reset-password", async (req, res) => {

  const {
    email,
    otp,
    newPassword,
  } = req.body;

  // check otp
  if (otpStore[email] != otp) {

    return res.status(400).json({
      msg: "Invalid OTP",
    });
  }

  // hash password
  const hashedPassword =
    await bcrypt.hash(newPassword, 10);

  // update password
  db.query(
    "UPDATE users SET password = ? WHERE email = ?",
    [hashedPassword, email],
    (err, result) => {

      if (err) {
        return res.status(500).json({
          msg: "Database error",
        });
      }

      // remove otp after success
      delete otpStore[email];

      res.json({
        msg: "Password updated successfully",
      });
    }
  );
});

router.post("/forgot-password", (req, res) => {

  const { email } = req.body;

  db.query(
    "SELECT * FROM users WHERE email = ?",
    [email],
    (err, result) => {

      if (err) {
        return res.status(500).json({
          msg: "Database error",
        });
      }

      if (result.length === 0) {
        return res.status(404).json({
          msg: "Email not registered",
        });
      }

      // generate 6 digit otp
      const otp =
        Math.floor(100000 + Math.random() * 900000);

      // save otp
      otpStore[email] = otp;

      // gmail transporter
      const transporter =
        nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: "yourgmail@gmail.com",
            pass: "YOUR_APP_PASSWORD",
          },
        });

      // send mail
      transporter.sendMail({
        from: "yourgmail@gmail.com",
        to: email,
        subject: "Password Reset OTP",

        html: `
          <h2>Your OTP</h2>
          <h1>${otp}</h1>
        `,
      });

      res.json({
        msg: "OTP sent to email",
      });
    }
  );
});

router.post("/verify-otp", (req, res) => {
  console.log("VERIFY OTP API CALLED");

  const { email, otp } = req.body;

  // check otp
  if (otpStore[email] != otp) {

    return res.status(400).json({
      msg: "Invalid OTP",
    });
  }

  res.json({
    msg: "OTP verified",
  });
});

router.post("/send-caregiver-otp", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email required",
      });
    }

    // Generate OTP
    const otp = Math.floor(
      100000 + Math.random() * 900000,
    ).toString();

    // Save OTP temporarily
    otpStore[email] = {
      otp,
      createdAt: Date.now(),
    };

    // Send Mail
    const transporter =
      req.app.get("transporter");

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Caregiver Verification OTP",
      html: `
        <h2>MediAssist Caregiver Verification</h2>

        <p>Your OTP is:</p>

        <h1 style="color:#f97316;">
          ${otp}
        </h1>

        <p>
          OTP valid for 5 minutes
        </p>
      `,
    });

    res.json({
      success: true,
      message: "OTP sent successfully",
    });
  } catch (err) {
    console.log(err);

    res.status(500).json({
      success: false,
      message: "Failed to send OTP",
    });
  }
});

// ================= VERIFY OTP =================
router.post("/verify-caregiver-otp", (req, res) => {
  try {
    const { email, otp } = req.body;

    const savedOTP = otpStore[email];

    if (!savedOTP) {
      return res.status(400).json({
        success: false,
        message: "OTP not found",
      });
    }

    const isExpired =
      Date.now() - savedOTP.createdAt >
      5 * 60 * 1000;

    if (isExpired) {
      delete otpStore[email];

      return res.status(400).json({
        success: false,
        message: "OTP expired",
      });
    }

    if (savedOTP.otp !== otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    delete otpStore[email];

    res.json({
      success: true,
      message: "Caregiver Verified Successfully",
    });
  } catch (err) {
    console.log(err);

    res.status(500).json({
      success: false,
      message: "Verification Failed",
    });
  }
});

module.exports = router;
