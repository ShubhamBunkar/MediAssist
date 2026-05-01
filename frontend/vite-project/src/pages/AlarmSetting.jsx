import React, { useState, useEffect } from "react";
import { FaArrowLeft } from "react-icons/fa";
import { useNavigate } from "react-router-dom";


import s1 from "../assets/sounds/s1.mp3";
import s2 from "../assets/sounds/s2.mp3";
import s3 from "../assets/sounds/s3.mp3";
import s4 from "../assets/sounds/s4.mp3";
import s5 from "../assets/sounds/s5.mp3";

const AlarmSetting = () => {
  const [currentAudio, setCurrentAudio] = useState(null);
  const [selectedTone, setSelectedTone] = useState(null);
  const [tempTone, setTempTone] = useState(null);

  const navigate = useNavigate();

  // 🎧 Tone list
  const tones = [
    { id: 1, name: "Calm Bell", file: s1 },
    { id: 2, name: "sun", file: s2 },
    { id: 3, name: "moon", file: s3 },
    { id: 4, name: "tree", file: s4 },
    { id: 5, name: "farmerl", file: s5 },
  ];

  // 🔄 Load saved tone on start
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("selectedTone"));
    if (saved) setSelectedTone(saved);
  }, []);

  // ▶️ Play tone preview
  const playTone = (file) => {
    // Stop previous audio
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
    }

    const audio = new Audio(file);
    audio.play();
    setCurrentAudio(audio);
  };
  const saveTone = () => {
    if (!tempTone) {
      alert("Please select a tone first!");
      return;
    }

    setSelectedTone(tempTone);
    localStorage.setItem("selectedTone", JSON.stringify(tempTone));
    alert("Tone saved successfully ✅");
  };

  // ⏹ Stop audio manually
  const stopTone = () => {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
    }
  };

  const selectTone = (tone) => {
    if (tempTone?.id === tone.id) {
      setTempTone(null); // 🔥 deselect
    } else {
      setTempTone(tone); // select
    }
  };

  return (
    <div style={styles.container}>

       <div style={styles.topBar}>
                  <FaArrowLeft style={styles.icon} onClick={() => navigate("/menu")} />
                </div>
      
      <h2 style={styles.heading}>🎵 Select Reminder Tone</h2>

      {tones.map((tone) => (
        <div
          key={tone.id}
          style={{
            ...styles.card,
            border:
              tempTone?.id === tone.id || selectedTone?.id === tone.id
                ? "2px solid #1DB954"
                : "2px solid transparent",
          }}
        >
         
         
          {/* Tone Name */}
          <div>
            <p style={styles.name}>{tone.name}</p>
          </div>

          {/* Buttons */}
          <div style={styles.buttons}>
            <button style={styles.playBtn} onClick={() => playTone(tone.file)}>
              ▶️
            </button>

            <button style={styles.stopBtn} onClick={stopTone}>
              ⏹
            </button>

            <input
              type="checkbox"
              checked={tempTone?.id === tone.id}
              onChange={() => selectTone(tone)}
            />
          </div>
        </div>
        
      ))}
       {/* ✅ SAVE BUTTON */}
          <div style={styles.saveContainer}>
            <button style={styles.saveBtn} onClick={saveTone}>
              💾 Save Tone
            </button>
          </div>
    </div>
  );
};

export default AlarmSetting;

// 🎨 Styles
const styles = {
  container: {
    padding: "20px",
    background: "#f9f9f9",
    minHeight: "100vh",
    color: "black",
    fontFamily: "Arial",
    
  },
  heading: {
    marginBottom: "20px",
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
  card: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    background: "#fefbfb",
    padding: "12px",
    marginBottom: "12px",
    borderRadius: "12px",
    border: "2px solid black"
  },
  name: {
    margin: 0,
    fontSize: "16px",
  },
  buttons: {
    display: "flex",
    gap: "8px",
  },
  playBtn: {
    background: "#1DB954",
    border: "none",
    padding: "6px 10px",
    borderRadius: "6px",
    cursor: "pointer",
  },
  stopBtn: {
    background: "#ff4d4d",
    border: "none",
    padding: "6px 10px",
    borderRadius: "6px",
    cursor: "pointer",
  },
  selectBtn: {
    background: "#333",
    color: "white",
    border: "none",
    padding: "6px 10px",
    borderRadius: "6px",
    cursor: "pointer",
  },
  saveContainer: {
  position: "fixed",
  bottom: "20px",
  left: "0",
  width: "100%",
  display: "flex",
  justifyContent: "center",
},

saveBtn: {
  padding: "12px 30px",
  background: "#1DB954",
  border: "none",
  borderRadius: "30px",
  fontSize: "16px",
  cursor: "pointer",
},


};
