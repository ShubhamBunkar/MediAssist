import { BrowserRouter, Routes, Route } from "react-router-dom";
import "react-phone-input-2/lib/style.css";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import Menu from "./pages/Menu";
import AddMedicine from "./pages/AddMedicine";
import Profile from "./pages/Profile";
import ReminderHistory from "./pages/ReminderHistory";
import AlarmSetting from "./pages/AlarmSetting";
import ProtectedRoute from "./ProtectedRoute";
import AlarmScreen from "./pages/AlarmScreen";
import VerifyEmail from "./pages/VerifyEmail";
import PushNotification from "./pages/PushNotification";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Public */}
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verifyEmail" element={<VerifyEmail />} />

        {/* Protected */}
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />

        <Route
          path="/menu"
          element={
            <ProtectedRoute>
              <Menu />
            </ProtectedRoute>
          }
        />

        <Route
          path="/add-medicine"
          element={
            <ProtectedRoute>
              <AddMedicine />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/ReminderHistory"
          element={
            <ProtectedRoute>
              <ReminderHistory />
            </ProtectedRoute>
          }
        />

        <Route
          path="/AlarmSetting"
          element={
            <ProtectedRoute>
              <AlarmSetting />
            </ProtectedRoute>
          }
        />

        <Route
          path="/AlarmScreen"
          element={
            <ProtectedRoute>
              <AlarmScreen />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/PushNotification"
          element={
            <ProtectedRoute>
              <PushNotification />
            </ProtectedRoute>
          }
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
