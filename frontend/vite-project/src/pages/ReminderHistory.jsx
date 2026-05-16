import React, { useMemo, useState } from "react";
import { FaArrowLeft } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const ReminderHistory = () => {
  const [isOn, setIsOn] = useState(false);
  const [selected, setSelected] = useState([]);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const historyKey = `history_${user?.email || ""}`;

  const historyData = useMemo(() => {
    return JSON.parse(localStorage.getItem(historyKey)) || [];
  }, [historyKey]);

  const toggleSelected = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((itemId) => itemId !== id) : [...prev, id]
    );
  };

  const handleReuseSelected = () => {
    const selectedItems = historyData.filter((item) => selected.includes(item.id));
    const reminders = JSON.parse(localStorage.getItem("reminders")) || [];

    const reusedReminders = selectedItems.map((item) => ({
      id: Date.now() + Math.floor(Math.random() * 1000),
      name: item.name,
      dose: item.dosage,
      time: item.time,
      displayTime: item.time,
      createdAt: Date.now(),
      userEmail: user?.email || "",
      taken: false,
      missed: false,
    }));

    localStorage.setItem(
      "reminders",
      JSON.stringify([...reminders, ...reusedReminders])
    );

    alert("Reminders added to Home!");
    navigate("/home");
  };

  return (
    <div style={styles.container}>
      <div style={styles.topBar}>
        <FaArrowLeft style={styles.icon} onClick={() => navigate("/menu")} />
      </div>
      <h2 style={styles.heading}>Reminder History</h2>

      <div style={styles.button}>
        <span>Use Reminder</span>

        <div
          style={{
            ...styles.switch,
            backgroundColor: isOn ? "#3b82f6" : "#ccc",
          }}
          onClick={() => setIsOn(!isOn)}
        >
          <div
            style={{
              ...styles.knob,
              transform: isOn ? "translateX(24px)" : "translateX(0px)",
            }}
          />
        </div>
      </div>

      {historyData.length === 0 ? (
        <p style={styles.emptyText}>No reminder history saved yet.</p>
      ) : (
        historyData.map((item) => (
          <div key={item.id} style={styles.card}>
            {isOn && (
              <input
                type="checkbox"
                checked={selected.includes(item.id)}
                onChange={() => toggleSelected(item.id)}
              />
            )}

            <div>
              <h3 style={styles.name}>{item.name}</h3>
              <p style={styles.text}>{item.dosage}</p>
              <p style={styles.text}>
                {item.date} | {item.time}
              </p>
            </div>

            <span
              style={{
                ...styles.status,
                backgroundColor: item.status === "Taken" ? "#4CAF50" : "#F44336",
              }}
            >
              {item.status}
            </span>
          </div>
        ))
      )}

      {isOn && selected.length > 0 && (
        <button style={styles.reuseBtn} onClick={handleReuseSelected}>
          Reuse Selected
        </button>
      )}
    </div>
  );
};

const styles = {
  container: {
    padding: "20px",
     background: `
    radial-gradient(circle at top left, #fdba74 0%, transparent 30%),
    radial-gradient(circle at top right, #fb923c 0%, transparent 25%),
    linear-gradient(to bottom, #fff7ed 0%, #ffffff 55%)
  `,
    minHeight: "100vh",
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
  heading: {
    textAlign: "center",
    marginBottom: "20px",
  },
  button: {
    width: "250px",
    height: "50px",
    borderRadius: "20px",
    margin: "0 auto 20px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "0 15px",
    backgroundColor: "white",
    border: "1px solid #ddd",
  },
  switch: {
    width: "50px",
    height: "26px",
    borderRadius: "50px",
    display: "flex",
    alignItems: "center",
    padding: "2px",
    cursor: "pointer",
    transition: "0.3s",
  },
  knob: {
    width: "22px",
    height: "22px",
    borderRadius: "50%",
    backgroundColor: "white",
    transition: "0.3s",
  },
  card: {
    backgroundColor: "#fff",
    padding: "15px",
    borderRadius: "12px",
    marginBottom: "10px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
  },
  name: {
    margin: 0,
  },
  text: {
    margin: "4px 0",
    color: "#555",
  },
  status: {
    padding: "6px 12px",
    borderRadius: "20px",
    color: "#fff",
    fontSize: "12px",
  },
  reuseBtn: {
    marginTop: "20px",
    padding: "12px",
    width: "100%",
    backgroundColor: "#2563eb",
    color: "#fff",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
  },
  emptyText: {
    textAlign: "center",
    color: "#666",
    marginTop: "40px",
  },
};

export default ReminderHistory;
