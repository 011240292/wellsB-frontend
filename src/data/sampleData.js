const sampleData = {
  user: {
    name: "Emily",
    goal: "Healthy Lifestyle",
    smartwatchConnected: true,
    watchName: "WELLsB Watch"
  },

  wellnessScore: 82,

  activity: {
    steps: 7342,
    stepGoal: 10000,
    caloriesBurned: 1840,
    caloriesGoal: 2200,
    activeMinutes: 47,
    activeGoal: 60,
    distance: 5.2
  },

  heartRate: {
    current: 76,
    resting: 64,
    status: "Normal"
  },

  sleep: {
    hours: 7.4,
    goal: 8,
    quality: "Good"
  },

  water: {
    consumed: 5,
    goal: 8
  },

  nutrition: {
    caloriesConsumed: 1450,
    calorieGoal: 2000,
    protein: 62,
    carbs: 180,
    fats: 48
  },

  energyBalance: {
    consumed: 1450,
    burned: 1840,
    balance: -390
  },

  aiInsight: {
    type: "Positive",
    message:
      "Your activity level is good today. Consider drinking more water and getting a little more sleep tonight."
  },

  recentActivity: [
    {
      time: "10:32 AM",
      activity: "Morning Walk",
      value: "2.4 km",
      type: "activity"
    },
    {
      time: "9:15 AM",
      activity: "Breakfast Recognized",
      value: "420 kcal",
      type: "food"
    },
    {
      time: "8:30 AM",
      activity: "Heart Rate Check",
      value: "76 BPM",
      type: "heart"
    },
    {
      time: "7:10 AM",
      activity: "Sleep Analysis",
      value: "7h 24m",
      type: "sleep"
    }
  ]
};

export default sampleData;