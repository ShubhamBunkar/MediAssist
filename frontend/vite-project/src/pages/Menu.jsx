import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { FaSignOutAlt } from "react-icons/fa";

const Menu = () => {
  const navigate = useNavigate();
  const [isOn, setIsOn] = useState(true);

  // 🔐 Protect page (redirect if not logged in)
 
  // 🔓 Logout function
  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
   navigate("/login", { replace: true });
  };

  const styles = {
    container: {
      
      position: "relative",
      minHeight: "200vh",
      padding: "20px",
      display: "flex",
      gap: "10px",
      flexDirection: "column",
    },
    menuBtn: {
      position: "absolute",
      top: "20px",
      right: "20px",
      fontSize: "24px",
      padding: "10px",
      border: "none",
      cursor: "pointer",
      backgroundColor: "#f4f6f8",
    },
    button: {
      width: "200px",
      height: "50px",
      borderRadius: "20px",
      cursor: "pointer",
      marginTop: "20px",
      display: "flex",
      marginLeft: "auto",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "0 15px",
      backgroundColor: "white",
      color: "black",
      border: "2px solid black",
    },
    switch: {
      width: "50px",
      height: "26px",
      borderRadius: "50px",
      display: "flex",
      alignItems: "center",
      padding: "2px",
      cursor: "pointer",
    },
    circle: {
      width: "22px",
      height: "22px",
      borderRadius: "50%",
      backgroundColor: "#fff",
      transition: "0.3s",
    },
  };

  return (
    <div style={styles.container}>
      {/* Menu Button */}
      <button onClick={() => navigate("/home")} style={styles.menuBtn}>
        ☰
      </button>

      {/* History */}
      <button
        style={{ ...styles.button, marginTop: "60px" }}
        onClick={() => navigate("/ReminderHistory")}
      >
        History
      </button>

      {/* Notification Toggle */}
      <div
  style={styles.button}
  onClick={() => navigate("/PushNotification")} // ✅ ONLY ROW CLICK NAVIGATES
>
  <span>Push notification</span>

  <div
    style={{
      ...styles.switch,
      backgroundColor: isOn ? "#3b82f6" : "#ccc",
    }}
    onClick={(e) => {
      e.stopPropagation(); // ✅ PREVENT NAVIGATION
      setIsOn(!isOn);
    }}
  >
    <div
      style={{
        ...styles.circle,
        transform: isOn ? "translateX(24px)" : "translateX(2px)",
      }}
    />
  </div>
</div>
      {/* Alarm */}
      <button style={styles.button} onClick={() => navigate("/AlarmSetting")}>
        Alarm setting
      </button>

      {/* ✅ Logout (fixed) */}
      <button style={styles.button} onClick={handleLogout}>
  Logout
  <FaSignOutAlt />
</button>
    </div>
  );
};

export default Menu;
