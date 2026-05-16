import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FaBars, FaCheck, FaClock, FaHome } from "react-icons/fa";
import pill from "../assets/pill.png";
import profile from "../assets/profile.avif";

const Home = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const triggered = useRef(new Set());
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const userName = user?.name || "User";
  const userEmail = user?.email || "";
  const [list, setList] = useState([]);

   
  

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  const getHistoryKey = () => `history_${userEmail}`;

  const saveToHistory = (medicine, status) => {
    if (!userEmail) return;

    const historyKey = getHistoryKey();
    const oldHistory = JSON.parse(localStorage.getItem(historyKey)) || [];
    const today = new Date().toISOString().split("T")[0];

    const existingIndex = oldHistory.findIndex(
      (entry) => entry.reminderId === medicine.id && entry.date === today,
    );

    const newEntry = {
      id: existingIndex >= 0 ? oldHistory[existingIndex].id : Date.now(),
      reminderId: medicine.id,
      name: medicine.name,
      dosage: medicine.dose,
      time: medicine.displayTime,
      date: today,
      status,
      userEmail,
    };

    const updatedHistory = [...oldHistory];

    if (existingIndex >= 0) {
      updatedHistory[existingIndex] = newEntry;
    } else {
      updatedHistory.unshift(newEntry);
    }

    localStorage.setItem(historyKey, JSON.stringify(updatedHistory));
  };

  const updateReminderStatus = (reminderId, updates) => {
    const reminders = JSON.parse(localStorage.getItem("reminders")) || [];
    const updatedReminders = reminders.map((item) =>
      item.id === reminderId ? { ...item, ...updates } : item,
    );

    localStorage.setItem("reminders", JSON.stringify(updatedReminders));
  };

  

  useEffect(() => {
    const interval = setInterval(() => {
      const user = JSON.parse(localStorage.getItem("user") || "null");
      if (!user) return;

      const reminders = JSON.parse(localStorage.getItem("reminders")) || [];
      const historyKey = `history_${user.email}`;
      const history = JSON.parse(localStorage.getItem(historyKey)) || [];

      const activeReminders = [];
      const expiredReminders = [];

      const today = new Date().toISOString().split("T")[0];

      reminders.forEach((item) => {
        const isExpired = Date.now() - item.createdAt >= 24 * 60 * 60 * 1000;

        if (isExpired) {
          const alreadyExists = history.some(
            (h) => h.reminderId === item.id && h.date === today,
          );

          if (!alreadyExists) {
            expiredReminders.push({
              id: Date.now() + Math.random(),
              reminderId: item.id,
              name: item.name,
              dosage: item.dose,
              time: item.displayTime,
              date: today,
              status: item.taken ? "Taken" : "Missed",
              userEmail: user.email,
            });
          }
        } else {
          activeReminders.push(item);
        }
      });

      // ✅ Save updates
      localStorage.setItem("reminders", JSON.stringify(activeReminders));
      localStorage.setItem(
        historyKey,
        JSON.stringify([...expiredReminders, ...history]),
      );

      setList(activeReminders); // update UI
    }, 60000); // ⏱ every 1 minute

    return () => clearInterval(interval);
  }, [userEmail]);

  

  useEffect(() => {
    if (!userEmail) return;
    const interval = setInterval(() => {
      const currentTime = new Date()
        .toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        })
        .toUpperCase();

      const reminders = JSON.parse(localStorage.getItem("reminders")) || [];

      reminders.forEach((item) => {
        if (
          item.userEmail === userEmail &&
          item.displayTime === currentTime &&
          !item.taken &&
          !item.missed &&
          !item.handled && // ✅ ADD THIS
          !triggered.current.has(item.id)
        ) {
          triggered.current.add(item.id);
          navigate("/AlarmScreen", { state: item });
        }
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [navigate, userEmail]);

  useEffect(() => {
  const token = localStorage.getItem("token");

  if (!token) {
    navigate("/login", { replace: true });
    return;
  }

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));

    if (payload.exp * 1000 < Date.now()) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      navigate("/login", { replace: true });
    }

  } catch (err) {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login", { replace: true });
  }

}, [navigate]);

  useEffect(() => {
    if (!userEmail) {
      setList([]); // clear UI after logout
      return;
    }

    const saved = JSON.parse(localStorage.getItem("reminders")) || [];

    const userReminders = saved.filter((item) => item.userEmail === userEmail);

    setList(userReminders);
  }, [location, userEmail]);

  return (
    
    <div style={styles.container}>
      <button onClick={() => navigate("/Menu")} style={styles.menuBtn}>
        <FaBars />
      </button>

      <div style={styles.circ} onClick={() => navigate("/profile")}>
        <img src={profile} alt="profile" style={styles.profileimage} />
      </div>
      <h2>
        {getGreeting()} <span style={{ color: "#4CAF50" }}>{userName}</span>
      </h2>
      <h3> how you feel today?</h3>
       
       {/* HEALTH CARE ADVICE */}
<div style={styles.healthAdviceContainer}>

  <div style={styles.adviceCard}>
    <div style={styles.adviceIcon}>💧</div>

    <div>
      <h4 style={styles.adviceTitle}>
        Stay Hydrated
      </h4>

      <p style={styles.adviceText}>
        Drink enough water daily
      </p>
    </div>
  </div>

  <div style={styles.adviceCard}>
    <div style={styles.adviceIcon}>🥗</div>

    <div>
      <h4 style={styles.adviceTitle}>
        Healthy Food
      </h4>

      <p style={styles.adviceText}>
        Eat fruits & vegetables
      </p>
    </div>
  </div>

  <div style={styles.adviceCard}>
    <div style={styles.adviceIcon}>🚶</div>

    <div>
      <h4 style={styles.adviceTitle}>
        Daily Exercise
      </h4>

      <p style={styles.adviceText}>
        Walk 20 minutes every day
      </p>
    </div>
  </div>

  <div style={styles.adviceCard}>
    <div style={styles.adviceIcon}>😴</div>

    <div>
      <h4 style={styles.adviceTitle}>
        Good Sleep
      </h4>

      <p style={styles.adviceText}>
        Sleep 7-8 hours regularly
      </p>
    </div>
  </div>

</div>

      <h3
        style={{
          marginTop: "50px",
          textAlign: "left",
          color: "black",
          paddingTop: "10px",
        }}
      >
        Today's Medicine
      </h3>

      <div style={styles.cardContainer}>
        {list.map((item) => (
          <MedicineCard
            key={item.id}
            medicine={item}
            onSaveHistory={saveToHistory}
            onUpdateReminder={updateReminderStatus}
          />
        ))}
      </div>

      

      

        <button onClick={() => navigate("/add-medicine")} style={styles.addBtn}>
          + Add Medicine
        </button>
        
        
      </div>
    
  );
};

const MedicineCard = ({ medicine, onSaveHistory, onUpdateReminder }) => {
  const [isTaken, setIsTaken] = useState(Boolean(medicine.taken));
  const [isMissed, setIsMissed] = useState(Boolean(medicine.missed));

  useEffect(() => {
    setIsTaken(Boolean(medicine.taken));
    setIsMissed(Boolean(medicine.missed));
  }, [medicine.taken, medicine.missed]);

  // ✅ ONLY ONE FUNCTION (correct)
  const getDateInfo = () => {
    const date = new Date(medicine.createdAt || Date.now());

    const day = date.toLocaleDateString("en-US", {
      weekday: "long",
    });

    const time = date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    return { day, time };
  };

  const { day, time } = getDateInfo();

  const handleTaken = () => {
    sendCaregiverTakenMail();
    setIsTaken(true);
    setIsMissed(false);
    onUpdateReminder(medicine.id, { taken: true, missed: false });
    onSaveHistory(medicine, "Taken");
  };
  const sendCaregiverTakenMail = async () => {

  const caregiver =
    localStorage.getItem("caregiverEmail");

  if (!caregiver) return;

  try {

    await fetch(
      "http://localhost:5000/api/send-caregiver-status",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          caregiverEmail: caregiver,

          medicineName: medicine.name,

          dose: medicine.dose,

          time: medicine.displayTime,

          status: "Taken",
        }),
      }
    );

  } catch (err) {

    console.log(err);
  }
};

  return (
    <div style={styles.card}>
      <div style={styles.circle}>
        <img src={pill} alt="pill" style={styles.image} />
      </div>

      <div style={styles.name}>{medicine.name}</div>
      <div style={styles.dose}>{medicine.dose}</div>

      {/* ✅ DAY ONLY */}
      <div style={styles.dayInfo}>📅 {day}</div>

      {/* (optional time) */}
      <div style={styles.dayInfo}>⏰ {time}</div>

      {isTaken ? (
        <button style={styles.buttonTaken}>
          <FaCheck /> Taken
        </button>
      ) : isMissed ? (
        <button style={styles.buttonMissed}>
          <FaClock /> Missed
        </button>
      ) : (
        <button style={styles.buttonTime} onClick={handleTaken}>
          <FaClock /> {medicine.displayTime}
        </button>
      )}
      
    </div>
  );
};

const styles = {
  container: {
    padding: "20px",
    textAlign: "center",
     background: `
    radial-gradient(circle at top left, #fdba74 0%, transparent 30%),
    radial-gradient(circle at top right, #fb923c 0%, transparent 25%),
    linear-gradient(to bottom, #fff7ed 0%, #ffffff 55%)
  `,
    
    paddingBottom: "80px",
    minHeight: "90vh",
  },

  suggestionCard: {
  background: "#fff",
  borderRadius: "24px",
  padding: "22px",
  marginTop: "20px",
  boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
},

suggestionTitle: {
  color: "#ea580c",
  marginBottom: "15px",
  fontSize: "20px",
  fontWeight: "700",
},

suggestionItem: {
  background: "#fff7ed",
  padding: "14px",
  borderRadius: "14px",
  marginBottom: "12px",
  color: "#444",
  fontWeight: "500",
  border: "1px solid #fed7aa",
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

  dayInfo: {
  fontSize: "13px",
  color: "#444",
  marginTop: "5px",
  fontWeight: "500",
},
  circ: {
    width: "100px",
    height: "100px",
    borderRadius: "50%",
    overflow: "hidden",
    margin: "0 auto 15px auto",
    border: "3px solid #4CAF50",
    marginLeft: "0px",
  },
  profileimage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
addBtn: {
  position: "fixed",

  left: "50%",
  transform: "translateX(-50%)",

  bottom: "20px",

  background:
    "linear-gradient(135deg,#22c55e,#16a34a)",

  color: "#fff",

  border: "4px solid #ffffff",

  padding: "14px 28px",

  borderRadius: "18px",

  cursor: "pointer",

  fontWeight: "700",

  boxShadow:
    "0 10px 24px rgba(34,197,94,0.35)",

  fontSize: "16px",

  zIndex: 9999,

  minWidth: "220px",

  textAlign: "center",

  transition: "all 0.3s ease",
},
  cardContainer: {
    display: "flex",
    gap: "15px",
    overflowX: "auto",
    padding: "10px 0",
  },
  card: {
    minWidth: "150px",
    backgroundColor: "#f9cb97",
    borderRadius: "15px",
    padding: "15px",
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
  },
  circle: {
    width: "100px",
    height: "100px",
    borderRadius: "50%",
    overflow: "hidden",
    margin: "0 auto 15px auto",
    border: "3px solid #4CAF50",
  },
  image: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  name: {
    fontSize: "16px",
    fontWeight: "600",
  },
  dose: {
    fontSize: "13px",
    color: "#555",
    margin: "6px 0 10px",
  },
  buttonTaken: {
    backgroundColor: "#4CAF50",
    color: "#fff",
    padding: "6px 12px",
    borderRadius: "10px",
    border: "none",
    display: "flex",
    alignItems: "center",
    gap: "5px",
  },
  buttonMissed: {
    backgroundColor: "#ef4444",
    color: "#fff",
    padding: "6px 12px",
    borderRadius: "10px",
    border: "none",
    display: "flex",
    alignItems: "center",
    gap: "5px",
  },
  buttonTime: {
    backgroundColor: "#5A4FCF",
    color: "#fff",
    padding: "6px 12px",
    borderRadius: "10px",
    border: "none",
    display: "flex",
    alignItems: "center",
    gap: "5px",
    cursor: "pointer",
  },
  bottomNav: {
  position: "fixed",
  bottom: "18px",
  left: "50%",
  transform: "translateX(-50%)",

  width: "92%",
  maxWidth: "500px",

  height: "72px",
  background: "#ffffff",

  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",

  padding: "0 18px",

  borderRadius: "24px",

  boxShadow: "0 8px 24px rgba(0,0,0,0.12)",

  zIndex: 999,
},
  navItem: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    cursor: "pointer",
    fontSize: "14px",
  },
  active: {
    color: "#2563eb",
    fontWeight: "bold",
  },

 healthAdviceContainer: {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit, minmax(170px, 1fr))",
  gap: "12px",
  marginTop: "20px",
  marginBottom: "20px",
},

adviceCard: {
  background:
    "linear-gradient(135deg,#ffffff,#fff7ed)",
  borderRadius: "18px",
  padding: "12px",
  display: "flex",
  alignItems: "center",
  gap: "10px",
  boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
  border: "1px solid #fed7aa",
},

adviceIcon: {
  width: "42px",
  height: "42px",
  borderRadius: "12px",
  background:
    "linear-gradient(135deg,#fb923c,#f97316)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "20px",
  color: "#fff",
  flexShrink: 0,
},

adviceTitle: {
  margin: 0,
  fontSize: "14px",
  fontWeight: "700",
  color: "#111827",
},

adviceText: {
  margin: "4px 0 0 0",
  fontSize: "11px",
  color: "#6b7280",
  lineHeight: "15px",
},
};

export default Home;
