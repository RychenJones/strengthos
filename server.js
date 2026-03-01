const express = require('express');
const bodyParser = require('body-parser');
const app = express();

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

// route for add workout
app.post("/add-workout", (req,res)=>{
  const { name, date, duration, intensity } = req.body;

  console.log("Workout:", name);
  console.log("Date:", date);
  console.log("Duration:", duration);
  console.log("Intensity:", intensity);

  res.send("Workout logged");
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));