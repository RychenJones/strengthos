const express = require('express');
const app = express();
const bcrypt = require("bcrypt");

// session setup
const session = require('express-session');
app.use(session({
  secret: 'a-strong-secret',  // change this for production
  resave: false,
  saveUninitialized: false
}));

// SQLite database
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('database/database.db', (err) => {
  if (err) console.error(err.message);
  else console.log('Connected to SQLite database.');
});

// Middleware to parse form data
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Serve static files (HTML, CSS, JS)
app.use(express.static('public')); // put your HTML/CSS/JS in a folder named 'public'

// Example route to handle form submissions
app.post('/submit-form', (req, res) => {
  console.log(req.body); // logs submitted form data
  res.send('Form received');
});

// routes
  // route for login
  app.post("/login", async (req,res)=>{
    const { email, password } = req.body;

    // Check required fields
    if (!email || !password) {
      return res.send("All fields are required");
    }

    console.log("Email:", email); // your original comment
    console.log("unHashed Password:", password); // your original comment

    // --- Changed to hashed password check ---
    db.get(
      "SELECT * FROM users WHERE email = ?", // query by email only (changed from email+password)
      [email], // parameter for email (changed)
      async (err, row) => { // added async here to use await for bcrypt.compare
        if (err) {
          console.error(err.message);
          return res.status(500).send("Server error");
        }

        if (row) {
          const match = await bcrypt.compare(password, row.password); // compare entered password with hashed password (added)
          if (match) {
            req.session.users_id = row.users_id;   // store user ID in session
            console.log("Login successful for:", row.name); // same as before
            return res.redirect("/pages/dashboard.html");
          } else {
            console.log("Login failed for:", email); // same as before
            return res.status(401).send("Login failed"); // same as before
          }
        } else {
          console.log("Login failed for:", email); // same as before
          return res.status(401).send("Login failed"); // same as before
        }
      }
    ); // end db.get
    // --- End of hashed password check ---
  });

  // route for account creation
  app.post("/create-account", async (req,res)=>{
    const { name, birthdate, email, password, confirm } = req.body;

    // Check required fields
    if (!name || !birthdate || !email || !password || !confirm) {
      return res.send("All fields are required");
    }

    // Check password match
    if (password !== confirm) {
      return res.send("Passwords do not match");
    }

    const hashedPassword = await bcrypt.hash(password, 10); // hash password before saving (added)

    console.log("Name:", name); // original comment
    console.log("Birthdate:", birthdate); // original comment
    console.log("Email", email); // original comment
    console.log("Hashed password", hashedPassword); // updated to show hashed password (changed)

    // Insert new user into DB
    db.run(
      "INSERT INTO users (name, birthdate, email, password) VALUES (?, ?, ?, ?)", // changed from no DB insert to actual insert
      [name, birthdate, email, hashedPassword], // parameters including hashed password (added)
      function(err){
        if (err) {
          console.error(err.message); // same as before
          return res.status(500).send("Server error"); // respond 500
        }
        req.session.users_id = this.lastID; // last inserted user ID
        req.session.email = email;
        console.log("Account created for:", name); // log success
        res.redirect("/pages/questionaire.html");
      }
    ); // end db.run
  });

  // route for questionaire
  app.post("/questionaire", async (req,res)=>{
    const { weight, unit, fitnessGoal, experience, daysPerWeek } = req.body;

    if (!req.session.users_id) {
      return res.redirect("/login"); // only logged-in users
    }

    if (!weight || !unit || !fitnessGoal || !experience || !daysPerWeek) {
      return res.send("All fields are required");
    }

    console.log("Weight:", weight);
    console.log("Unit:", unit);
    console.log("Fitness Goal", fitnessGoal);
    console.log("Experience", experience);
    console.log("Days per week", daysPerWeek)

    // insert info into DB
    db.run(
      "UPDATE users SET weight=?, unit=?, fitnessGoal=?, experience=?, daysPerWeek=? WHERE users_id=?",
      [weight, unit, fitnessGoal, experience, daysPerWeek, req.session.users_id],
      function(err){
        if (err) {
          console.error(err.message);
          return res.status(500).send("Server error");
        }
        res.redirect("/pages/dashboard.html");
      }
    );
  });

  // route for password reset
  app.post("/reset", async (req,res)=>{
    const { pw, confirmPw } = req.body;

    // Check required fields
    if (!pw || !confirmPw) {
      return res.send("All fields are required");
    }

    // Check password match
    if (pw !== confirmPw) {
      return res.send("Passwords do not match");
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(pw, 10);

    console.log("Hashed Password:", hashedPassword);

    // respond
    res.send("Password reset");
  });

  // route for add workout ---------------------------------------
  app.post("/add-workout", (req, res) => {
    const { name, date, duration, rating } = req.body;

    // Check if user is logged in
    if (!req.session.users_id) {
      return res.status(401).send("You must be logged in to log a workout");
    }

    // Require fields
    if (!name || !date) {
      return res.send("Name and date are required");
    }

    console.log("Workout:", name);
    console.log("Date:", date);
    console.log("Duration:", duration);
    console.log("Rating:", rating);

    // Normalize single/multiple exercises
    let exerciseNames = req.body.exercise;
    let weights = req.body.weight;
    let units = req.body.unit;
    let setsArr = req.body.sets;
    let repsArr = req.body.reps;

    if (!Array.isArray(exerciseNames)) {
      exerciseNames = [exerciseNames];
      weights = [weights];
      units = [units];
      setsArr = [setsArr];
      repsArr = [repsArr];
    }

    // Build exercises array
    const exercises = exerciseNames.map((ex, i) => ({
      exercise: ex,
      weight: weights[i],
      unit: units[i],
      sets: setsArr[i],
      reps: repsArr[i],
    }));

    const workoutDuration = parseInt(duration);
    const workoutRating = parseInt(rating);

    exercises.forEach(ex => {
    ex.sets = parseInt(ex.sets);
    ex.reps = parseInt(ex.reps);
    ex.weight = parseInt(ex.weight);
    });

    console.log("Exercises:", exercises);

    // Insert workout
    db.run(
      "INSERT INTO workouts (users_id, name, date, duration, rating) VALUES (?, ?, ?, ?, ?)",
      [req.session.users_id, name, date, workoutDuration, workoutRating],
      function (err) {
        if (err) return res.status(500).send("Server error");

        const workoutId = this.lastID;

        // Insert exercises sequentially to ensure all are done
        const insertExercise = (index) => {
          if (index >= exercises.length) {
            // All exercises inserted, redirect
            return res.redirect("/pages/dashboard.html");
          }

          const ex = exercises[index];

          db.get(
            "SELECT exercises_id FROM exercise WHERE name=?",
            [ex.exercise],
            (err, row) => {
              if (err || !row) {
                console.error("Exercise not found:", ex.exercise);
                // Skip missing exercise and continue
                return insertExercise(index + 1);
              }

              db.run(
                "INSERT INTO workouts_exercises (workout_id, exercises_id, sets, reps, weight, unit) VALUES (?, ?, ?, ?, ?, ?)",
                [workoutId, row.exercises_id, ex.sets, ex.reps, ex.weight, ex.unit],
                (err) => {
                  if (err) console.error(err.message);
                  insertExercise(index + 1);
                }
              );
            }
          );
        };

        insertExercise(0); // start inserting exercises
      }
    );
  });

// Start the server
const PORT = 3000;
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));