import { getToken } from "firebase/messaging";
import { messaging } from "./firebase";

export const requestNotificationPermission = async () => {
  const permission = await Notification.requestPermission();

  if (permission === "granted") {
    const token = await getToken(messaging, {
      vapidKey: "BLrLYjfsBZLh6HMLgphOyPqWrcRpS1GdFynnU3j2at8YVx_MyOyNNJRm2tJS2qgQBdal4HqXlNZCtn1dl9z8vQY"
    });

    console.log("FCM Token:", token);

    // 👉 Send this token to backend
    await fetch("http://localhost:5000/save-token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ token })
    });
  }
};