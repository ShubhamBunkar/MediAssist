import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

const GlobalAlarm = () => {
  const navigate = useNavigate();

  const triggered = useRef(new Set());

  useEffect(() => {
    const interval = setInterval(() => {
      const user = JSON.parse(
        localStorage.getItem("user") || "null"
      );

      if (!user) return;

      const currentTime = new Date()
        .toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        })
        .toUpperCase();

      const reminders =
        JSON.parse(
          localStorage.getItem("reminders")
        ) || [];

      reminders.forEach((item) => {
        if (
          item.userEmail === user.email &&
          item.displayTime === currentTime &&
          !item.taken &&
          !item.missed &&
          !item.handled &&
          !triggered.current.has(item.id)
        ) {
          triggered.current.add(item.id);

          navigate("/AlarmScreen", {
            state: item,
          });
        }
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [navigate]);

  return null;
};

export default GlobalAlarm;