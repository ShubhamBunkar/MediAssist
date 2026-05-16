import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import addmedicine from "../assets/addmedicine.jpg";
import { FaArrowLeft } from "react-icons/fa";

const AddMedicine = () => {
  const navigate = useNavigate();
  const [times, setTimes] = useState([]);
  const [pillName, setPillName] = useState("");
  const [dose, setDose] = useState("");
  const [time, setTime] = useState("11:30");
  const [period, setPeriod] = useState("AM");
  const [days, setDays] = useState("1");
  const [timing, setTiming] = useState("Before eat");

  const togglePeriod = () => {
    setPeriod(period === "AM" ? "PM" : "AM");
  };

  const addTime = () => {
    setTimes([...times, { time, period }]);
  };

  const toggleTiming = () => {
    setTiming(timing === "Before eat" ? "After eat" : "Before eat");
  };

  const toggleDays = () => {
    setDays((prev) => {
      let next = parseInt(prev, 10) + 1;
      if (next > 30) next = 1;
      return next.toString();
    });
  };

  const saveReminder = () => {
  if (!pillName || !dose || !time) {
    alert("Please fill all fields");
    return;
  }

  const user = JSON.parse(localStorage.getItem("user"));

  const allTimes = [{ time, period }, ...times];

  const newReminders = allTimes.map((t) => {
    const formattedTime = new Date(`2000-01-01T${t.time}`)
      .toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })
      .toUpperCase();

    return {
      id: Date.now() + Math.random(),
      name: pillName,
      dose,
      time: formattedTime,
      displayTime: formattedTime,
      period: t.period,
      days,
      timing,
      createdAt: Date.now(),
      userEmail: user?.email,
      taken: false,
      missed: false,
    };
  });

  const oldReminders =
    JSON.parse(localStorage.getItem("reminders")) || [];

  const updatedReminders = [...oldReminders, ...newReminders];

  localStorage.setItem("reminders", JSON.stringify(updatedReminders));

  alert("Reminder Saved");

  navigate("/home");
};

  const styles = {
    
   pageBg: {
  minHeight: "100vh",
  width: "100%",
   background: `
    radial-gradient(circle at top left, #fdba74 0%, transparent 30%),
    radial-gradient(circle at top right, #fb923c 0%, transparent 25%),
    linear-gradient(to bottom, #fff7ed 0%, #ffffff 55%)
  `,
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
},
    imageContainer: {
      width: "100%",
      height: "25vh",
      display: "flex",
      justifyContent: "center",
      alignItems: "flex-end",
      marginBottom: "10px",
    },
    image: {
      maxHeight: "100%",
      objectFit: "contain",
    },
    header: {
      display: "flex",
      alignItems: "center",
      gap: "10px",
      padding: "10px 0",
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
    title: {
      fontSize: "18px",
      fontWeight: "bold",
      marginBottom: "20px",
    },
    container: {
  width: "100%",
  maxWidth: "380px",
  minHeight: "90vh",   // ✅ changed
  borderRadius: "25px",
  padding: "20px",
  display: "flex",
  flexDirection: "column",
  gap: "10px",
  background: "rgba(255,255,255,0.25)",
  backdropFilter: "blur(15px)",
  boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
},
    field: {
      marginLeft: "0px",
      width: "100%",
      marginTop: "50px",
    },
    label: {
      width: "100%",
      textAlign: "left",
      marginBottom: "5px",
      fontSize: "14px",
      color: "#333",
    },
    input: {
      width: "100%",
      height: "40px",
      borderRadius: "10px",
      padding: "0 12px",
      backgroundColor: "#f3f3f3",
      border: "none",
      outline: "none",
    },
    row: {
      display: "flex",
      gap: "20px",
      width: "100%",
    },
    box: {
      minWidth: "80px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      background: "#f3f3f3",
      borderRadius: "10px",
      padding: "10px 12px",
      cursor: "pointer",
    },
    addBtn: {
  background:
    "linear-gradient(135deg,#22c55e,#16a34a)",
  color: "#fff",
  border: "2px solid #bbf7d0",
  padding: "12px 22px",
  borderRadius: "16px",
  cursor: "pointer",
  fontWeight: "700",
  boxShadow: "0 6px 16px rgba(34,197,94,0.25)",
},
    saveBtn: {
      position: "fixed",
      bottom: "20px",
      left: "50%",
      transform: "translateX(-50%)",
      padding: "12px 20px",
      borderRadius: "20px",
      border: "none",
      background: "#7c3aed",
      color: "#fff",
      fontSize: "14px",
      cursor: "pointer",
    },
  };

  return (
    <div style={styles.pageBg}>
      <div style={styles.container}>
        <div style={styles.header}>
          <div style={styles.topBar}>
            <FaArrowLeft
              style={styles.icon}
              onClick={() => navigate("/home")}
            />
          </div>

          <div style={styles.title}>Add Medicine</div>
        </div>

        <div style={styles.imageContainer}>
          <img src={addmedicine} alt="medicine" style={styles.image} />
        </div>

        <div style={styles.field}>
          <div style={styles.label}>Pill name</div>
          <input
            type="text"
            value={pillName}
            onChange={(e) => setPillName(e.target.value)}
            placeholder="Enter the pill name"
            style={styles.input}
          />
        </div>

        <div>
          <div style={styles.label}>Dose</div>
          <input
            type="text"
            value={dose}
            onChange={(e) => setDose(e.target.value)}
            style={styles.input}
          />
        </div>

        <div>
          <div style={styles.label}>Time</div>
          <div style={styles.row}>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              style={{ ...styles.input, flex: 1 }}
            />

            <div style={styles.box} onClick={togglePeriod}>
              {period} ▼
            </div>

            <button style={styles.addBtn} onClick={addTime}>
              + Add Time
            </button>
            
          </div>
            {times.length > 0 && (
    <div style={{ marginTop: "10px" }}>
      {times.map((t, index) => (
        <p key={index}>
          ⏰ {t.time} {t.period}
        </p>
      ))}
    </div>
  )}
        </div>

        <div>
          <div style={styles.label}>How to use</div>
          <div style={styles.row}>
            <div style={styles.box} onClick={toggleDays}>
              days | {days} ▼
            </div>

            <div style={styles.box} onClick={toggleTiming}>
              {timing} ▼
            </div>
          </div>
          <button style={styles.saveBtn} onClick={saveReminder}>
            Save Reminder
          </button>
        </div>

        
      </div>
    </div>
  );
};

export default AddMedicine;
