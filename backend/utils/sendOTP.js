const SibApiV3Sdk = require("sib-api-v3-sdk");

const defaultClient = SibApiV3Sdk.ApiClient.instance;

const apiKey = defaultClient.authentications["api-key"];

apiKey.apiKey = process.env.BREVO_API_KEY;

const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

const sendOTP = async (email, otp) => {
  try {
    const sendSmtpEmail = {
      sender: {
        email: "shubhambunker333@gmail.com",
        name: "MediAssist",
      },

      to: [
        {
          email: email,
        },
      ],

      subject: "OTP Verification",

      htmlContent: `
        <h2>Your OTP Code</h2>
        <h1>${otp}</h1>
        <p>This OTP is valid for 5 minutes.</p>
      `,
    };

    await apiInstance.sendTransacEmail(sendSmtpEmail);

    console.log("OTP EMAIL SENT");

    return { success: true };
  } catch (error) {
    console.log("BREVO ERROR:", error);

    return { success: false };
  }
};

module.exports = sendOTP;