import React, { useRef, useState } from "react";
import { FaArrowLeft } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const VerifyEmail = () => {
  const OTP_LENGTH = 6;
  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(""));
  const [isVerifying, setIsVerifying] = useState(false);
  const inputRefs = useRef([]);
  const navigate = useNavigate();
  const email = localStorage.getItem("email");

  const focusInput = (index) => {
    inputRefs.current[index]?.focus();
  };

  const handleChange = (value, index) => {
    if (!/^[0-9]?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < OTP_LENGTH - 1) {
      focusInput(index + 1);
    }
  };

  const handleKeyDown = (event, index) => {
    if (event.key === "Backspace" && !otp[index] && index > 0) {
      focusInput(index - 1);
    }
  };

  const handlePaste = (event) => {
    event.preventDefault();
    const pasted = event.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, OTP_LENGTH);

    if (!pasted) return;

    const nextOtp = Array(OTP_LENGTH).fill("");
    pasted.split("").forEach((digit, index) => {
      nextOtp[index] = digit;
    });

    setOtp(nextOtp);
    focusInput(Math.min(pasted.length, OTP_LENGTH) - 1);
  };

  const handleVerify = async () => {
  const code = otp.join("").trim();

  if (!email) {
    alert("Session expired. Please register again.");
    navigate("/register");
    return;
  }

  if (otp.includes("")) {
    alert("Enter full OTP");
    return;
  }

  setIsVerifying(true);

  try {
    const res = await fetch("http://localhost:5000/api/user/verify-email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        otp: code,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.msg || "Invalid OTP");
      return;
    }

    localStorage.removeItem("email");
    alert("Email verified successfully!");
    navigate("/", { replace: true });

  } catch (err) {
    console.log(err);
    alert("Server error");
  } finally {
    setIsVerifying(false);
  }
};
  return (
    <div style={styles.container}>
      <div style={styles.card}>
        {/* Back Arrow */}
        <div style={styles.back} >
            <FaArrowLeft style={styles.icon} onClick={() => navigate("/register")} />

        </div>

        <h2 style={styles.title}>Check your email ✨</h2>
        <p style={styles.subtitle}>
          We sent a verification code to <br />
           <b>{email}</b>
        </p>

        {/* OTP Inputs */}
        <div style={styles.otpContainer}>
          {otp.map((digit, index) => (
            <input
              key={index}
              id={`otp-${index}`}
              ref={(element) => {
                inputRefs.current[index] = element;
              }}
              type="text"
              maxLength="1"
              value={digit}
              onChange={(e) => handleChange(e.target.value, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              onPaste={handlePaste}
              inputMode="numeric"
              autoComplete="one-time-code"
              style={styles.otpBox}
            />
          ))}
        </div>

        {/* Button */}
        <button
          style={styles.button}
          onClick={handleVerify}
          disabled={isVerifying}
        >
          {isVerifying ? "Verifying..." : "Verify email"}
        </button>
      </div>
    </div>
  );
};

const styles = {
  container: {
    height: "100vh",
    background: " #fff",
    padding: "20px", // 🔥 prevents edge sticking on mobile
  },

  card: {
    backgroundColor: "#fff",
    padding: "30px 20px",
    borderRadius: "20px",
    width: "100%",
    maxWidth: "350px", // 🔥 controls size
    boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
    marginTop: "20px",
  },

  back: {
    textAlign: "left",
    fontSize: "18px",
    cursor: "pointer",
    marginBottom: "10px",
  },

  title: {
    marginBottom: "10px",
  },

  subtitle: {
    fontSize: "14px",
    color: "#555",
    marginBottom: "20px",
  },

  otpContainer: {
    display: "flex",
    justifyContent: "space-between",
    gap: "8px",
    marginBottom: "20px",
  },

  otpBox: {
    width: "46px",
    height: "50px",
    textAlign: "center",
    fontSize: "20px",
    borderRadius: "10px",
    border: "1px solid #ccc",
  },

  button: {
    width: "100%",
    padding: "12px",
    backgroundColor: "#3b82f6",
    color: "#fff",
    border: "none",
    borderRadius: "10px",
    fontSize: "16px",
    cursor: "pointer",
    opacity: 1,
  },
};

export default VerifyEmail;
