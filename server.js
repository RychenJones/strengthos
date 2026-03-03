const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const bcrypt = require("bcrypt");

// Middleware to parse form data
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

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

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    console.log("Email:", email);
    console.log("Hashed Password:", hashedPassword);

    // respond
    res.send("Logged in");
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

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    console.log("Name:", name);
    console.log("Birthdate:", birthdate);
    console.log("Email", email);
    console.log("Hashed password", hashedPassword);

    // respond
    res.send("Received");
  });

  // route for questionaire
  app.post("/questionaire", (req,res)=>{
    const { weight, unit, fitnessGoal, experience, daysPerWeek } = req.body;

    console.log("Weight:", weight);
    console.log("Unit:", unit);
    console.log("Fitness Goal", fitnessGoal);
    console.log("Experience", experience);
    console.log("Days per week", daysPerWeek)

    // respond
    res.send("Account created");
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