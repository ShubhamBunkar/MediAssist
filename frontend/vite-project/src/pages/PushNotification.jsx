import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaArrowLeft,
  FaCheckCircle,
  FaEnvelope,
} from "react-icons/fa";

const PushNotification = () => {
  const navigate = useNavigate();

  const user = JSON.parse(
    localStorage.getItem("user"),
  );

  const [caregiverEmail, setCaregiverEmail] =
    useState(
      localStorage.getItem(
        "caregiverEmail",
      ) || "",
    );

  const [otp, setOtp] = useState("");

  const [verified, setVerified] =
    useState(
      localStorage.getItem(
        "caregiverVerified",
      ) === "true",
    );

  const [notifications, setNotifications] =
    useState([]);

  // ================= SEND OTP =================
  const sendOTP = async () => {
    if (!caregiverEmail) {
      alert("Enter caregiver email");
      return;
    }

    try {
      const res = await fetch(
        "http://localhost:5000/api/send-caregiver-otp",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            email: caregiverEmail,
          }),
        },
      );

      const data = await res.json();

      alert(data.message);
    } catch (err) {
      console.log(err);
      alert("Failed to send OTP");
    }
  };

  // ================= VERIFY OTP =================
  const verifyOTP = async () => {
    try {
      const res = await fetch(
        "http://localhost:5000/api/verify-caregiver-otp",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            email: caregiverEmail,
            otp,
          }),
        },
      );

      const data = await res.json();

      if (data.success) {
        localStorage.setItem(
          "caregiverEmail",
          caregiverEmail,
        );

        localStorage.setItem(
          "caregiverVerified",
          "true",
        );

        setVerified(true);
      }

      alert(data.message);
    } catch (err) {
      console.log(err);
      alert("Verification failed");
    }
  };

  // ================= SEND STATUS MAIL =================
  const sendMedicineStatusToCaregiver =
    async (medicine, status) => {
      const caregiver =
        localStorage.getItem(
          "caregiverEmail",
        );

      const verified =
        localStorage.getItem(
          "caregiverVerified",
        ) === "true";

      if (!caregiver || !verified)
        return;

      try {
        await fetch(
          "http://localhost:5000/api/send-caregiver-status",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              caregiverEmail:
                caregiver,

              medicineName:
                medicine.name,

              dose: medicine.dose,

              time:
                medicine.displayTime,

              status,

              patient:
                user?.name ||
                "Patient",
            }),
          },
        );
      } catch (err) {
        console.log(
          "Caregiver email failed",
          err,
        );
      }
    };

  // ================= CHECK MISSED =================
  useEffect(() => {
    const interval = setInterval(
      async () => {
        const reminders =
          JSON.parse(
            localStorage.getItem(
              "reminders",
            ),
          ) || [];

        const now = new Date();

        const missed =
          reminders.filter((item) => {
            const time = new Date(
              item.createdAt,
            );

            const diff = now - time;

            return (
              !item.taken &&
              !item.missedMailSent &&
              diff > 60000
            );
          });

        setNotifications(missed);

        for (const medicine of missed) {
          await sendMedicineStatusToCaregiver(
            medicine,
            "Missed",
          );

          medicine.missedMailSent = true;
        }

        localStorage.setItem(
          "reminders",
          JSON.stringify(reminders),
        );
      },
      5000,
    );

    return () =>
      clearInterval(interval);
  }, []);

  // ================= CHECK TAKEN =================
  useEffect(() => {
    const interval = setInterval(
      async () => {
        const reminders =
          JSON.parse(
            localStorage.getItem(
              "reminders",
            ),
          ) || [];

        for (const medicine of reminders) {
          if (
            medicine.taken &&
            !medicine.takenMailSent
          ) {
            await sendMedicineStatusToCaregiver(
              medicine,
              "Taken",
            );

            medicine.takenMailSent = true;
          }
        }

        localStorage.setItem(
          "reminders",
          JSON.stringify(reminders),
        );
      },
      4000,
    );

    return () =>
      clearInterval(interval);
  }, []);

  return (
    <div style={styles.container}>
      {/* BG */}
      <div style={styles.bg1}></div>
      <div style={styles.bg2}></div>

      {/* TOP BAR */}
      <div style={styles.topBar}>
        <button
          style={styles.backButton}
          onClick={() =>
            navigate("/Menu")
          }
        >
          <FaArrowLeft />
        </button>
      </div>

      {/* TITLE */}
      <h2 style={styles.title}>
        Caregiver Alerts
      </h2>

      {/* EMAIL CARD */}
      <div style={styles.emailCard}>
        <div style={styles.mailCircle}>
          <FaEnvelope
            size={28}
            color="#fff"
          />
        </div>

        <h3>Caregiver Email</h3>

        <input
          type="email"
          placeholder="Enter caregiver email"
          value={caregiverEmail}
          onChange={(e) =>
            setCaregiverEmail(
              e.target.value,
            )
          }
          style={styles.input}
        />

        {!verified ? (
          <>
            <button
              style={styles.orangeBtn}
              onClick={sendOTP}
            >
              Send OTP
            </button>

            <input
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) =>
                setOtp(
                  e.target.value,
                )
              }
              style={styles.input}
            />

            <button
              style={styles.greenBtn}
              onClick={verifyOTP}
            >
              Verify OTP
            </button>
          </>
        ) : (
          <div style={styles.verifiedBox}>
            <FaCheckCircle color="#22c55e" />

            <span>
              Caregiver Verified
            </span>
          </div>
        )}
      </div>

      {/* MISSED */}
      <h2 style={styles.heading}>
        Missed Medicines
      </h2>

      {notifications.length === 0 ? (
        <div style={styles.emptyCard}>
          🎉 No missed medicines
        </div>
      ) : (
        notifications.map((item) => (
          <div
            key={item.id}
            style={styles.card}
          >
            <h3>
              💊 {item.name}
            </h3>

            <p>
              ⏰ Time:{" "}
              {item.displayTime}
            </p>

            <p
              style={{
                color: "red",
                fontWeight: "600",
              }}
            >
              ❌ Status: Missed
            </p>
          </div>
        ))
      )}
    </div>
  );
};

const styles = {
  container: {
    minHeight: "100vh",
    padding: "20px",
     background: `
    radial-gradient(circle at top left, #fdba74 0%, transparent 30%),
    radial-gradient(circle at top right, #fb923c 0%, transparent 25%),
    linear-gradient(to bottom, #fff7ed 0%, #ffffff 55%)
  `,
    position: "relative",
    overflow: "hidden",
  },

  bg1: {
    position: "absolute",
    top: "-80px",
    left: "-60px",
    width: "220px",
    height: "220px",
    borderRadius: "50%",
    background:
      "rgba(251,146,60,0.25)",
    filter: "blur(10px)",
  },

  bg2: {
    position: "absolute",
    top: "150px",
    right: "-60px",
    width: "180px",
    height: "180px",
    borderRadius: "50%",
    background:
      "rgba(249,115,22,0.18)",
    filter: "blur(12px)",
  },

  topBar: {
    display: "flex",
    marginBottom: "15px",
    position: "relative",
    zIndex: 5,
  },

  backButton: {
    width: "45px",
    height: "45px",
    borderRadius: "50%",
    border: "none",
    background: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "20px",
    color: "#ea580c",
    cursor: "pointer",
    boxShadow:
      "0 4px 10px rgba(0,0,0,0.1)",
  },

  title: {
    color: "#ea580c",
    marginBottom: "20px",
    position: "relative",
    zIndex: 2,
  },

  emailCard: {
    background: "#fff",
    borderRadius: "24px",
    padding: "25px",
    boxShadow:
      "0 6px 18px rgba(0,0,0,0.08)",
    marginBottom: "25px",
    position: "relative",
    zIndex: 2,
  },

  mailCircle: {
    width: "70px",
    height: "70px",
    borderRadius: "50%",
    background:
      "linear-gradient(135deg,#fb923c,#f97316)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: "15px",
  },

  input: {
    width: "100%",
    padding: "12px",
    borderRadius: "12px",
    border: "1px solid #ddd",
    marginTop: "12px",
    fontSize: "15px",
  },

  orangeBtn: {
    width: "100%",
    padding: "12px",
    background:
      "linear-gradient(135deg,#fb923c,#f97316)",
    color: "#fff",
    border: "none",
    borderRadius: "12px",
    marginTop: "15px",
    cursor: "pointer",
    fontWeight: "600",
  },

  greenBtn: {
    width: "100%",
    padding: "12px",
    background:
      "linear-gradient(135deg,#22c55e,#16a34a)",
    color: "#fff",
    border: "none",
    borderRadius: "12px",
    marginTop: "15px",
    cursor: "pointer",
    fontWeight: "600",
  },

  verifiedBox: {
    marginTop: "18px",
    background: "#dcfce7",
    padding: "12px",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    color: "#166534",
    fontWeight: "600",
  },

  heading: {
    color: "#ea580c",
    marginBottom: "15px",
  },

  emptyCard: {
    background: "#fff",
    padding: "20px",
    borderRadius: "18px",
    textAlign: "center",
    boxShadow:
      "0 4px 12px rgba(0,0,0,0.06)",
  },

  card: {
    background: "#fff",
    padding: "18px",
    marginBottom: "15px",
    borderRadius: "18px",
    boxShadow:
      "0 4px 12px rgba(0,0,0,0.08)",
  },
};

export default PushNotification;