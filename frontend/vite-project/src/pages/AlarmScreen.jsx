import React, { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
const AlarmScreen = () => {
  const location = useLocation();
const navigate = useNavigate();
  const data =
    location.state || JSON.parse(localStorage.getItem("activeAlarm")) || {};

  const audioRef = useRef(null);

 useEffect(() => {
  const audio = new Audio(data?.tone?.file || "/s1.mp3");
  audio.loop = true;
  audio.volume = 1;

  const playSound = async () => {
    try {
      await audio.play();
      console.log("🔊 Alarm playing");
    } catch (err) {
      console.log("Autoplay blocked");

      document.addEventListener(
        "click",
        () => {
          audio.play();
        },
        { once: true }
      );
    }
  };

  playSound();

  audioRef.current = audio;

  return () => {
    audio.pause();
    audio.currentTime = 0;
  };
}, [data]);

  const stopAlarm = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };

   
   const handleTakeMeds = () => {
  stopAlarm();

  const reminders = JSON.parse(localStorage.getItem("reminders")) || [];

  const updatedReminders = reminders.map((item) =>
    item.id === data.id
      ? { ...item, taken: true, missed: false }
      : item
  );

  localStorage.setItem("reminders", JSON.stringify(updatedReminders));

  // ✅ Save to history immediately
  const historyKey = `history_${data.userEmail}`;
  const history = JSON.parse(localStorage.getItem(historyKey)) || [];

  const today = new Date().toISOString().split("T")[0];

  history.unshift({
    id: Date.now(),
    reminderId: data.id,
    name: data.name,
    dosage: data.dose,
    time: data.displayTime,
    date: today,
    status: "Taken",
    userEmail: data.userEmail,
  });

  localStorage.setItem(historyKey, JSON.stringify(history));

  
};
   const handleSnooze = () => {
  stopAlarm();

  const updated = {
    ...data,
    displayTime: new Date(Date.now() + 10 * 60000)
      .toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })
      .toUpperCase(),
  };

  const reminders = JSON.parse(localStorage.getItem("reminders")) || [];

  const updatedReminders = reminders.map((item) =>
    item.id === data.id ? updated : item
  );

  localStorage.setItem("reminders", JSON.stringify(updatedReminders));

  navigate("/home");
};
  return (
    <div style={styles.container}>
      {/* TEXT */}
      <p style={styles.topText}>
  Hey, {data?.name || "User"}! It's time to take your meds.
</p>

      {/* 🔔 Bell Circle */}
      <div style={styles.circleOuter}>
        <div style={styles.circleInner}>🔔</div>
      </div>

      {/* TIME */}
      <p style={styles.day}>Thursday</p>
      <h1 style={styles.time}>{data?.time || "10:00 AM"}</h1>

      {/* BUTTONS */}
     <button
  style={styles.takeBtn}
  onClick={() => {
    stopAlarm();
    navigate("/home");
    handleTakeMeds();
  }}
>
  Take Meds
</button>

      <button style={styles.snoozeBtn} onClick={handleSnooze}>
  Snooze for 10 minutes
</button>
    </div>
  );
};

const styles = {
  container: {
    height: "100vh",
    background: "#4A90E2",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    color: "white",
    textAlign: "center",
    padding: "20px",
  },

  topText: {
    fontSize: "18px",
    marginBottom: "30px",
  },

  circleOuter: {
    width: "180px",
    height: "180px",
    borderRadius: "50%",
    background: "rgba(255,255,255,0.2)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  circleInner: {
    width: "120px",
    height: "120px",
    borderRadius: "50%",
    background: "rgba(255,255,255,0.3)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "50px",
  },

  day: {
    marginTop: "30px",
    opacity: 0.9,
  },

  time: {
    fontSize: "40px",
    margin: "5px 0 30px",
  },

  takeBtn: {
    width: "80%",
    padding: "12px",
    borderRadius: "10px",
    border: "none",
    background: "#fff",
    color: "#333",
    fontWeight: "bold",
    marginBottom: "10px",
    cursor: "pointer",
  },

  snoozeBtn: {
    width: "80%",
    padding: "12px",
    borderRadius: "10px",
    border: "none",
    background: "rgba(255,255,255,0.3)",
    color: "#fff",
    cursor: "pointer",
  },
};

export default AlarmScreen;
