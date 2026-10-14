import { useEffect, useState } from "react";

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
 // FOOD PHOTO
 
const [foodPhoto, setFoodPhoto] = useState("");
const [foodMessage, setFoodMessage] = useState("");
const [foodAnalysis, setFoodAnalysis] = useState(null);
const [foodLoading, setFoodLoading] = useState(false);


  // ==========================================
  // MOBILE SIDEBAR
  // ==========================================

  const [mobileMenu, setMobileMenu] = useState(false);

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

async function handleFoodPhotoUpload(event) {
  const file = event.target.files[0];

  if (!file) return;

  if (!file.type.startsWith("image/")) {
    alert("Please choose a food image.");
    return;
  }

  if (file.size > 5 * 1024 * 1024) {
    alert("Please choose an image smaller than 5 MB.");
    return;
  }

  // Show the selected photo immediately
  const reader = new FileReader();

  reader.onload = () => {
    setFoodPhoto(reader.result);
  };

  reader.readAsDataURL(file);

  // Clear old results and start AI analysis
  setFoodAnalysis(null);
  setFoodLoading(true);
  setFoodMessage("🔍 AI is identifying your food and estimating calories...");

  try {
    const formData = new FormData();
    formData.append("image", file);

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
      "⚠️ Could not analyse the photo. Check that your backend is running and try again."
    );
  } finally {
    setFoodLoading(false);
  }
}

// Your next existing function stays below
function handlePhotoUpload(event) {
  const file = event.target.files[0];

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
    try {
      localStorage.setItem("wellsbProfilePhoto", reader.result);
      setProfilePhoto(reader.result);
    } catch (error) {
      alert("This photo could not be saved. Please choose a smaller image.");
    }
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

  const currentSteps = 6420;
  const currentSleep = 7.2;
  const currentWater = 1.8;
  const caloriesBurned = 428;
  const activeMinutes = 46;
  const heartRate = 76;

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

  const sleepProgress = Math.min(
    (currentSleep / sleepGoal) * 100,
    100
  );

  const waterProgress = Math.min(
    (currentWater / waterGoal) * 100,
    100
  );

  // ==========================================
  // AI INSIGHT
  // ==========================================

  function getAIInsight() {
    if (!profile.fullName) {
      return "Complete your personal profile so WELLsB can provide more personalized wellness recommendations.";
    }

    let message = `Hello ${firstName}! `;

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
              âŒš Watch Connected
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
              {currentSleep} hrs
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
            <div className="card-icon purple-icon">âš–ï¸</div>

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
              <div className="summary-icon">â¤ï¸</div>

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
                  You slept {currentSleep} hours last
                  night. Your target is {sleepGoal} hours.
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
              â¤ï¸
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
              âœ¨
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
          title="â¤ï¸ Health & Activity"
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
              icon="🏃"
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
            <label className="photo-upload-button">
              📷 Take Photo or Upload Food
              <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFoodPhotoUpload}
                hidden
              />
            </label>

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
              </div>
            )}
            {foodMessage && (
  <p role="status">{foodMessage}</p>
)}

           
{foodLoading && (
  <p>⏳ Analysing your food photo...</p>
)}

{foodAnalysis && (
  <div className="ai-box" style={{ marginTop: "16px" }}>
    <h3>🍽️ AI Food Analysis</h3>

    <p>
      <strong>Food:</strong> {foodAnalysis.food_name}
    </p>

    <h2>🔥 {foodAnalysis.calories} kcal</h2>

    <p>
      🥩 Protein: {foodAnalysis.protein_g} g
    </p>

    <p>
      🍞 Carbohydrates: {foodAnalysis.carbs_g} g
    </p>

    <p>
      🥑 Fat: {foodAnalysis.fat_g} g
    </p>

    <p>
      📏 Portion: {foodAnalysis.portion_estimate}
    </p>

    <p>
      ℹ️ {foodAnalysis.notes}
    </p>

    <p>
      Confidence: {foodAnalysis.confidence}
    </p>
  </div>
)}

          </div>
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
    return (
      <>
        <PageHeader
          title="🌙 Sleep"
          subtitle="Understand and improve your sleep habits."
        />

        <div className="cards three-columns">

          <StatCard
            title="Sleep Duration"
            value={`${currentSleep} hrs`}
            description="Last night"
            color="blue"
            icon="🌙"
          />

          <StatCard
            title="Sleep Quality"
            value="Good"
            description="Based on your data"
            color="green"
            icon="âœ¨"
          />

          <StatCard
            title="Sleep Goal"
            value={`${sleepGoal} hrs`}
            description="Your target"
            color="purple"
            icon="🎯"
          />
        </div>

        <div className="section">

          <h3>Sleep Recommendation</h3>

          <div className="ai-box">

            <div className="ai-title">
              🌙 Better Sleep
            </div>

            <p>
              Try maintaining a consistent bedtime and
              reducing screen exposure before sleeping.
              WELLsB will use your smartwatch data to
              monitor your sleep patterns.
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
    return (
      <>
        <PageHeader
          title="âŒš WELLsB Watch"
          subtitle="Smartwatch connection and health data."
        />

        <div className="watch-connected">
          <span>🟢</span>
          Connected
        </div>

        <div className="section">

          <h3>Device Status</h3>

          <div className="activity-list">

            <ActivityRow
              icon="⌚"
              title="Device"
              value="WELLsB Watch"
            />

            <ActivityRow
              icon="🔋"
              title="Battery"
              value="82%"
            />

            <ActivityRow
              icon="📡"
              title="Connection"
              value="Connected"
              greenValue
            />

            <ActivityRow
              icon="â¤ï¸"
              title="Heart Rate"
              value={`${heartRate} BPM`}
            />

          </div>
        </div>

        <div className="section">

          <h3>Smartwatch Data</h3>

          <div className="watch-grid">

            <div className="watch-card">
              <span>â¤ï¸</span>
              <strong>{heartRate}</strong>
              <small>BPM</small>
            </div>

            <div className="watch-card">
              <span>👟</span>
              <strong>
                {currentSteps.toLocaleString()}
              </strong>
              <small>Steps</small>
            </div>

            <div className="watch-card">
              <span>🔥</span>
              <strong>{caloriesBurned}</strong>
              <small>Calories</small>
            </div>

            <div className="watch-card">
              <span>🏃</span>
              <strong>{activeMinutes}</strong>
              <small>Active Minutes</small>
            </div>

          </div>
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
          title="âœ¨ AI Insights"
          subtitle="Personalized wellness recommendations."
        />

        <div className="section">

          <div className="ai-large">

            <div className="ai-large-icon">
              âœ¨
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
                Keep moving toward your daily step
                target.
              </p>
            </div>

            <div className="insight-card">
              <span>🌙</span>
              <h4>Sleep</h4>
              <p>
                Aim for your personal sleep goal every
                night.
              </p>
            </div>

            <div className="insight-card">
              <span>💧</span>
              <h4>Hydration</h4>
              <p>
                Stay hydrated throughout the day.
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
          title="âš¡ Energy Balance"
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
            icon="âš¡"
          />
        </div>

        <div className="section">

          <h3>Energy Recommendation</h3>

          <div className="ai-box">

            <div className="ai-title">
              âš¡ Your Energy Balance
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
              icon="📏"
            />

            <StatCard
              title="Weight"
              value={profile.weight || "--"}
              description="kilograms"
              color="orange"
              icon="⚖️"
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
                <strong>âŒš Watch Sync</strong>
                <p>Automatically synchronize watch data.</p>
              </div>

              <span className="setting-status">
                Automatic
              </span>
            </div>

            <div className="setting-row">
              <div>
                <strong>âœ¨ AI Insights</strong>
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

  function FormInput({
    label,
    name,
    type = "text",
    value,
    onChange,
    placeholder,
    step,
    full,
  }) {
    return (
      <div className={`form-group ${full ? "full" : ""}`}>

        <label>
          {label}
        </label>

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

  // ==========================================
  // FORM SELECT
  // ==========================================

  function FormSelect({
    label,
    name,
    value,
    onChange,
    options,
  }) {
    return (
      <div className="form-group">

        <label>
          {label}
        </label>

        <select
          name={name}
          value={value}
          onChange={onChange}
        >

          <option value="">
            Select {label.toLowerCase()}
          </option>

          {options.map((option) => (
            <option
              key={option}
              value={option}
            >
              {option}
            </option>
          ))}

        </select>

      </div>
    );
  }

  // ==========================================
  // RENDER CURRENT PAGE
  // ==========================================

  function renderPage() {
    switch (currentPage) {
      case "dashboard":
        return <Dashboard />;

      case "activity":
        return <ActivityPage />;

      case "nutrition":
        return <NutritionPage />;

      case "sleep":
        return <SleepPage />;

      case "watch":
        return <WatchPage />;

      case "ai":
        return <AIPage />;

      case "energy":
        return <EnergyPage />;

      case "profile":
  
        return ProfilePage();

      case "settings":
        return <SettingsPage />;

      default:
        return <Dashboard />;
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
          icon="âŒš"
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
          icon="⚙️"
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

export default App;


