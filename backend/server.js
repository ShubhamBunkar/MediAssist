require("dotenv").config();
const otpStore = {};
const resetOtpStore = {};
const crypto = require("crypto");
const sendOTP = require("./utils/sendOTP");

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const nodemailer = require("nodemailer");
const express = require("express");

const cors = require("cors");
const mysql = require("mysql2");

const app = express();
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

app.set("transporter", transporter);

// ✅ Middleware (VERY IMPORTANT)
app.use(cors());
app.use(express.json());



// ✅ MySQL Connection
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "1234", // your password
  database: "mediassist"
});

db.connect((err) => {
  if (err) {
    console.log("DB Error:", err);
  } else {
    console.log("MySQL Connected ✅");
  }
});

app.post("/api/user/register", async (req, res) => {
  try {
    const { name, email, password, bloodGroup, phone } = req.body;

    if (!name || !email || !password || !bloodGroup || !phone) {
      return res.status(400).json({
        msg: "All fields required",
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000);

    const emailKey = email.trim().toLowerCase();

    // Store OTP + user data
    otpStore[emailKey] = {
      otp,
      createdAt: Date.now(),
      name,
      email,
      password,
      bloodGroup,
      phone,
    };

    console.log("OTP STORED:", otpStore[emailKey]);

    // Send email
    const emailResult = await sendOTP(emailKey, otp);

    // FIXED CHECK
    if (!emailResult) {
      return res.status(500).json({
        msg: "Email sending failed",
      });
    }

    res.json({
      msg: "OTP sent to email",
    });
  } catch (error) {
    console.log("REGISTER ERROR:", error);

    res.status(500).json({
      msg: "Server error",
    });
  }
});



app.post("/save-token", (req, res) => {
  const { token } = req.body;

  console.log("FCM Token:", token);

  // You can store in DB later
  res.json({ message: "Token saved" });
});

app.get("/", (req, res) => {
  res.send("Server running ✅");
});

  

app.post("/api/user/verify-email", async (req, res) => {
  try {
    const { email, otp } = req.body;

    // ✅ Normalize email
    const emailKey = email.trim().toLowerCase();

    // ✅ Get OTP record
    const record = otpStore[emailKey];

    console.log("VERIFY REQUEST:", email, otp);

    // ✅ Check OTP exists
    if (!record) {
      return res.status(400).json({
        success: false,
        msg: "No OTP found",
      });
    }

    // ✅ Check OTP expiry (5 minutes)
    const isExpired =
      Date.now() - record.createdAt >
      5 * 60 * 1000;

    if (isExpired) {
      delete otpStore[emailKey];

      return res.status(400).json({
        success: false,
        msg: "OTP expired",
      });
    }

    // ✅ Check OTP match
    if (String(record.otp) !== String(otp)) {
      return res.status(400).json({
        success: false,
        msg: "Invalid OTP",
      });
    }

    console.log("✅ OTP VERIFIED");

    // ✅ Check existing user
    const checkSql =
      "SELECT * FROM users WHERE email = ?";

    db.query(checkSql, [record.email], async (checkErr, checkResult) => {
      if (checkErr) {
        console.log("CHECK USER ERROR:", checkErr);

        return res.status(500).json({
          success: false,
          msg: "Database error",
        });
      }

      // ✅ User already exists
      if (checkResult.length > 0) {
        delete otpStore[emailKey];

        return res.status(400).json({
          success: false,
          msg: "User already exists",
        });
      }

      // ✅ Hash password
      const hashedPassword = await bcrypt.hash(
        record.password,
        10
      );

      console.log("PASSWORD HASHED");

      // ✅ Insert user
      const insertSql = `
        INSERT INTO users
        (name, email, password, bloodGroup, phone)
        VALUES (?, ?, ?, ?, ?)
      `;

      db.query(
        insertSql,
        [
          record.name,
          record.email,
          hashedPassword,
          record.bloodGroup,
          record.phone,
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
          delete otpStore[emailKey];

          console.log("✅ USER REGISTERED");

          return res.status(200).json({
            success: true,
            msg: "Email verified & user registered successfully",
          });
        }
      );
    });
  } catch (error) {
    console.log("VERIFY EMAIL ERROR:", error);

    return res.status(500).json({
      success: false,
      msg: "Server error",
    });
  }
});

app.post("/api/user/login", (req, res) => {
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
      { expiresIn: "7d" }
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


app.post("/api/user/forgot-password", (req, res) => {

  const { email } = req.body;

  const sql = "SELECT * FROM users WHERE email = ?";

  db.query(sql, [email], async (err, result) => {

    if (err) {
      return res.status(500).json({ msg: "DB error" });
    }

    if (result.length === 0) {
      return res.json({ msg: "Email not found" });
    }

    // generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000);

    console.log("RESET OTP:", otp);

    // ✅ STORE OTP (THIS WAS MISSING)
    otpStore[email] = otp;

    // send email
    await sendOTP(email, otp);

    res.json({ msg: "Reset OTP sent to email" });
  });
});

app.post("/api/user/verify-otp", (req, res) => {

  const { email, otp } = req.body;

  console.log("STORE:", otpStore);

  if (!email || !otp) {
    return res.status(400).json({
      msg: "Email and OTP required",
    });
  }

  if (String(otpStore[email]) === String(otp)) {

    delete otpStore[email];

    return res.json({
      msg: "OTP verified successfully",
    });

  } else {

    return res.status(400).json({
      msg: "Invalid OTP",
    });
  }
});

app.post("/api/user/reset-password", async (req, res) => {

  const { email, newPassword } = req.body;

  const hashed = await bcrypt.hash(newPassword, 10);

  const sql = "UPDATE users SET password = ? WHERE email = ?";

  db.query(sql, [hashed, email], (err) => {

    if (err) {
      return res.status(500).json({ msg: "DB error" });
    }

    // correct store delete
    delete otpStore[email];

    res.json({ msg: "Password updated successfully ✅" });
  });
});

app.post("/api/send-caregiver-otp", async (req, res) => {

  try {

    const { email } = req.body;

    const emailKey =
      email.trim().toLowerCase();

    if (!emailKey) {

      return res.status(400).json({
        success: false,
        message: "Email required",
      });
    }

    const otp =
      Math.floor(100000 + Math.random() * 900000);

    console.log("CAREGIVER OTP:", otp);

    const sql =
      "INSERT INTO caregiver_otps (email, otp) VALUES (?, ?)";

    db.query(sql, [emailKey, otp], async (err) => {

      if (err) {

        console.log(err);

        return res.status(500).json({
          success: false,
          message: "DB Error",
        });
      }

      try {

        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: emailKey,
          subject: "Caregiver Verification OTP",

          html: `
            <h2>MediAssist OTP</h2>
            <h1>${otp}</h1>
          `,
        });

        res.json({
          success: true,
          message: "OTP sent successfully",
        });

      } catch (mailErr) {

        console.log(mailErr);

        res.status(500).json({
          success: false,
          message: "Email failed",
        });
      }
    });

  } catch (err) {

    console.log(err);

    res.status(500).json({
      success: false,
      message: "Failed to send OTP",
    });
  }
});

app.post("/api/verify-caregiver-otp", (req, res) => {

  const { email, otp } = req.body;

  const emailKey =
    email.trim().toLowerCase();

  const sql =
    "SELECT * FROM caregiver_otps WHERE email = ? ORDER BY id DESC LIMIT 1";

  db.query(sql, [emailKey], (err, result) => {

    if (err) {

      console.log(err);

      return res.status(500).json({
        success: false,
        message: "Database error",
      });
    }

    if (result.length === 0) {

      return res.status(400).json({
        success: false,
        message: "OTP not found",
      });
    }

    const savedOTP = result[0];

    const createdTime =
      new Date(savedOTP.created_at).getTime();

    if (
      Date.now() - createdTime >
      5 * 60 * 1000
    ) {

      return res.status(400).json({
        success: false,
        message: "OTP expired",
      });
    }

    if (
      String(savedOTP.otp) !==
      String(otp)
    ) {

      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    res.json({
      success: true,
      message: "Caregiver verified successfully",
    });
  });
});
app.post(
  "/api/send-caregiver-status",
  async (req, res) => {

    try {

      const {
        caregiverEmail,
        medicineName,
        dose,
        time,
        status,
      } = req.body;

      await transporter.sendMail({
        from: process.env.EMAIL_USER,

        to: caregiverEmail,

        subject:
          `Medicine ${status} Alert`,

        html: `
          <h2>MediAssist Alert</h2>

          <p>
            Medicine:
            <b>${medicineName}</b>
          </p>

          <p>
            Dose:
            <b>${dose}</b>
          </p>

          <p>
            Time:
            <b>${time}</b>
          </p>

          <p>
            Status:
            <b style="color:${
              status === "Taken"
                ? "green"
                : "red"
            };">
              ${status}
            </b>
          </p>
        `,
      });

      res.json({
        success: true,
      });

    } catch (err) {

      console.log(err);

      res.status(500).json({
        success: false,
      });
    }
  }
);
  
app.listen(5000, () => {
  console.log("Server running on port 5000 🚀");
});
