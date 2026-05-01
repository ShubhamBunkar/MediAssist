const jwt = require("jsonwebtoken");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const sendOTP = require("../utils/sendOTP"); // if used
const registerUser = async (req, res) => {
  try {
    const { name, email, password, bloodGroup, phone } = req.body;

    // Check user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ msg: "User already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      bloodGroup,
      phone,
      emailOtp: otp,
      otpExpiry: Date.now() + 5 * 60 * 1000,
      isVerified: false,
    });

    // Send OTP
    await sendOTP(email, otp);

    res.json({
      success: true,
      msg: "OTP sent to email",
    });

  } catch (err) {
    console.log("❌ Register error:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ msg: "User not found" });
    }

    // ❗ Check email verified
    if (!user.isVerified) {
      return res.status(400).json({ msg: "Please verify your email first" });
    }

    // 🔐 Compare password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ msg: "Invalid password" });
    }

    // 🔑 Generate token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      success: true,
      token,
      user: {
        name: user.name,
        email: user.email,
        bloodGroup: user.bloodGroup,
      },
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({ msg: "Server error" });
  }
};

const verifyEmail = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ msg: "User not found" });
    }

    if (user.emailOtp != otp) {
      return res.status(400).json({ msg: "Invalid OTP" });
    }

    if (user.otpExpiry < Date.now()) {
      return res.status(400).json({ msg: "OTP expired" });
    }

    user.isVerified = true;
    user.emailOtp = null;
    user.otpExpiry = null;

    await user.save();

    res.json({ success: true, msg: "Email verified" });

  } catch (err) {
    console.log(err);
    res.status(500).json({ msg: "Server error" });
  }
};

module.exports = {
  registerUser,
  verifyEmail,
  loginUser,
};
