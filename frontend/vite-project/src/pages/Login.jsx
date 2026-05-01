import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";

const Login = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  // ✅ Auto redirect if logged in
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));

        if (payload.exp * 1000 > Date.now()) {
          navigate("/home", { replace: true });
        } else {
          localStorage.removeItem("token");
        }
      } catch {
        localStorage.removeItem("token");
      }
    }
  }, [navigate]);

  // ✅ Auto fill email (optional)
  useEffect(() => {
    const savedUser = JSON.parse(localStorage.getItem("user"));

    if (savedUser) {
      setForm((prev) => ({
        ...prev,
        email: savedUser.email,
      }));
    }
  }, []);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:5000/api/user/login", {
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
        alert(data.msg);
        return;
      }

      // ✅ SAVE DATA
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      alert("Login successful!");

      navigate("/home", { replace: true });

    } catch (err) {
      console.error(err);
      alert("Server error");
    }
  };



  return (
    <div style={styles.container}>
       
      <form onSubmit={handleSubmit} style={styles.form}>
        <img src={logo} alt="App Logo" style={styles.logo} />
        <h2>Login</h2>

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

        <button type="submit" style={styles.button}>
          Login
        </button>
        <p>
          {" "}
          Don't have an account? <Link to="/register">Register</Link>
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
    width: "300px",
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

export default Login;
