import React from "react";
import {
  FaArrowLeft,
  FaCog,
  FaEnvelope,
  FaPhone,
  FaCalendar,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import profile from "../assets/profile.avif";

const Profile = () => {
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));
  if (!user) {
  return <h2 style={{ textAlign: "center" }}>No user data found</h2>;
}
  const styles = {
    container: {
      minHeight: "100vh",
      background: "#f5f6fa",
      padding: "20px",
      fontFamily: "sans-serif",
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

    profileSection: {
      textAlign: "center",
      marginBottom: "20px",
    },

    avatar: {
      width: "90px",
      height: "90px",
      borderRadius: "50%",
      marginBottom: "10px",
    },

    name: {
      margin: "5px 0",
    },

    joined: {
      color: "#888",
      fontSize: "14px",
    },

    editBtn: {
      marginTop: "10px",
      padding: "8px 15px",
      borderRadius: "20px",
      border: "none",
      background: "#e5e7eb",
      cursor: "pointer",
    },

    infoCard: {
      background: "#fff",
      borderRadius: "20px",
      padding: "15px",
      boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
    },

    infoTitle: {
      marginBottom: "10px",
    },

    infoItem: {
      display: "flex",
      alignItems: "center",
      gap: "10px",
      padding: "10px",
      background: "#f3f4f6",
      borderRadius: "12px",
      marginBottom: "10px",
    },
  };

  return (
    <div style={styles.container}>
      {/* Top Bar */}
      <div style={styles.topBar}>
        <FaArrowLeft style={styles.icon} onClick={() => navigate("/home")} />
      </div>

      {/* Profile Section */}
      <div style={styles.profileSection}>
        <img src={profile} alt="profile" style={styles.avatar} />
        <h2 style={styles.name}>{user?.name || "Guest"}</h2>

        

        <button style={styles.editBtn}>Edit Profile</button>
      </div>

      {/* Info Section */}
      <div style={styles.infoCard}>
        <div style={styles.infoItem}>
          <FaEnvelope />
          <span>{user?.email || "No email"}</span>
        </div>

        <div style={styles.infoItem}>
          <FaPhone />
          <span>{user?.phone || "No phone"}</span>
        </div>

        <div style={styles.infoItem}>
          <span>🩸 {user?.bloodGroup || "Not set"}</span>
        </div>

        
      </div>
    </div>
  );
};

export default Profile;
