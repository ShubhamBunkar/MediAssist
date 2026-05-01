import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";

const PushNotification = () => {
  const [caregiverEmail, setCaregiverEmail] = useState(
    localStorage.getItem("caregiverEmail") || "",
  );

  const [notifications, setNotifications] = useState([]);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const userEmail = user?.email;

  // 🔔 Load missed medicines
  useEffect(() => {
    const interval = setInterval(() => {
      const reminders = JSON.parse(localStorage.getItem("reminders")) || [];
      const now = new Date();

      const missed = reminders.filter((item) => {
        const time = new Date(item.createdAt);
        const diff = now - time;

        return (
          !item.taken && diff > 60000 // 1 min rule (change as needed)
        );
      });

      setNotifications(missed);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const sendStatusEmail = async (medicine, status) => {
    const caregiver = localStorage.getItem("caregiverEmail");

    if (!caregiver) return;

    try {
      await fetch("http://localhost:5000/api/send-mail", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: caregiver,
          subject: `Medicine ${status}`,
          message: `
          Medicine: ${medicine.name}
          Dose: ${medicine.dose}
          Time: ${medicine.displayTime}
          Status: ${status}
        `,
        }),
      });
    } catch (err) {
      console.log("Email failed", err);
    }
  };

  // 📧 Send email to backend
  const sendEmail = async (medicine) => {
    try {
      const res = await fetch("http://localhost:5000/api/send-mail", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: userEmail,
          name: medicine.name,
          time: medicine.displayTime,
        }),
      });

      const data = await res.json();
      alert(data.message || "Email sent!");
    } catch (err) {
      console.log(err);
      alert("Failed to send email");
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.topBar}>
        <FaArrowLeft style={styles.icon} onClick={() => navigate("/menu")} />
      </div>

      <div style={{ marginBottom: "15px" }}>
        <h3>👨‍👩‍👧 Caregiver Email</h3>

        <input
          type="email"
          placeholder="Enter son/daughter email"
          value={caregiverEmail}
          onChange={(e) => setCaregiverEmail(e.target.value)}
          style={{
            width: "100%",
            padding: "10px",
            borderRadius: "8px",
            marginBottom: "10px",
          }}
        />

        <button
          style={styles.btn}
          onClick={() => {
            localStorage.setItem("caregiverEmail", caregiverEmail);
            alert("Caregiver saved!");
          }}
        >
          💾 Save Caregiver Email
        </button>
      </div>

      <h2>🔔 Missed Medicine Notifications</h2>

      {notifications.length === 0 ? (
        <p>No missed medicines 🎉</p>
      ) : (
        notifications.map((item) => (
          <div key={item.id} style={styles.card}>
            <h3>💊 {item.name}</h3>
            <p>⏰ Time: {item.displayTime}</p>
            <p style={{ color: "red" }}>❌ Status: Missed</p>

            
          </div>
        ))
      )}
    </div>
  );
};

const styles = {
  container: {
    padding: "20px",
    background: "#f4f6f8",
    minHeight: "100vh",
  },
  card: {
    background: "#fff",
    padding: "15px",
    margin: "10px 0",
    borderRadius: "10px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  },
  topBar: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "20px",
  },

  icon: {
    fontSize: "20px",
    cursor: "pointer",
  },
  btn: {
    marginTop: "10px",
    padding: "10px",
    background: "#2563eb",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
  },
};

export default PushNotification;
