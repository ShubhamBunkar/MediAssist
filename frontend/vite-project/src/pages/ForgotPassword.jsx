import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";

const ForgotPassword = () => {
    console.log("ForgotPassword component loaded");
    
  const [email, setEmail] = useState("");
  const navigate = useNavigate(); // ✅ FIX

 const handleSend = async () => {

  console.log("Button clicked");

  if (!email) {
    return alert("Enter email");
  }

  try {

    const res = await fetch(
      "http://localhost:5000/api/user/forgot-password",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({ email }),
      }
    );

    const data = await res.json();

    // show alert
    alert("Reset OTP sent to your email");

    // navigate to reset password page
    navigate("/verify-otp", {
  state: { email },
});

  } catch (err) {

    console.log(err);

    alert("Server error");
  }
};
  return (
    
    <div style={styles.container}>
      <div style={styles.topBar}>
              <FaArrowLeft style={styles.icon} onClick={() => navigate("/login")} />
            </div>
      <div style={styles.card}>
        <div style ={styles.Forgot}>
          <h2>Forgot Password</h2>
          </div>
        

        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={styles.input}
        />

        <button onClick={handleSend} style={styles.button}>
          Send Reset Otp
        </button>
      </div>
    </div>
  );
};

const styles = {
container: {
  minHeight: "100vh",
  width: "100%",
  margin: 0,
  padding: 0,
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  position: "relative",
  background: `
    radial-gradient(circle at top left, #fdba74 0%, transparent 30%),
    radial-gradient(circle at top right, #fb923c 0%, transparent 25%),
    linear-gradient(to bottom, #fff7ed 0%, #ffffff 55%)
  `,
},
 topBar: {
  position: "fixed",
  top: "20px",
  left: "20px",
  zIndex: 1000,
},
icon: {
  fontSize: "28px",
  cursor: "pointer",
  color: "#333",
},
  card: {
    padding: "30px",
    borderRadius: "20px",
    background: `
    radial-gradient(circle at top left, #fdba74 0%, transparent 30%),
    radial-gradient(circle at top right, #fb923c 0%, transparent 25%),
    linear-gradient(to bottom, #fff7ed 0%, #ffffff 55%)
  `,
    backdropFilter: "blur(15px)",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    width: "300px",
  },
  input: {
    padding: "10px",
    borderRadius: "10px",
    border: "none",
  },
  Forgot:{
    
  },
  button: {
    padding: "10px",
    borderRadius: "10px",
    background: "#7c3aed",
    color: "#fff",
    border: "none",
    cursor: "pointer",
  },
};

export default ForgotPassword;