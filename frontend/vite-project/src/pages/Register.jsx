import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";

const Register = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    bloodGroup: "",
    phone: "",
  });
  // ✅ Handle Input Change
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  // ✅ Handle Submit (Backend Connected)
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:5000/api/user/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      let data;
      try {
        data = await res.json();
      } catch {
        alert("Invalid server response");
        return;
      }

      if (!res.ok) {
        alert(data.msg || "Registration failed");
        return;
      }

      // ✅ Save email for OTP verification
      localStorage.setItem("email", form.email.trim().toLowerCase());

      alert("OTP sent to your email!");

      // ✅ Go to OTP page
      navigate("/verifyEmail");
    } catch (err) {
      console.error(err);
      alert("Server error");
    }
  };
  return (
    <div style={styles.container}>
      <form onSubmit={handleSubmit} style={styles.form}>
        <img src={logo} alt="App Logo" style={styles.logo} />
        <h2>Register</h2>

        <input
          type="text"
          name="name"
          placeholder="Enter name"
          value={form.name}
          onChange={handleChange}
          style={styles.input}
          required
        />

        <input
          type="email"
          name="email"
          placeholder="Enter email"
          value={form.email}
          onChange={handleChange}
          style={styles.input}
          required
        />

        <input
          type="password"
          name="password"
          placeholder="Enter password"
          value={form.password}
          onChange={handleChange}
          style={styles.input}
          required
        />

        <select
          name="bloodGroup"
          value={form.bloodGroup}
          onChange={handleChange}
          style={styles.input}
          required
        >
          <option value="">Select Blood Group</option>
          <option value="A+">A+</option>
          <option value="A-">A-</option>
          <option value="B+">B+</option>
          <option value="B-">B-</option>
          <option value="AB+">AB+</option>
          <option value="AB-">AB-</option>
          <option value="O+">O+</option>
          <option value="O-">O-</option>
        </select>

        <div style={{ display: "flex", gap: "8px" }}>

  {/* Locked Country Code */}
  <input
    type="text"
    value="+91"
    readOnly
    style={{
      width: "25%",
      padding: "10px",
      borderRadius: "15px",
      backgroundColor: "#f0f0f0",
      cursor: "not-allowed",
      textAlign: "center",
      marginBottom:"10px"
    }}
  />

  {/* Phone Number */}
  <input
    type="text"
    name="phone"
    placeholder="Enter phone"
    value={form.phone}
    onChange={(e) => {
      const value = e.target.value.replace(/\D/g, "");

      if (value.length <= 10) {
        setForm({
          ...form,
          phone: value,
        });
      }
    }}
    style={{
      width: "75%",
      padding: "10px",
      borderRadius: "15px",
      marginBottom:"10px",
    }}
    maxLength={10}
    required
  />
</div>

        <button type="submit" style={styles.button}>
          Register
        </button>

        <p>
          Already have an account? <Link to="/">Login</Link>
        </p>
      </form>
    </div>
  );
};

const styles = {
  container: {
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  logo: {
    width: "150px",
    height: "200px",
    objectFit: "contain",
    display: "block",
    margin: "0 auto 15px auto", // center horizontally
  },
  form: {
    padding: "30px",
    borderRadius: "10px",
    background: "#fff",
    boxShadow: "0 0 10px rgba(0,0,0,0.1)",
    display: "flex",
    flexDirection: "column",
    width: "320px",
  },
  input: {
    marginBottom: "15px",
    padding: "10px",
    fontSize: "16px",
    borderRadius: "15px",
  },
  button: {
    padding: "10px",
    backgroundColor: "#007bff",
    color: "#fff",
    border: "none",
    cursor: "pointer",
  },
};

export default Register;
