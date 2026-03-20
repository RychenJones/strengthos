const container = document.querySelector('#workouts');
const modal = document.querySelector('dialog');
const closeBtns = document.querySelectorAll('.close');

// Store workouts locally after fetching from server
let workoutData = [];

// Fetch workout history from backend and start rendering process
fetch("/history")
  .then(res => res.json())
  .then(data => {
    displayWorkouts(data); // Process flat DB rows into grouped workouts
  })
  .catch(err => console.error(err)); // Log errors if fetch fails

// Group flat database rows into structured workouts with exercise arrays
function displayWorkouts(rows) {
    const workouts = {};

    rows.forEach(row => {
        // If workout doesn't exist yet, create object with empty exercises array
        if (!workouts[row.workouts_id]) {
            workouts[row.workouts_id] = {
                name: row.workout_name,
                date: row.date,
                duration: row.duration,
                intensity: row.intensity,
                exercises: []
            };
        }

        // Add exercise to correct workout
        if (row.exercise_name) {
            workouts[row.workouts_id].exercises.push({
                name: row.exercise_name,
                weight: row.weight,
                unit: row.unit,
                sets: row.sets,
                reps: row.reps
            });
        }
    });

    // Convert object to array and render summaries
    const workoutArray = Object.values(workouts);

    // force correct order (newest first)
    workoutArray.sort((a, b) => new Date(b.date) - new Date(a.date));

    renderWorkouts(workoutArray);
}

// Render each workout summary onto the page
function renderWorkouts(workoutArray) {
    container.innerHTML = "";

    workoutArray.forEach((info, index) => {
        const box = document.createElement('section');
        box.classList = 'workout';
        box.dataset.index = index;

        const formattedDate = new Date(info.date).toLocaleDateString();

        box.innerHTML = `
            <p class="name">${info.name} - ${formattedDate}</p>
            <p class="duration">${info.duration} minutes</p>
            <p class="intensity">Intensity: ${info.intensity}</p>
        `;

        container.appendChild(box);
    });

    // Store for modal access
    workoutData = workoutArray;
}

// Create container inside modal to hold dynamic workout details
const modalContainer = document.createElement('section');
modalContainer.classList = 'modalInfo';
modal.appendChild(modalContainer);

// Open modal when a workout is clicked and display full workout details
container.addEventListener('click', (e) => {
    const box = e.target.closest('.workout');
    if (!box) return;

    const index = parseInt(box.dataset.index);
    if (!workoutData) return;

    const info = workoutData[index]; // Only the clicked workout

    modal.showModal();
    
    const modalBox = document.createElement('section');
    modalBox.classList = 'modalWorkout';

    // Build exercises HTML dynamically
    let exercisesHTML = '';

    if (info.exercises.length === 0) {
        exercisesHTML = '<p>No exercises recorded</p>';
    } else {
        info.exercises.forEach(ex => {
            exercisesHTML += `
                <div class="exercise-info">
                    <p>Exercise: ${ex.name}</p>
                    <p>Weight: ${ex.weight} ${ex.unit}</p>
                    <p>Sets: ${ex.sets}</p>
                    <p>Reps: ${ex.reps}</p>
                </div>
            `;
        });
    }

    const formattedDate = new Date(info.date).toLocaleDateString();

    const modalHTML = `
        <p class="modalName">${info.name} - ${formattedDate}</p>
        <p class="modalDuration">${info.duration} minutes</p>
        <p class="modalIntensity">Intensity: ${info.intensity}</p>
        ${exercisesHTML}
    `;

    modalContainer.innerHTML = '';
    modalBox.innerHTML = modalHTML;
    modalContainer.appendChild(modalBox);
});

// Close modal if clicking outside the modal content area
modal.addEventListener('click', (event) => {
    if (event.target === modal) {
        modal.close();
    }
});

// Close modal if any element with class "close" is clicked
closeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        modal.close();
    });
});