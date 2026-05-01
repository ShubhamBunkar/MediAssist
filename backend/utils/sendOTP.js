const nodemailer = require("nodemailer");

const sendOTP = async (email, otp) => {
  const deliveryMode = (process.env.OTP_DELIVERY || "console").toLowerCase();
  console.log("Mode:", deliveryMode);
  console.log("Email config:", process.env.EMAIL_USER);
  if (deliveryMode === "console") {
    console.log(`[OTP] ${email}: ${otp}`);
    return { success: true, mode: "console" };
  }

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"MediAssist" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "OTP Verification",
      html: `
    <h2>Your OTP Code</h2>
    <h1>${otp}</h1>
    <p>This OTP is valid for 5 minutes.</p>
  `,
    });

    console.log("OTP sent by email");
    return { success: true, mode: "smtp" };
  } catch (err) {
    console.log("Email error:", err);
    throw new Error("Failed to send OTP email");
  }
};

module.exports = sendOTP;
