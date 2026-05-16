import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { NativeAudio } from "@capacitor-community/native-audio";

const AlarmScreen = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const data =
    location.state || JSON.parse(localStorage.getItem("activeAlarm")) || {};

  // ✅ START ALARM
  useEffect(() => {
    const startAlarm = async () => {
      try {
        // preload sound
        await NativeAudio.preload({
          assetId: "alarm",
          assetPath: "public/sounds/s1.wav",
          audioChannelNum: 1,
          isUrl: false,
        });

        // play sound
        await NativeAudio.play({
          assetId: "alarm",
        });

        console.log("🔊 Alarm playing");
      } catch (err) {
        console.log("Alarm Error:", err);
      }
    };

    startAlarm();

    // cleanup
    return async () => {
      try {
        await NativeAudio.stop({
          assetId: "alarm",
        });

        await NativeAudio.unload({
          assetId: "alarm",
        });
      } catch (e) {}
    };
  }, []);

  // ✅ STOP ALARM
  const stopAlarm = async () => {
    try {
      await NativeAudio.stop({
        assetId: "alarm",
      });

      await NativeAudio.unload({
        assetId: "alarm",
      });
    } catch (err) {
      console.log(err);
    }
  };

  // ✅ TAKE MEDS
  const handleTakeMeds = async () => {
    await stopAlarm();

    const reminders = JSON.parse(localStorage.getItem("reminders")) || [];

    const updatedReminders = reminders.map((item) =>
      item.id === data.id ? { ...item, taken: true, missed: false } : item,
    );

    localStorage.setItem("reminders", JSON.stringify(updatedReminders));

    // history
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

    navigate("/home");
  };

  return (
    <div style={styles.container}>
      {/* TEXT */}
      <p style={styles.topText}>
        Hey, {data?.name || "User"}! It's time to take your meds.
      </p>

      {/* BELL */}
      <div style={styles.circleOuter}>
        <div style={styles.circleInner}>🔔</div>
      </div>

      {/* TIME */}
      <p style={styles.day}>
        {new Date().toLocaleDateString("en-US", {
          weekday: "long",
        })}
      </p>

      <h1 style={styles.time}>{data?.time || "10:00 AM"}</h1>

      {/* BUTTON */}
      <button style={styles.takeBtn} onClick={handleTakeMeds}>
        Take Meds
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

    fontWeight: "500",
  },

  circleOuter: {
    width: "180px",
    height: "180px",

    borderRadius: "50%",

    background: "rgba(255,255,255,0.2)",

    display: "flex",

    alignItems: "center",
    justifyContent: "center",

    animation: "pulse 1.5s infinite",
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

    fontSize: "18px",
  },

  time: {
    fontSize: "42px",

    margin: "8px 0 35px",

    fontWeight: "700",
  },

  takeBtn: {
    width: "80%",

    maxWidth: "320px",

    padding: "14px",

    borderRadius: "14px",

    border: "none",

    background: "#fff",

    color: "#333",

    fontWeight: "700",

    fontSize: "17px",

    cursor: "pointer",

    boxShadow: "0 8px 20px rgba(0,0,0,0.2)",

    transition: "0.3s",
  },
};

export default AlarmScreen;
