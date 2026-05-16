const mysql = require("mysql2");

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "1234",
  database: "mediassist",
});

db.connect((err) => {
  if (err) {
    console.error("❌ DB Connection Failed:", err);
  } else {
    console.log("✅ MySQL Connected");
  }
});

const sendOTP = async (email, otp) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const info = await transporter.sendMail({
    from: `"MediAssist" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "OTP Verification",
    html: `<h2>Your OTP</h2><h1>${otp}</h1>`,
  });

  console.log("Email sent:", info.response);
};

module.exports = db;   // ✅ VERY IMPORTANT