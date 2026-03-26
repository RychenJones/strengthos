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
  // route for login ----------------------------------------------
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

  // route for account creation ----------------------------------------------
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

  // route for questionaire ----------------------------------------------
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


  // route to get all exercises (for dropdown) ----------------------------
  app.get("/exercises", (req, res) => {
    db.all("SELECT exercises_id, name FROM exercises", [], (err, rows) => {
      if (err) {
        console.error(err);
        return res.status(500).send("Server error");
      }
      res.json(rows);
    });
  });

  // route for password reset ----------------------------------------------
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
    const { name, date, duration, intensity } = req.body;

    // Check if user is logged in
    if (!req.session.users_id) {
      return res.status(401).send("You must be logged in to log a workout");
    }

    // Require fields
    if (!name || !date) {
      return res.send("Name and date are required");
    }

    // Print values
    console.log("Workout:", name);
    console.log("Date:", date);
    console.log("Duration:", duration);
    console.log("Intensity:", intensity);

    // --- Handle multiple sets per exercise (nested arrays) ---
    const { exercise, weight, reps, unit } = req.body;
    const exercises = [];

    // HARD validation: must exist
    if (!exercise || !weight || !reps || !unit) {
      return res.status(400).send("Malformed form data");
    }

    Object.keys(exercise).forEach(i => {
      const exerciseId = exercise[i];

      // HARD validation per exercise
      if (!weight[i] || !reps[i] || !unit[i]) {
        throw new Error(`Missing set data for exercise index ${i}`);
      }

      const weightsArr = Array.isArray(weight[i]) ? weight[i] : [weight[i]];
      const repsArr = Array.isArray(reps[i]) ? reps[i] : [reps[i]];
      const unitsArr = Array.isArray(unit[i]) ? unit[i] : [unit[i]];

      // ensure equal lengths
      if (
        weightsArr.length !== repsArr.length ||
        weightsArr.length !== unitsArr.length
      ) {
        throw new Error(`Mismatched set lengths at exercise index ${i}`);
      }

      for (let j = 0; j < weightsArr.length; j++) {
        exercises.push({
          exercise: parseInt(exerciseId),
          weight: parseInt(weightsArr[j]),
          reps: parseInt(repsArr[j]),
          unit: unitsArr[j]
        });
      }
    });
    // --- End of multiple set handling ---

    // Convert strings to integers
    const workoutDuration = parseInt(duration);
    const workoutIntensity = parseInt(intensity);

    // Print exercises
    console.log("Exercises:", exercises);

    // Insert workout
    db.run(
      "INSERT INTO workouts (users_id, name, date, duration, intensity) VALUES (?, ?, ?, ?, ?)",
      [req.session.users_id, name, date, workoutDuration, workoutIntensity],
      function (err) {
        if (err) 
          return res.status(500).send("Server error");

        const workoutId = this.lastID;

        // Insert exercises sequentially to ensure all are done
        const insertExercise = (index) => {
          if (index >= exercises.length) {
            // All exercises inserted, redirect
            return res.redirect("/pages/dashboard.html");
          }

          const ex = exercises[index];

          db.get(
            "SELECT exercises_id FROM exercises WHERE exercises_id=?",
            [ex.exercise],
            (err, row) => {
              if (err || !row) {
                console.error("Exercise not found:", ex.exercise);
                return res.status(400).send("Invalid exercise ID");
              }

              db.run(
                "INSERT INTO workouts_exercises (workouts_id, exercises_id, reps, weight, unit) VALUES (?, ?, ?, ?, ?)",
                [workoutId, row.exercises_id, ex.reps, ex.weight, ex.unit],
                (err) => {
                  if (err) return res.status(500).send("Insert failed");
                  insertExercise(index + 1);
                }
              );
            }
          );
        };

        insertExercise(0);
      }
    );
  });


  // route to get workout history for logged-in user --------------------------------------
  app.get("/history", (req, res) => {
    const userId = req.session.users_id;
    if (!userId) return res.status(401).send("You must be logged in to see history");

    const sql = `
      SELECT w.workouts_id, w.name AS workout_name, w.date, w.duration, w.intensity,
            e.exercises_id, e.name AS exercise_name, we.reps, we.weight, we.unit
      FROM workouts w
      LEFT JOIN workouts_exercises we ON w.workouts_id = we.workouts_id
      LEFT JOIN exercises e ON we.exercises_id = e.exercises_id
      WHERE w.users_id = ?
      ORDER BY w.date DESC, e.exercises_id
    `;

    db.all(sql, [userId], (err, rows) => {
      if (err) {
        console.error(err);
        return res.status(500).send("Server error");
      }

      // Transform flat rows into nested structure
      const history = [];

      rows.forEach(row => {
        // find existing workout
        let workout = history.find(w => w.workouts_id === row.workouts_id);
        if (!workout) {
          workout = {
            workouts_id: row.workouts_id,
            name: row.workout_name,
            date: row.date,
            duration: row.duration,
            intensity: row.intensity,
            exercises: []
          };
          history.push(workout);
        }

        if (row.exercises_id) {
          // find existing exercise in workout
          let exercise = workout.exercises.find(e => e.exercises_id === row.exercises_id);
          if (!exercise) {
            exercise = {
              exercises_id: row.exercises_id,
              name: row.exercise_name,
              sets: []
            };
            workout.exercises.push(exercise);
          }

          exercise.sets.push({
            reps: row.reps,
            weight: row.weight,
            unit: row.unit
          });
        }
      });

      res.json(history);
    });
  });




  // route to delete a workout ---------------------------------------
  app.delete("/delete-workout/:id", (req, res) => {
    const workoutId = req.params.id;
    const userId = req.session.users_id;

    // must be logged in
    if (!userId) {
      return res.status(401).send("Not authorized");
    }

    // verify workout belongs to user
    db.get(
      "SELECT * FROM workouts WHERE workouts_id = ? AND users_id = ?",
      [workoutId, userId],
      (err, row) => {
        if (err) {
          console.error(err);
          return res.status(500).send("Server error");
        }

        if (!row) {
          return res.status(404).send("Workout not found");
        }

        // delete associated exercises first
        db.run(
          "DELETE FROM workouts_exercises WHERE workouts_id = ?",
          [workoutId],
          (err) => {
            if (err) {
              console.error(err);
              return res.status(500).send("Failed to delete exercises");
            }

            // delete workout
            db.run(
              "DELETE FROM workouts WHERE workouts_id = ?",
              [workoutId],
              (err) => {
                if (err) {
                  console.error(err);
                  return res.status(500).send("Failed to delete workout");
                }

                res.sendStatus(200);
              }
            );
          }
        );
      }
    );
  });

// Start the server
const PORT = 3000;
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));