const Membership = require("../models/membershipModel");
const Trainer = require("../models/trainerModel");
const Booking = require("../models/bookingModel");
const Workout = require("../models/workoutModel");

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function endOfToday() {
  const d = new Date();
  d.setHours(23, 59, 59, 999);
  return d;
}

function startOfWeek() {
  const d = startOfToday();
  d.setDate(d.getDate() - d.getDay());
  return d;
}

async function home(req, res) {
  try {
    const [membership, trainers, todaysClasses, weekSummary, activeDays] = await Promise.all([
      Membership.getActiveForUser(req.userId),
      Trainer.getAll(),
      Booking.getForUser(req.userId, { from: startOfToday(), to: endOfToday() }),
      Workout.getWeekSummary(req.userId, startOfWeek()),
      Workout.getDistinctDays(req.userId, startOfWeek()),
    ]);

    res.json({
      membership,
      trainers,
      todays_classes: todaysClasses,
      week: { workouts: weekSummary.workouts, calories_burned: weekSummary.calories, day_streak: activeDays.length },
    });
  } catch (err) {
    console.error("Erreur dashboard:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
}

module.exports = { home };
