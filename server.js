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

    if (!req.session.users_id) return res.redirect("/login"); // only logged-in users

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

  // route for add workout
  app.post("/add-workout", (req,res)=>{
    const { name, date, duration, intensity } = req.body;

    console.log("Workout:", name);
    console.log("Date:", date);
    console.log("Duration:", duration);
    console.log("Intensity:", intensity);

    // Handle multiple exercises
    const exercises = [];
    if (req.body.exercise) {
      for (let i = 0; i < req.body.exercise.length; i++) {
        exercises.push({
          exercise: req.body.exercise[i],
          weight: req.body.weight[i],
          unit: req.body.unit[i],
          sets: req.body.sets[i],
          reps: req.body.reps[i]
        });
      }
    }

    console.log("Exercises:", exercises);

    // respond
    res.send("Workout logged");
  });

// Start the server
const PORT = 3000;
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));