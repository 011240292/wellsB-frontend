import { useEffect, useRef, useState } from "react";

  function App() {

  


  // ==========================================
  // PROFILE
  // ==========================================

  const emptyProfile = {
    fullName: "",
    email: "",
    age: "",
    gender: "",
    height: "",
    weight: "",
    activityLevel: "",
    fitnessGoal: "",
    stepGoal: "8000",
    sleepGoal: "8",
    waterGoal: "2.5",
    exercise: "",
    emergency: "",
  };

  const [profile, setProfile] = useState(emptyProfile);

  // ==========================================
  // CURRENT PAGE
  // ==========================================

  const [currentPage, setCurrentPage] = useState("dashboard");
  const [profilePhoto, setProfilePhoto] = useState(
  localStorage.getItem("wellsbProfilePhoto") || ""
);

  // ==========================================
  // GREETING
  // ==========================================

  const [greeting, setGreeting] = useState("");

  // ==========================================
  // SAVE MESSAGE
  // ==========================================

  const [saved, setSaved] = useState(false);
  // ==========================================
// DAILY WATER TRACKING
// ==========================================

const [currentWater, setCurrentWater] = useState(() => {
  try {
    const savedWater = Number(
      localStorage.getItem("wellsbWaterIntake") || 0
    );

    return Number.isFinite(savedWater) && savedWater >= 0
      ? savedWater
      : 0;
  } catch {
    return 0;
  }
});

useEffect(() => {
  localStorage.setItem(
    "wellsbWaterIntake",
    String(currentWater)
  );
}, [currentWater]);
 // FOOD PHOTO
 
// FOOD PHOTO
const [foodPhoto, setFoodPhoto] = useState("");
const [foodFile, setFoodFile] = useState(null);
const [foodMessage, setFoodMessage] = useState("");
const [foodAnalysis, setFoodAnalysis] = useState(null);
const [foodLoading, setFoodLoading] = useState(false);

const cameraInputRef = useRef(null);
const galleryInputRef = useRef(null);


  // ==========================================
  // FITPRO SMARTWATCH DATA
  // ==========================================

  const [fitproStepRecords, setFitproStepRecords] = useState([]);
const [fitproHeartRecords, setFitproHeartRecords] = useState([]);
const [fitproSleepRecords, setFitproSleepRecords] = useState([]);
const [fitproLoading, setFitproLoading] = useState(true);
const [fitproError, setFitproError] = useState("");

  
useEffect(() => {
  let cancelled = false;

  async function loadFitProData() {
    try {
      const [stepsResponse, heartResponse, sleepResponse] =
        await Promise.all([
          fetch("https://wellsb-frontend.onrender.com/fitpro-data?type=steps", {
            cache: "no-store",
          }),
          fetch("https://wellsb-frontend.onrender.com/fitpro-data?type=heart", {
            cache: "no-store",
          }),
          fetch("https://wellsb-frontend.onrender.com/fitpro-data?type=sleep", {
            cache: "no-store",
          }),
        ]);

      if (
        !stepsResponse.ok ||
        !heartResponse.ok ||
        !sleepResponse.ok
      ) {
        throw new Error("Could not retrieve FitPro data.");
      }

      const [stepsData, heartData, sleepData] = await Promise.all([
        stepsResponse.json(),
        heartResponse.json(),
        sleepResponse.json(),
      ]);

      if (
        stepsData.status !== "success" ||
        heartData.status !== "success" ||
        sleepData.status !== "success"
      ) {
        throw new Error("FitPro data could not be loaded.");
      }

      if (!cancelled) {
        setFitproStepRecords(Array.isArray(stepsData.records) ? stepsData.records : []);
setFitproHeartRecords(Array.isArray(heartData.records) ? heartData.records : []);
setFitproSleepRecords(Array.isArray(sleepData.records) ? sleepData.records : []);
        setFitproError("");
      }
    } catch (error) {
      console.error("FitPro loading error:", error);

      if (!cancelled) {
        setFitproError(error.message || "FitPro data unavailable.");
      }
    } finally {
      if (!cancelled) {
        setFitproLoading(false);
      }
    }
  }

  loadFitProData();

  const refreshTimer = setInterval(loadFitProData, 60000);

  return () => {
    cancelled = true;
    clearInterval(refreshTimer);
  };
}, []);


   

  // ==========================================
  // MOBILE SIDEBAR
  // ==========================================

  const [mobileMenu, setMobileMenu] = useState(false);

  // ==========================================
  // SLEEP RECORD AND REMINDERS
  // ==========================================

  const [sleepRecord, setSleepRecord] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("wellsbSleepRecord")) || {
        bedtime: "",
        wakeTime: "",
      };
    } catch {
      return { bedtime: "", wakeTime: "" };
    }
  });

  const [wakeAlarm, setWakeAlarm] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("wellsbWakeAlarm")) || {
        time: "07:00",
        enabled: false,
      };
    } catch {
      return { time: "07:00", enabled: false };
    }
  });

  const [mealReminder, setMealReminder] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("wellsbMealReminder")) || {
        meal: "Breakfast",
        time: "08:00",
        enabled: false,
      };
    } catch {
      return { meal: "Breakfast", time: "08:00", enabled: false };
    }
  });

  const [sleepSavedMessage, setSleepSavedMessage] = useState("");
  const [reminderMessage, setReminderMessage] = useState("");

  const calculatedSleep = (() => {
    if (!sleepRecord.bedtime || !sleepRecord.wakeTime) return null;

    const [bedHour, bedMinute] = sleepRecord.bedtime.split(":").map(Number);
    const [wakeHour, wakeMinute] = sleepRecord.wakeTime.split(":").map(Number);

    if (
      !Number.isFinite(bedHour) ||
      !Number.isFinite(bedMinute) ||
      !Number.isFinite(wakeHour) ||
      !Number.isFinite(wakeMinute)
    ) {
      return null;
    }

    const bedtimeMinutes = bedHour * 60 + bedMinute;
    let wakeMinutes = wakeHour * 60 + wakeMinute;

    if (wakeMinutes < bedtimeMinutes) {
      wakeMinutes += 24 * 60;
    }

    const duration = (wakeMinutes - bedtimeMinutes) / 60;
    return duration > 0 ? Number(duration.toFixed(2)) : null;
  })();


function saveSleepRecord() {
  if (
    !sleepRecord.bedtime ||
    !sleepRecord.wakeTime ||
    calculatedSleep === null
  ) {
    setSleepSavedMessage(
      "Please enter a valid bedtime and wake-up time."
    );
    return;
  }

  const recordToSave = {
    ...sleepRecord,
    duration: calculatedSleep,
    savedAt: new Date().toISOString(),
  };

  localStorage.setItem(
    "wellsbSleepRecord",
    JSON.stringify(recordToSave)
  );

  setSleepSavedMessage(
    `Sleep record saved: ${calculatedSleep} hours.`
  );
}

  async function saveReminders() {
    const remindersEnabled = wakeAlarm.enabled || mealReminder.enabled;

    if (remindersEnabled) {
      if (!("Notification" in window)) {
        setReminderMessage("This browser does not support notifications.");
        return;
      }

      let permission = Notification.permission;

      if (permission === "default") {
        permission = await Notification.requestPermission();
      }

      if (permission !== "granted") {
        setReminderMessage("Please allow browser notifications to use reminders.");
        return;
      }
    }

    localStorage.setItem("wellsbWakeAlarm", JSON.stringify(wakeAlarm));
    localStorage.setItem("wellsbMealReminder", JSON.stringify(mealReminder));
    setReminderMessage("Your alarm and meal reminder settings have been saved.");
  }

  // Check saved reminders while WELLsB is open in this browser.
  useEffect(() => {
    function checkReminders() {
      if (!("Notification" in window) || Notification.permission !== "granted") {
        return;
      }

      const now = new Date();
      const currentTime = `${String(now.getHours()).padStart(2, "0")}:${String(
        now.getMinutes()
      ).padStart(2, "0")}`;
      const today = now.toDateString();

      try {
        const alarm = JSON.parse(
          localStorage.getItem("wellsbWakeAlarm") || "{}"
        );
        const meal = JSON.parse(
          localStorage.getItem("wellsbMealReminder") || "{}"
        );

        if (alarm.enabled && alarm.time === currentTime) {
          const key = `wellsbWakeAlarm-fired-${today}`;
          if (localStorage.getItem(key) !== "yes") {
            new Notification("⌚° WELLsB Wake-up Alarm", {
              body: "It is time to wake up. Have a great day!",
            });
            localStorage.setItem(key, "yes");
          }
        }

        if (meal.enabled && meal.time === currentTime) {
          const key = `wellsbMealReminder-fired-${today}`;
          if (localStorage.getItem(key) !== "yes") {
            new Notification(`ðŸ½ï¸ Time for ${meal.meal || "your meal"}`, {
              body: `Your ${String(meal.meal || "next meal").toLowerCase()} reminder is here.`,
            });
            localStorage.setItem(key, "yes");
          }
        }
      } catch (error) {
        console.error("Reminder check failed:", error);
      }
    }

    checkReminders();
    const reminderTimer = setInterval(checkReminders, 15000);
    return () => clearInterval(reminderTimer);
  }, []);

  // ==========================================
  // LOAD PROFILE
  // ==========================================

  useEffect(() => {
    const savedProfile = localStorage.getItem("wellsbProfile");

    if (savedProfile) {
      try {
        setProfile(JSON.parse(savedProfile));
      } catch (error) {
        console.error("Could not load profile:", error);
      }
    }

    updateGreeting();
  }, []);

  // ==========================================
  // TIME-BASED GREETING
  // ==========================================

  function updateGreeting() {
    const hour = new Date().getHours();

    if (hour >= 5 && hour < 12) {
      setGreeting("Good morning");
    } else if (hour >= 12 && hour < 17) {
      setGreeting("Good afternoon");
    } else if (hour >= 17 && hour < 21) {
      setGreeting("Good evening");
    } else {
      setGreeting("Good night");
    }
  }

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      updateGreeting();
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  // ==========================================
  // NAVIGATION
  // ==========================================

  function navigateTo(page) {
    setCurrentPage(page);
    setMobileMenu(false);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  // ==========================================
  // HANDLE PROFILE INPUT
  // ==========================================

  function handleChange(event) {
    const { name, value } = event.target;

    setProfile((previous) => ({
      ...previous,
      [name]: value,
    }));
  }
  
// ADD THE NEW FUNCTION HERE

// FOOD PHOTO UPLOAD


function handleFoodPhotoUpload(event) {
  const file = event.target.files?.[0];

  // Allow selecting the same photo again later.
  event.target.value = "";

  if (!file) return;

  if (!file.type.startsWith("image/")) {
    setFoodMessage("Please choose a food image.");
    return;
  }

  if (file.size > 5 * 1024 * 1024) {
    setFoodMessage("Please choose an image smaller than 5 MB.");
    return;
  }

  const reader = new FileReader();

  reader.onload = () => {
    setFoodPhoto(reader.result);
    setFoodFile(file);
    setFoodAnalysis(null);
    setFoodMessage("✅ Food photo selected. Press Analyze Food to continue.");
  };

  reader.onerror = () => {
    setFoodMessage("Could not load this photo. Please try another image.");
  };

  reader.readAsDataURL(file);
}

async function analyzeFoodPhoto() {
  if (!foodFile || foodLoading) return;

  setFoodLoading(true);
  setFoodAnalysis(null);
  setFoodMessage("🔍 Analysing your food photo...");

  try {
    const formData = new FormData();
    formData.append("image", foodFile);

    const response = await fetch(
      "https://wellsb-frontend.onrender.com/analyze-food",
      {
        method: "POST",
        body: formData,
      }
    );

    const result = await response.json();

    if (!response.ok || result.status !== "success") {
      throw new Error(result.error || "Food analysis failed.");
    }

    setFoodAnalysis(result.analysis);
    setFoodMessage("✅ Food photo analysed successfully!");
  } catch (error) {
    console.error("Food AI error:", error);
    setFoodMessage(
      error.message || "Could not analyse the photo. Please try again."
    );
  } finally {
    setFoodLoading(false);
  }
}

function removeFoodPhoto() {
  if (foodLoading) return;

  setFoodPhoto("");
  setFoodFile(null);
  setFoodAnalysis(null);
  setFoodMessage("");

  if (cameraInputRef.current) {
    cameraInputRef.current.value = "";
  }

  if (galleryInputRef.current) {
    galleryInputRef.current.value = "";
  }
}

// Your next existing function stays below

function handlePhotoUpload(event) {
  const file = event.target.files?.[0];

  if (!file) return;

  if (!file.type.startsWith("image/")) {
    alert("Please select an image file.");
    return;
  }

  if (file.size > 2 * 1024 * 1024) {
    alert("Please choose an image smaller than 2 MB.");
    return;
  }

  const reader = new FileReader();

  reader.onload = () => {
    const image = reader.result;
    setProfilePhoto(image);
    localStorage.setItem("wellsbProfilePhoto", image);
  };

  reader.onerror = () => {
    alert("Could not load the profile photo.");
  };

  reader.readAsDataURL(file);
}

  // ==========================================
  // SAVE PROFILE
  // ==========================================

  function saveProfile() {
    localStorage.setItem(
      "wellsbProfile",
      JSON.stringify(profile)
    );

    setSaved(true);

    setTimeout(() => {
      setSaved(false);
    }, 3000);
  }

  // ==========================================
  // BMI
  // ==========================================

  function calculateBMI() {
    const height = Number(profile.height);
    const weight = Number(profile.weight);

    if (!height || !weight) {
      return "--";
    }

    const heightMeters = height / 100;

    const bmi =
      weight / (heightMeters * heightMeters);

    return bmi.toFixed(1);
  }

  function getBMIStatus() {
    const bmi = Number(calculateBMI());

    if (!bmi) {
      return "Enter height and weight";
    }

    if (bmi < 18.5) {
      return "Below normal range";
    }

    if (bmi < 25) {
      return "Healthy range";
    }

    if (bmi < 30) {
      return "Above normal range";
    }

    return "High range";
  }

  // ==========================================
  // FIRST NAME
  // ==========================================

  const firstName =
    profile.fullName.trim().split(" ")[0] || "there";

  // ==========================================
  // SAMPLE SMARTWATCH DATA
  // ==========================================

  

  // ==========================================
  // FITPRO AND WELLNESS DATA
  // ==========================================

  const now = new Date();

  const todayKey =
    String(now.getFullYear()) +
    String(now.getMonth() + 1).padStart(2, "0") +
    String(now.getDate()).padStart(2, "0");

  // Add today's FitPro interval step records.
  const currentSteps = fitproStepRecords
    .filter((record) => String(record.date).slice(0, 8) === todayKey)
    .reduce((total, record) => total + (Number(record.step) || 0), 0);

  // Find the latest imported heart-rate reading.
  const latestHeartRecord = [...fitproHeartRecords].sort(
    (a, b) => String(b.date).localeCompare(String(a.date))
  )[0] || null;

  const heartDate = latestHeartRecord
    ? String(latestHeartRecord.date).slice(0, 8)
    : "";

  // Only show heart rate as recent if it was recorded today.
  const heartRateIsRecent = heartDate === todayKey;

  const heartRate = heartRateIsRecent
    ? Number(latestHeartRecord.heart)
    : "--";

  // ==========================================
  // FITPRO SLEEP STAGE CALCULATIONS
  // ==========================================

  const fitproSleepSessions = (() => {
    const sortedRecords = fitproSleepRecords
      .map((record) => {
        const rawDate = String(record.date || "");
        const durationMinutes = Number(record.minutes) || 0;

        if (!/^\d{14}$/.test(rawDate) || durationMinutes <= 0) {
          return null;
        }

        const timestamp = new Date(
          Number(rawDate.slice(0, 4)),
          Number(rawDate.slice(4, 6)) - 1,
          Number(rawDate.slice(6, 8)),
          Number(rawDate.slice(8, 10)),
          Number(rawDate.slice(10, 12)),
          Number(rawDate.slice(12, 14))
        ).getTime();

        if (!Number.isFinite(timestamp)) return null;

        return {
          timestamp,
          sleepType: String(record.sleepType),
          durationMinutes,
        };
      })
      .filter(Boolean)
      .sort((a, b) => a.timestamp - b.timestamp);

    const sessions = [];

    sortedRecords.forEach((record) => {
      const currentSession = sessions[sessions.length - 1];

      if (
        !currentSession ||
        (record.timestamp -
          currentSession[currentSession.length - 1].timestamp) >
          60 * 60 * 1000
      ) {
        sessions.push([record]);
      } else {
        currentSession.push(record);
      }
    });

    return sessions.map((session) => {
      let deepMinutes = 0;
      let lightMinutes = 0;
      let awakeMinutes = 0;

      session.forEach((record) => {
        if (record.sleepType === "1") {
          deepMinutes += record.durationMinutes;
        } else if (record.sleepType === "2") {
          lightMinutes += record.durationMinutes;
        } else if (record.sleepType === "3") {
          awakeMinutes += record.durationMinutes;
        }
      });

      const totalMinutes =
        deepMinutes + lightMinutes + awakeMinutes;

      return {
        startTime: session[0].timestamp,
        endTime: session[session.length - 1].timestamp,
        deepMinutes,
        lightMinutes,
        awakeMinutes,
        totalMinutes,
        totalHours: Number((totalMinutes / 60).toFixed(2)),
        deepPercent: totalMinutes
          ? Math.round((deepMinutes / totalMinutes) * 100)
          : 0,
        lightPercent: totalMinutes
          ? Math.round((lightMinutes / totalMinutes) * 100)
          : 0,
        awakePercent: totalMinutes
          ? Math.round((awakeMinutes / totalMinutes) * 100)
          : 0,
      };
    });
  })();

  const latestFitproSleepSession =
    fitproSleepSessions[fitproSleepSessions.length - 1] || null;

    const currentSleep = calculatedSleep ?? null;

  // These are not yet verified from FitPro records.
  const caloriesBurned = 0;
  const activeMinutes = 0;

  // ==========================================
  // GOALS
  // ==========================================

  const stepGoal = Number(profile.stepGoal) || 8000;
  const sleepGoal = Number(profile.sleepGoal) || 8;
  const waterGoal = Number(profile.waterGoal) || 2.5;

  const stepProgress = Math.min(
    (currentSteps / stepGoal) * 100,
    100
  );

  const sleepProgress =
    currentSleep !== null
      ? Math.min((currentSleep / sleepGoal) * 100, 100)
      : 0;

  const waterProgress = Math.min(
    (currentWater / waterGoal) * 100,
    100
  );

  // ==========================================
  // AI INSIGHT
  // ==========================================

  

function getAIInsight() {
 let message = profile.fullName
  ? `Hello ${firstName}! `
  : "Here are your latest wellness insights. ";

if (!profile.fullName) {
  message += "Complete your personal profile for more personalized recommendations. ";
}
  if (profile.fitnessGoal) {
    message += `Your current goal is ${profile.fitnessGoal.toLowerCase()}. `;
  }

  if (profile.activityLevel) {
    message += `Your activity level is ${profile.activityLevel.toLowerCase()}. `;
  }

  if (profile.stepGoal) {
    message += `Your daily step target is ${Number(
      profile.stepGoal
    ).toLocaleString()} steps. `;
  }

  if (profile.sleepGoal) {
    message += `Aim for around ${profile.sleepGoal} hours of sleep each night. `;
  }

  // Activity guidance
  if (typeof currentSteps !== "undefined" && Number(profile.stepGoal) > 0) {
    if (currentSteps >= Number(profile.stepGoal)) {
      message += "Great work! You have reached your daily step target. ";
    } else {
      const remainingSteps = Number(profile.stepGoal) - currentSteps;
      message += `You are ${remainingSteps.toLocaleString()} steps away from your daily target. A short walk may help. `;
    }
  }

  // Sleep guidance
  if (currentSleep !== null && Number(profile.sleepGoal) > 0) {
    if (currentSleep >= Number(profile.sleepGoal)) {
      message += "Your recorded sleep meets your personal goal. Keep maintaining a regular sleep routine. ";
    } else {
      message += "Your recorded sleep is below your personal goal. Consider a consistent bedtime routine. ";
    }
  } else if (currentSleep === null) {
    message += "Record your bedtime and wake-up time to receive sleep guidance. ";
  }

  // Hydration guidance
  if (typeof currentWater !== "undefined" && Number(profile.waterGoal) > 0) {
    if (currentWater >= Number(profile.waterGoal)) {
      message += "You have reached your daily water target. Keep drinking water regularly. ";
    } else {
      const remainingWater = Number(profile.waterGoal) - currentWater;
      message += `You are ${remainingWater.toFixed(1)} litres below your daily water target. Remember to drink water regularly. `;
    }
  }

  // NEW: Food scanner insights
  if (
    typeof foodAnalysis !== "undefined" &&
    foodAnalysis &&
    foodAnalysis.food_name
  ) {
    const food = foodAnalysis;
    const foodName = String(food.food_name).toLowerCase();

    message += `Your latest scanned meal was identified as ${food.food_name}. `;

    if (Number.isFinite(Number(food.calories))) {
      message += `Its estimated energy content is ${Number(food.calories)} calories. `;
    }

    if (Number.isFinite(Number(food.protein_g))) {
      message += `It contains an estimated ${Number(food.protein_g)} grams of protein. `;
    }

    if (Number.isFinite(Number(food.carbs_g))) {
      message += `It contains an estimated ${Number(food.carbs_g)} grams of carbohydrates. `;
    }

    if (Number.isFinite(Number(food.fat_g))) {
      message += `It contains an estimated ${Number(food.fat_g)} grams of fat. `;
    }

    if (
      foodName.includes("bean") ||
      foodName.includes("egg") ||
      foodName.includes("fish") ||
      foodName.includes("chicken") ||
      foodName.includes("meat") ||
      foodName.includes("milk")
    ) {
      message += "This meal may contribute protein to your diet. Consider balancing it with vegetables and other foods that suit your needs. ";
    } else {
      message += "For a balanced diet, consider combining this meal with suitable protein sources and vegetables where appropriate. ";
    }

    if (food.notes) {
      message += `Food estimate note: ${food.notes} `;
    }

    message += "Remember that photo-based nutrition values are estimates, not exact measurements. ";
  } else {
    message += "Scan a meal in the AI Food Scanner to receive additional food-specific nutrition guidance here. ";
  }

  
  message += "These recommendations use the wellness information currently available in your app.";

  return message;
}


  // ==========================================
  // SIDEBAR BUTTON
  // ==========================================

  function NavButton({ icon, label, page }) {
    return (
      <button
        className={`nav-btn ${
          currentPage === page ? "active" : ""
        }`}
        onClick={() => navigateTo(page)}
      >
        <span className="nav-icon">{icon}</span>
        <span>{label}</span>
      </button>
    );
  }

  // ==========================================
  // DASHBOARD
  // ==========================================

   function Dashboard() {
    return (
      <>
        <div className="topbar">
          <div>
            <h2>
              {greeting},{" "}
              {profile.fullName ? firstName : "there"} 👋
            </h2>
            <p>Your personal wellness dashboard</p>
          </div>

          <div className="dashboard-profile-photo">
            {profilePhoto ? (
              <img
                src={profilePhoto}
                alt="Profile"
                className="profile-photo"
              />
            ) : (
              profile.fullName
                ? firstName.charAt(0).toUpperCase()
                : "U"
            )}
          </div>

          <div className="status-group">
            <span className="status-badge active-status">
              🟢 System Active
            </span>
            <span className="status-badge watch-status">
  ⌚ FitPro Data Imported
</span>
          </div>
        </div>

  
          
        {/* STAT CARDS */}

        <div className="cards four-columns">

          <div className="card">
            <div className="card-icon green-icon">👟</div>

            <div className="card-title">
              Today's Steps
            </div>

            <div className="card-value green">
              {currentSteps.toLocaleString()}
            </div>

            <div className="card-small">
              Goal: {stepGoal.toLocaleString()} steps
            </div>

            <div className="progress-bar">
              <div
                className="progress green-progress"
                style={{
                  width: `${stepProgress}%`,
                }}
              />
            </div>
          </div>

          <div className="card">
            <div className="card-icon blue-icon">🌙</div>

            <div className="card-title">
              Sleep
            </div>

            <div className="card-value blue">
              {currentSleep !== null ? `${currentSleep} hrs` : "--"}
            </div>

            <div className="card-small">
              Goal: {sleepGoal} hrs
            </div>

            <div className="progress-bar">
              <div
                className="progress blue-progress"
                style={{
                  width: `${sleepProgress}%`,
                }}
              />
            </div>
          </div>

          <div className="card">
            <div className="card-icon orange-icon">💧</div>

            <div className="card-title">
              Water
            </div>

            <div className="card-value orange">
              {currentWater} L
            </div>

            <div className="card-small">
              Goal: {waterGoal} L
            </div>

            <div className="progress-bar">
              <div
                className="progress orange-progress"
                style={{
                  width: `${waterProgress}%`,
                }}
              />
            </div>
          </div>

          <div className="card">
            <div className="card-icon purple-icon">⚖️</div>

            <div className="card-title">
              BMI
            </div>

            <div className="card-value purple">
              {calculateBMI()}
            </div>

            <div className="card-small">
              {getBMIStatus()}
            </div>
          </div>
        </div>

        {/* WELLNESS SUMMARY */}

        <div className="section">
          <div className="section-heading">
            <div>
              <h3>Today's Wellness Summary</h3>
              <p>
                A quick look at your wellness progress.
              </p>
            </div>

            <button
              className="outline-btn"
              onClick={() => navigateTo("profile")}
            >
              Update Profile
            </button>
          </div>

          <div className="summary-grid">

            <div className="summary-card">
              <div className="summary-icon">❤️Â¤Ã¯Â¸Â</div>

              <div>
                <h4>Activity</h4>

                <p>
                  You have completed{" "}
                  <strong>
                    {Math.round(stepProgress)}%
                  </strong>{" "}
                  of your step goal today.
                </p>
              </div>
            </div>

            <div className="summary-card">
              <div className="summary-icon">🌙</div>

              <div>
                <h4>Sleep</h4>

                <p>
                  {currentSleep !== null
                    ? `You recorded ${currentSleep} hours of sleep. Your target is ${sleepGoal} hours.`
                    : `No reliable sleep duration is available yet. Your target is ${sleepGoal} hours. Record your bedtime and wake-up time.`}
                </p>
              </div>
            </div>

            <div className="summary-card">
              <div className="summary-icon">🥗</div>

              <div>
                <h4>Nutrition</h4>

                <p>
                  Remember to eat balanced meals and
                  stay hydrated throughout the day.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* QUICK ACTIONS */}

        <div className="section">
          <h3>Quick Access</h3>

          <div className="quick-grid">

            <button
              onClick={() => navigateTo("activity")}
              className="quick-btn"
            >
              ❤️Â¤Ã¯Â¸Â
              <span>Health & Activity</span>
            </button>

            <button
              onClick={() => navigateTo("nutrition")}
              className="quick-btn"
            >
              🥗
              <span>Nutrition</span>
            </button>

            <button
              onClick={() => navigateTo("sleep")}
              className="quick-btn"
            >
              🌙
              <span>Sleep</span>
            </button>

            <button
              onClick={() => navigateTo("ai")}
              className="quick-btn"
            >
              ✨
              <span>AI Insights</span>
            </button>
          </div>
        </div>
      </>
    );
  }

  // ==========================================
  // HEALTH & ACTIVITY
  // ==========================================

  function ActivityPage() {
    return (
      <>
        <PageHeader
          title="❤️Â¤Ã¯Â¸Â Health & Activity"
          subtitle="Monitor your daily physical activity."
        />

        <div className="cards three-columns">

          <StatCard
            title="Steps"
            value={currentSteps.toLocaleString()}
            description="Today's steps"
            color="green"
            icon="👟"
          />

          <StatCard
            title="Calories Burned"
            value={caloriesBurned}
            description="Estimated calories"
            color="orange"
            icon="🔥"
          />

          <StatCard
            title="Active Minutes"
            value={activeMinutes}
            description="Minutes today"
            color="blue"
            icon="🏃"
          />
        </div>

        <div className="section">

          <h3>Activity Progress</h3>

          <div className="activity-list">

            <ActivityRow
              icon="🚶"
              title="Walking"
              value="32 min"
            />

            <ActivityRow
              icon="💪"
              title="Exercise"
              value="14 min"
            />

            <ActivityRow
              icon="🔥"
              title="Calories"
              value={`${caloriesBurned} kcal`}
            />

            <ActivityRow
              icon="👟"
              title="Steps"
              value={`${currentSteps.toLocaleString()} steps`}
            />
          </div>
        </div>
      </>
    );
  }

  // ==========================================
  // NUTRITION
  // ==========================================

  function NutritionPage() {
    return (
      <>
        {/* FOOD PHOTO ANALYSIS */}

        <div className="section">
         <h3>📸 AI Food Scanner</h3>

          <p>
            Take a photo or upload a food image to prepare it
            for nutritional analysis.
          </p>

          
<div className="ai-box">
  <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
    <button
      type="button"
      className="take-photo-button"
      onClick={() => cameraInputRef.current?.click()}
    >
      📷 Take Photo
    </button>

    <button
      type="button"
      className="gallery-upload-button"
      onClick={() => galleryInputRef.current?.click()}
    >
      🖼️ Upload from Gallery
    </button>
  </div>

  <input
    ref={cameraInputRef}
    type="file"
    accept="image/*"
    capture="environment"
    onChange={handleFoodPhotoUpload}
    hidden
  />

  <input
    ref={galleryInputRef}
    type="file"
    accept="image/*"
    onChange={handleFoodPhotoUpload}
    hidden
  />

  {foodPhoto && (
    <div style={{ marginTop: "20px" }}>
      <img
        src={foodPhoto}
        alt="Selected food"
        style={{
          width: "100%",
          maxWidth: "350px",
          maxHeight: "300px",
          objectFit: "contain",
          borderRadius: "12px",
        }}
      />

      <p>✅ Food photo selected successfully.</p>

      <div
        style={{
          display: "flex",
          gap: "10px",
          flexWrap: "wrap",
          marginTop: "12px",
        }}
      >
        <button
          type="button"
          className="primary-button"
          onClick={analyzeFoodPhoto}
          disabled={!foodFile || foodLoading}
        >
          {foodLoading ? "⌚ Analysing..." : "🔍 Analyze Food"}
        </button>

        <button
          type="button"
          onClick={removeFoodPhoto}
          disabled={foodLoading}
          style={{
            background: "#dc2626",
            color: "#ffffff",
            border: "none",
            borderRadius: "8px",
            padding: "10px 16px",
            cursor: foodLoading ? "not-allowed" : "pointer",
          }}
        >
          🗑️ Remove Photo
        </button>
      </div>
    </div>
  )}
</div>

            {foodMessage && (
  <p role="status">{foodMessage}</p>
)}

           
{foodLoading && (
  <p>⌚³ Analysing your food photo...</p>
)}

{foodAnalysis && (
  <div className="ai-box" style={{ marginTop: "16px" }}>
    <h3>ðŸ½ï¸ AI Food Analysis</h3>

    <p>

      <strong>Food:</strong> {foodAnalysis.food_name}
    </p>

    <h2>🔥 {foodAnalysis.calories} kcal</h2>

    <p>
      🥩 Protein: {foodAnalysis.protein_g} g
    </p>

    <p>
     ðŸž  Carbohydrates: {foodAnalysis.carbs_g} g
    </p>

    <p>
     🥑  Fat: {foodAnalysis.fat_g} g
    </p>

    <p>
      📊 Portion: {foodAnalysis.portion_estimate}
    </p>

    <p>
     ℹ️ {foodAnalysis.notes}
    </p>

    <p>
      Confidence: {foodAnalysis.confidence}
    </p>
  </div>
)}


        </div>
        <PageHeader
          title="🥗 Nutrition"
          subtitle="Keep track of your daily nutrition."
        />

        <div className="cards three-columns">

          <StatCard
            title="Calories"
            value="1,420"
            description="Consumed today"
            color="orange"
            icon="🔥"
          />

          <StatCard
            title="Protein"
            value="62 g"
            description="Daily intake"
            color="green"
            icon="🥩"
          />

          <StatCard
            title="Water"
            value={`${currentWater} L`}
            description={`Goal: ${waterGoal} L`}
            color="blue"
            icon="💧"
          />
        </div>

        <div className="section">

          <h3>Nutrition Recommendation</h3>

          <div className="ai-box">

            <div className="ai-title">
              🥗 Healthy Eating
            </div>

            <p>
              Try to include vegetables, fruits, whole
              grains and protein-rich foods in your meals.
              Remember to drink enough water throughout
              the day.
            </p>
          </div>
        </div>
      </>
    );
  }

  // ==========================================
  // SLEEP
  // ==========================================

  
function SleepPage() {
  function formatSleepMinutes(minutes) {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    return `${hours}h ${remainingMinutes}m`;
  }

  const recentSleepSessions = [...fitproSleepSessions]
    .reverse()
    .slice(0, 5);

  return (
    <>
      <PageHeader
        title="🌙 Sleep"
        subtitle="Understand and improve your sleep habits."
      />

      <div className="cards three-columns">
        <StatCard
          title="Sleep Duration"
          value={currentSleep !== null ? `${currentSleep} hrs` : "--"}
          description={
            latestFitproSleepSession
              ? "Latest imported FitPro session"
              : calculatedSleep !== null
              ? "Manually recorded sleep"
              : "No sleep record available"
          }
          color="blue"
          icon="🌙"
        />

        <StatCard
          title="Deep Sleep"
          value={
            latestFitproSleepSession
              ? formatSleepMinutes(latestFitproSleepSession.deepMinutes)
              : "--"
          }
          description={
            latestFitproSleepSession
              ? `${latestFitproSleepSession.deepPercent}% of estimated sleep`
              : "No imported data"
          }
          color="green"
          icon="💤"
        />

        <StatCard
          title="Sleep Goal"
          value={`${sleepGoal} hrs`}
          description="Your personal target"
          color="purple"
          icon="🎯"
        />
      </div>

      {/* FITPRO SLEEP STAGES */}

      <div className="section">
        <h3>⌚ FitPro Sleep Stage Analysis</h3>

        {latestFitproSleepSession ? (
          <>
            <p>
              Latest imported sleep session:
              {" "}
              <strong>
                {new Date(
                  latestFitproSleepSession.startTime
                ).toLocaleDateString()}
              </strong>
            </p>

            <p>
              Estimated total sleep:
              {" "}
              <strong>
                {latestFitproSleepSession.totalHours} hours
              </strong>
            </p>

            <div className="activity-list">
              <ActivityRow
                icon="💤"
                title="Deep Sleep"
                value={`${formatSleepMinutes(
                  latestFitproSleepSession.deepMinutes
                )} (${latestFitproSleepSession.deepPercent}%)`}
              />

              <ActivityRow
                icon="🌙"
                title="Light Sleep"
                value={`${formatSleepMinutes(
                  latestFitproSleepSession.lightMinutes
                )} (${latestFitproSleepSession.lightPercent}%)`}
              />

              <ActivityRow
                icon="👀"
                title="Awake"
                value={`${formatSleepMinutes(
                  latestFitproSleepSession.awakeMinutes
                )} (${latestFitproSleepSession.awakePercent}%)`}
              />
            </div>

            <p className="small-note">
              These sleep-stage durations are estimates calculated
              from the timestamps of your imported FitPro records.
              They may differ from the FitPro app's own summary.
            </p>
          </>
        ) : (
          <p>
            No FitPro sleep sessions are available yet.
            Import your sleep records to see your sleep stages here.
          </p>
        )}
      </div>

      {/* SLEEP HISTORY */}

      <div className="section">
        <h3>📅 Imported Sleep History</h3>

        {recentSleepSessions.length > 0 ? (
          <div className="activity-list">
            {recentSleepSessions.map((session, index) => (
              <div className="activity-row" key={session.startTime}>
                <div className="activity-left">
                  <span className="activity-icon">🌙</span>

                  <span>
                    {new Date(session.startTime).toLocaleDateString()}
                  </span>
                </div>

                <strong>
                  {session.totalHours} hrs
                </strong>
              </div>
            ))}
          </div>
        ) : (
          <p>No imported sleep history is available.</p>
        )}

        <p className="small-note">
          Showing up to five of your most recent imported sessions.
        </p>
      </div>

      {/* MANUAL SLEEP RECORDING */}

      <div className="section">
        <h3>📊 Record Your Sleep</h3>
        <p>
          Enter the time you went to bed and the time you woke up.
          WELLsB will calculate your sleep duration automatically.
        </p>

        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="sleep-bedtime">Bedtime</label>
            <input
              id="sleep-bedtime"
              type="time"
              value={sleepRecord.bedtime}
              onChange={(event) =>
                setSleepRecord((previous) => ({
                  ...previous,
                  bedtime: event.target.value,
                }))
              }
            />
          </div>

          <div className="form-group">
            <label htmlFor="sleep-waketime">Wake-up time</label>
            <input
              id="sleep-waketime"
              type="time"
              value={sleepRecord.wakeTime}
              onChange={(event) =>
                setSleepRecord((previous) => ({
                  ...previous,
                  wakeTime: event.target.value,
                }))
              }
            />
          </div>
        </div>

        <p>
          <strong>Calculated sleep duration: </strong>
          {calculatedSleep === null
            ? "Enter both times to calculate"
            : `${calculatedSleep} hours`}
        </p>

        <button
          type="button"
          className="sleep-save-button"
          onClick={saveSleepRecord}
        >
          💾 Save Sleep Record
        </button>

        {sleepSavedMessage && (
          <p role="status">{sleepSavedMessage}</p>
        )}
      </div>

      {/* WAKE-UP ALARM */}

      <div className="section">
        <h3>⌚° Wake-up Alarm</h3>

        <div className="form-group">
          <label htmlFor="wake-alarm-time">Alarm time</label>
          <input
            id="wake-alarm-time"
            type="time"
            value={wakeAlarm.time}
            onChange={(event) =>
              setWakeAlarm((previous) => ({
                ...previous,
                time: event.target.value,
              }))
            }
          />
        </div>

        <label>
          <input
            type="checkbox"
            checked={wakeAlarm.enabled}
            onChange={(event) =>
              setWakeAlarm((previous) => ({
                ...previous,
                enabled: event.target.checked,
              }))
            }
          />{" "}
          Enable wake-up alarm
        </label>
      </div>

      {/* MEAL REMINDER */}

      <div className="section">
        <h3>🍽️ Next Meal Reminder</h3>

        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="meal-reminder-type">Meal</label>
            <select
              id="meal-reminder-type"
              value={mealReminder.meal}
              onChange={(event) =>
                setMealReminder((previous) => ({
                  ...previous,
                  meal: event.target.value,
                }))
              }
            >
              <option>Breakfast</option>
              <option>Lunch</option>
              <option>Supper</option>
              <option>Snack</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="meal-reminder-time">Reminder time</label>
            <input
              id="meal-reminder-time"
              type="time"
              value={mealReminder.time}
              onChange={(event) =>
                setMealReminder((previous) => ({
                  ...previous,
                  time: event.target.value,
                }))
              }
            />
          </div>
        </div>

        <label>
          <input
            type="checkbox"
            checked={mealReminder.enabled}
            onChange={(event) =>
              setMealReminder((previous) => ({
                ...previous,
                enabled: event.target.checked,
              }))
            }
          />{" "}
          Enable meal reminder
        </label>

        <p>
          <button
            type="button"
            className="reminder-save-button"
            onClick={saveReminders}
          >
            💾 Save Alarm &amp; Meal Reminder
          </button>
        </p>

        {reminderMessage && (
          <p role="status">{reminderMessage}</p>
        )}

        <p className="small-note">
          Reminders use browser notifications and work while WELLsB
          remains open in this browser. Allow notifications when prompted.
        </p>
      </div>

      {/* SLEEP RECOMMENDATION */}

      <div className="section">
        <h3>Sleep Recommendation</h3>

        <div className="ai-box">
          <div className="ai-title">🌙 Better Sleep</div>

          <p>
            Try maintaining a consistent bedtime and reducing screen
            exposure before sleeping. Monitor your deep, light and
            awake sleep patterns to understand your sleep habits.
          </p>
        </div>
      </div>
    </>
  );
}

  // ==========================================
  // SMARTWATCH
  // ==========================================

  
function WatchPage() {
  const latestImportedHeart = latestHeartRecord
    ? Number(latestHeartRecord.heart ?? latestHeartRecord.heartRate)
    : null;

  const heartDateLabel = latestHeartRecord
    ? `${String(latestHeartRecord.date).slice(6, 8)}/${String(
        latestHeartRecord.date
      ).slice(4, 6)}/${String(latestHeartRecord.date).slice(0, 4)}`
    : "No imported reading";

  return (
    <>
      <PageHeader
        title="⌚ WELLsB Smartwatch"
        subtitle="View health information imported from your FitPro device."
      />

      <div className="watch-connected">
        <span>📡</span>
        FitPro Data Integration
      </div>

      <div className="section">
        <h3>Device Data Status</h3>

        <div className="activity-list">
          <ActivityRow
            icon="📱"
            title="Data Source"
            value="FitPro"
          />

          <ActivityRow
            icon="👟"
            title="Step Records"
            value={fitproStepRecords.length}
          />

          <ActivityRow
            icon="❤️"
            title="Heart Rate Records"
            value={fitproHeartRecords.length}
          />
<ActivityRow
  icon="🌙"
  title="Sleep Records"
  value={fitproSleepRecords.length}
/>


          <ActivityRow
            icon="🔄"
            title="Data Synchronization"
            value={fitproLoading ? "Loading..." : fitproError ? "Unavailable" : "Retrieved"}
          />
        </div>

        {fitproError && (
          <p role="alert">{fitproError}</p>
        )}
      </div>

      <div className="section">
        <h3>Imported Smartwatch Measurements</h3>

        <div className="watch-grid">
          <div className="watch-card">
            <span>💓</span>
            <strong>
              {latestImportedHeart && latestImportedHeart > 0
                ? latestImportedHeart
                : "--"}
            </strong>
            <small>Latest imported BPM</small>
          </div>

          <div className="watch-card">
            <span>👟</span>
            <strong>{currentSteps.toLocaleString()}</strong>
            <small>Today's steps</small>
          </div>

          <div className="watch-card">
            <span>🔥</span>
            <strong>--</strong>
            <small>Calories not yet verified</small>
          </div>

          <div className="watch-card">
  <span>🌙</span>
  <strong>{fitproSleepRecords.length}</strong>
  <small>Imported sleep records</small>
</div>

          <div className="watch-card">
            <span>📅</span>
            <strong>{heartDateLabel}</strong>
            <small>Latest heart-rate record date</small>
          </div>
        </div>
      </div>

      <div className="section">
        <h3>Data Information</h3>
        <p>
          WELLsB retrieves exported FitPro records through its backend.
          Measurements are displayed according to the dates recorded
          by FitPro. They are not necessarily live readings.
        </p>
      </div>
    </>
  );
}


  // ==========================================
  // AI
  // ==========================================

  function AIPage() {
    return (
      <>
        <PageHeader
          title="✨ AI Insights"
          subtitle="Personalized wellness recommendations."
        />

        <div className="section">

          <div className="ai-large">

            <div className="ai-large-icon">
              ✨
            </div>

            <div>

              <h3>
                Your WELLsB AI Insight
              </h3>

              <p>
                {getAIInsight()}
              </p>

              

            </div>
          </div>

          
<div className="insight-grid">
  <div className="insight-card">
    <span>👟</span>
    <h4>Activity</h4>
    <p>
      {Number(profile.stepGoal) > 0
        ? Number(currentSteps) >= Number(profile.stepGoal)
          ? `Excellent! You have reached your daily goal of ${Number(profile.stepGoal).toLocaleString()} steps. Keep moving regularly.`
          : `You have completed ${Number(currentSteps).toLocaleString()} of ${Number(profile.stepGoal).toLocaleString()} steps. ${(Number(profile.stepGoal) - Number(currentSteps)).toLocaleString()} steps remain to reach your goal.`
        : "Set your daily step goal in your profile to receive personalized activity advice."}
    </p>
  </div>

  <div className="insight-card">
    <span>🌙</span>
    <h4>Sleep</h4>
    <p>
      {Number(profile.sleepGoal) > 0
        ? currentSleep !== null
          ? currentSleep >= Number(profile.sleepGoal)
            ? `Great! Your recorded sleep of ${currentSleep} hours meets your ${profile.sleepGoal}-hour goal. Maintain a regular sleep schedule.`
            : `Your recorded sleep is ${currentSleep} hours, compared with your ${profile.sleepGoal}-hour goal. Consider a consistent bedtime routine.`
          : "No reliable sleep duration is available yet. Record your bedtime and wake-up time for personalized sleep advice."
        : "Set your sleep goal in your profile to receive personalized sleep advice."}
    </p>
  </div>

  <div className="insight-card">
    <span>💧</span>
    <h4>Hydration</h4>
    <p>
      {Number(profile.waterGoal) > 0
        ? Number(currentWater) >= Number(profile.waterGoal)
          ? `Well done! Your recorded water intake of ${currentWater} litres meets your ${profile.waterGoal}-litre daily goal.`
          : `Your recorded water intake is ${currentWater} litres. You need another ${(Number(profile.waterGoal) - Number(currentWater)).toFixed(1)} litres to reach your ${profile.waterGoal}-litre goal.`
        : "Set your daily water goal in your profile to receive personalized hydration advice."}
    </p>
 
  </div>
</div>

        </div>
      </>
    );
  }

  // ==========================================
  // ENERGY
  // ==========================================

  

  function EnergyPage() {
    return (
      <>
        <PageHeader
          title="⚡ Energy Balance"
          subtitle="Understand your daily energy balance."
        />

        <div className="cards three-columns">

          <StatCard
            title="Calories Consumed"
            value="1,420"
            description="Today"
            color="orange"
            icon="🍽️"
          />

          <StatCard
            title="Calories Burned"
            value={caloriesBurned}
            description="Activity"
            color="green"
            icon="🔥"
          />

          <StatCard
            title="Balance"
            value="+992"
            description="Estimated balance"
            color="blue"
            icon="⚡"
          />
        </div>

        <div className="section">

          <h3>Energy Recommendation</h3>

          <div className="ai-box">

            <div className="ai-title">
              ⚡ Your Energy Balance
            </div>

            <p>
              Your current energy balance is estimated
              from your food intake and activity. Your
              personal information will help WELLsB make
              these estimates more relevant.
            </p>
          </div>
        </div>
      </>
    );
  }

  // ==========================================
  // PROFILE
  // ==========================================

  function ProfilePage() {
    return (
      <>
        <PageHeader
          title="👤 My Profile"
          subtitle="Manage your personal wellness information."
        />

                <div className="profile-hero">
          <div className="profile-avatar">
            {profilePhoto ? (
              <img
                src={profilePhoto}
                alt="Profile"
                className="profile-photo"
              />
            ) : (
              profile.fullName
                ? firstName.charAt(0).toUpperCase()
                : "U"
            )}
          </div>

          <label className="photo-upload-button">
            Change Profile Photo
            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              hidden
            />
          </label>

          <div>
            <h2>{profile.fullName || "Your Profile"}</h2>
            <p>Personal Wellness Profile</p>
          </div>
        </div>

        <div className="section profile-form-section">

          <div className="section-heading">
            <div>
              <h3>👤 Personal Information</h3>

              <p>
                Enter your information so WELLsB can
                personalize your wellness experience.
              </p>
            </div>
          </div>

          <div className="form-grid">

        
   

<div className="form-group">
  <label>Full Name</label>
  <input
    type="text"
    name="fullName"
    value={profile.fullName}
    onChange={handleChange}
    placeholder="Enter your full name"
  />
</div>


            <FormInput
              label="Email Address"
              name="email"
              type="email"
              value={profile.email}
              onChange={handleChange}
              placeholder="Enter your email"
            />

            <FormInput
              label="Age"
              name="age"
              type="number"
              value={profile.age}
              onChange={handleChange}
              placeholder="e.g. 22"
            />

            <FormSelect
              label="Gender"
              name="gender"
              value={profile.gender}
              onChange={handleChange}
              options={[
                "Female",
                "Male",
                "Other",
                "Prefer not to say",
              ]}
            />

            <FormInput
              label="Height (cm)"
              name="height"
              type="number"
              value={profile.height}
              onChange={handleChange}
              placeholder="e.g. 165"
            />

            <FormInput
              label="Weight (kg)"
              name="weight"
              type="number"
              value={profile.weight}
              onChange={handleChange}
              placeholder="e.g. 60"
            />

            <FormSelect
              label="Activity Level"
              name="activityLevel"
              value={profile.activityLevel}
              onChange={handleChange}
              options={[
                "Sedentary",
                "Lightly Active",
                "Moderately Active",
                "Very Active",
              ]}
            />

            <FormSelect
              label="Fitness Goal"
              name="fitnessGoal"
              value={profile.fitnessGoal}
              onChange={handleChange}
              options={[
                "Lose Weight",
                "Maintain Weight",
                "Gain Weight",
                "Build Fitness",
              ]}
            />

            <FormInput
              label="Daily Step Goal"
              name="stepGoal"
              type="number"
              value={profile.stepGoal}
              onChange={handleChange}
              placeholder="e.g. 8000"
            />

            <FormInput
              label="Daily Sleep Goal (hours)"
              name="sleepGoal"
              type="number"
              step="0.1"
              value={profile.sleepGoal}
              onChange={handleChange}
              placeholder="e.g. 8"
            />

            <FormInput
              label="Daily Water Goal (litres)"
              name="waterGoal"
              type="number"
              step="0.1"
              value={profile.waterGoal}
              onChange={handleChange}
              placeholder="e.g. 2.5"
            />

            <FormSelect
              label="Preferred Exercise"
              name="exercise"
              value={profile.exercise}
              onChange={handleChange}
              options={[
                "Walking",
                "Running",
                "Cycling",
                "Gym",
                "Swimming",
                "Yoga",
                "Dancing",
                "Other",
              ]}
            />

            <FormInput
              label="Emergency Contact (Optional)"
              name="emergency"
              value={profile.emergency}
              onChange={handleChange}
              placeholder="Name and phone number"
              full
            />

          </div>

          <button
            className="save-btn"
            onClick={saveProfile}
          >
            💾 Save My Profile
          </button>

          {saved && (
            <div className="success-message">
             ✓  Your profile has been saved successfully!
            </div>
          )}
        </div>

        {/* BODY INFORMATION */}

        <div className="section">

          <h3>📊 Your Body Information</h3>

          <div className="cards three-columns">

            <StatCard
              title="Height"
              value={profile.height || "--"}
              description="centimetres"
              color="green"
              icon="📊"
            />

            <StatCard
              title="Weight"
              value={profile.weight || "--"}
              description="kilograms"
              color="orange"
              icon="⚖️"
            />

            <StatCard
              title="BMI"
              value={calculateBMI()}
              description={getBMIStatus()}
              color="purple"
              icon="📊"
            />

      
              </div>
        </div>
      </>
    );
  }

  // ==========================================
  // SETTINGS

  // ==========================================
  // SETTINGS
  // ==========================================

  function SettingsPage() {
    return (
      <>
                <PageHeader
          title="👤 My Profile"
          subtitle="Manage your personal wellness information."
        />

        <div className="section">

          <h3>Application Settings</h3>

          <div className="settings-list">

            <div className="setting-row">
              <div>
                <strong>🔔 Notifications</strong>
                <p>Receive wellness reminders.</p>
              </div>

              <span className="setting-status">
                Enabled
              </span>
            </div>

            <div className="setting-row">
              <div>
                <strong>⌚ Watch Sync</strong>
                <p>Automatically synchronize watch data.</p>
              </div>

              <span className="setting-status">
                Automatic
              </span>
            </div>

            <div className="setting-row">
              <div>
                <strong>✨ AI Insights</strong>
                <p>Personalized wellness recommendations.</p>
              </div>

              <span className="setting-status">
                Enabled
              </span>
            </div>

            <div className="setting-row">
              <div>
                <strong>🔒 Data Storage</strong>
                <p>Your current demo data is stored locally.</p>
              </div>

              <span className="setting-status">
                Local
              </span>
            </div>

          </div>
        </div>

        <div className="section danger-section">

          <h3>Profile Data</h3>

          <p>
            Clear the personal information saved in this
            browser.
          </p>

          <button
            className="danger-btn"
            onClick={() => {
              localStorage.removeItem("wellsbProfile");
              setProfile(emptyProfile);
              navigateTo("dashboard");
            }}
          >
            Clear Saved Profile
          </button>
        </div>
      </>
    );
  }

  // ==========================================
  // PAGE HEADER
  // ==========================================

  function PageHeader({ title, subtitle }) {
    return (
      <div className="page-header">
        <h2>{title}</h2>
        <p>{subtitle}</p>
      </div>
    );
  }

  // ==========================================
  // STAT CARD
  // ==========================================

  function StatCard({
    title,
    value,
    description,
    color,
    icon,
  }) {
    return (
      <div className="card">

        <div className={`card-icon ${color}-icon`}>
          {icon}
        </div>

        <div className="card-title">
          {title}
        </div>

        <div className={`card-value ${color}`}>
          {value}
        </div>

        <div className="card-small">
          {description}
        </div>

      </div>
    );
  }

  // ==========================================
  // ACTIVITY ROW
  // ==========================================

  function ActivityRow({
    icon,
    title,
    value,
    greenValue,
  }) {
    return (
      <div className="activity-row">

        <div className="activity-left">
          <span className="activity-icon">
            {icon}
          </span>

          <span>
            {title}
          </span>
        </div>

        <strong className={greenValue ? "green" : ""}>
          {value}
        </strong>

      </div>
    );
  }

  // ==========================================
  // FORM INPUT
  // ==========================================

  

  // ==========================================
  // FORM SELECT
  // ==========================================

  

  // ==========================================
  // RENDER CURRENT PAGE
  // ==========================================

  
function renderPage() {
  switch (currentPage) {
    case "dashboard":
      return Dashboard();

    case "activity":
      return ActivityPage();

    case "nutrition":
      return NutritionPage();

    case "sleep":
      return SleepPage();

    case "watch":
      return WatchPage();

    case "ai":
      return AIPage();

    case "energy":
      return EnergyPage();

    case "profile":
      return ProfilePage();

    case "settings":
      return SettingsPage();

    default:
      return Dashboard();
  }
}

  // ==========================================
  // MAIN RETURN
  // ==========================================

  return (
    <div className="app">

      {/* MOBILE OVERLAY */}

      {mobileMenu && (
        <div
          className="mobile-overlay"
          onClick={() => setMobileMenu(false)}
        />
      )}

      {/* SIDEBAR */}

      <aside
        className={`sidebar ${
          mobileMenu ? "sidebar-open" : ""
        }`}
      >

        <div className="logo">

          <div className="logo-mark">
            W
          </div>

          <div>
            <h1>WELLsB</h1>
            <p>Smart Wellness</p>
          </div>

        </div>

        {/* SIDEBAR PROFILE PHOTO */}
        <div style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "10px",
          padding: "18px 10px",
          marginBottom: "8px"
        }}>
          {profilePhoto ? (
            <img
              src={profilePhoto}
              alt="Profile"
              style={{
                width: "82px",
                height: "82px",
                borderRadius: "50%",
                objectFit: "cover",
                border: "3px solid #8bd5ca"
              }}
            />
          ) : (
            <div style={{
              width: "82px",
              height: "82px",
              borderRadius: "50%",
              background: "#dcefeb",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "38px"
            }}>
              {"\u{1F464}"}
            </div>
          )}

          <strong style={{ fontSize: "14px" }}>
            {profile.fullName || "WELLsB User"}
          </strong>

          <label style={{
            background: "#167d70",
            color: "white",
            padding: "9px 16px",
            borderRadius: "8px",
            cursor: "pointer",
            fontSize: "12px",
            fontWeight: "600"
          }}>
            Update Photo
            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              style={{ display: "none" }}
            />
          </label>

          <button
            type="button"
            onClick={() => {
              setProfilePhoto("");
              localStorage.removeItem("wellsbProfilePhoto");
            }}
            style={{
              background: "transparent",
              color: "#d9534f",
              border: "1px solid #d9534f",
              padding: "7px 14px",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "12px"
            }}
          >
            Remove Photo
          </button>
        </div>

        <div className="menu-title">
          MAIN
        </div>

        <NavButton
          icon="🏠"
          label="Dashboard"
          page="dashboard"
        />

        <NavButton
          icon="❤️"
          label="Health & Activity"
          page="activity"
        />

        <NavButton
          icon="🥗"
          label="Nutrition"
          page="nutrition"
        />

        <NavButton
          icon="🌙"
          label="Sleep"
          page="sleep"
        />

        <div className="menu-title">
          SMART TECHNOLOGY
        </div>

        <NavButton
          icon="⌚"
          label="Smartwatch"
          page="watch"
        />

        <NavButton
          icon="✨"
          label="AI Insights"
          page="ai"
        />

        <NavButton
          icon="⚡"
          label="Energy Balance"
          page="energy"
        />

        <div className="menu-title">
          ACCOUNT
        </div>

        <NavButton
          icon="👤"
          label="My Profile"
          page="profile"
        />

        <NavButton
          icon="⚙️"
          label="Settings"
          page="settings"
        />

        <div className="sidebar-footer">
          <div className="mini-avatar">
            {profile.fullName
              ? firstName.charAt(0).toUpperCase()
              : "U"}
          </div>

          <div>
            <strong>
              {profile.fullName || "WELLsB User"}
            </strong>

            <small>
              Personal Account
            </small>
          </div>
        </div>

      </aside>

      {/* MAIN */}

      <main className="main">

        {/* MOBILE HEADER */}

        <div className="mobile-header">

          <button
            className="menu-toggle"
            onClick={() =>
              setMobileMenu(!mobileMenu)
            }
          >
            ☰
          </button>

          <strong>
            WELLsB
          </strong>

        </div>

        {renderPage()}

      </main>
    </div>
  );
}


function FormInput({
  label,
  name,
  type = "text",
  value,
  onChange,
  placeholder,
  full,
  step,
}) {
  return (
    <div className={`form-group ${full ? "full" : ""}`}>
      <label>{label}</label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        step={step}
      />
    </div>
  );
}


function FormSelect({
  label,
  name,
  value,
  onChange,
  options,
}) {
  return (
    <div className="form-group">
      <label>{label}</label>
      <select
        name={name}
        value={value}
        onChange={onChange}
      >
        <option value="">
          Select {label.toLowerCase()}
        </option>

        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
  }

export default App;
