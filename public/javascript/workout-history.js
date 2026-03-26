const container = document.querySelector('#workouts');
const modal = document.querySelector('dialog');
const closeBtns = document.querySelectorAll('.close');

// Store workouts locally after fetching from server
let workoutData = [];

// Fetch workout history from backend and start rendering process
fetch("/history")
  .then(res => res.json())
  .then(data => {
    renderWorkouts(data);
  })
  .catch(err => console.error(err));

// Render each workout summary onto the page
function renderWorkouts(workoutArray) {
    container.innerHTML = "";

    // force correct order (newest first)
    workoutArray.sort((a, b) => new Date(b.date) - new Date(a.date));

    workoutArray.forEach((info, index) => {
        const box = document.createElement('section');
        box.classList = 'workout';
        box.dataset.index = index;

        const formattedDate = new Date(info.date).toLocaleDateString();

        box.innerHTML = `
            <p class="remove">X</p>
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

// Handle clicks (delete OR open modal)
container.addEventListener('click', (e) => {
    const box = e.target.closest('.workout');
    if (!box) return;

    const index = parseInt(box.dataset.index);
    if (!workoutData) return;

    // DELETE WORKOUT
    if (e.target.classList.contains('remove')) {
        const workout = workoutData[index];

        const confirmDelete = confirm(`Delete "${workout.name}" on ${new Date(workout.date).toLocaleDateString()}?`);

        if (!confirmDelete) return;

        const workoutId = workout.workouts_id;

        fetch(`/delete-workout/${workoutId}`, {
            method: 'DELETE'
        })
        .then(res => {
            if (!res.ok) throw new Error("Delete failed");

            workoutData.splice(index, 1);
            renderWorkouts(workoutData);
        })
        .catch(err => console.error(err));

        return;
    }

    // OPEN MODAL
    const info = workoutData[index];

    modal.showModal();
    
    const modalBox = document.createElement('section');
    modalBox.classList = 'modalWorkout';

    let exercisesHTML = '';

    if (!info.exercises || info.exercises.length === 0) {
        exercisesHTML = '<p>No exercises recorded</p>';
    } else {
        info.exercises.forEach(ex => {
            let setsHTML = '';

            if (ex.sets && ex.sets.length > 0) {
                ex.sets.forEach(set => {
                    setsHTML += `
                        <div class="set">
                            <p>${set.weight} ${set.unit} x ${set.reps}</p>
                        </div>
                    `;
                });
            }

            exercisesHTML += `
                <div class="exercise-info">
                    <p>Exercise: ${ex.name}</p>
                    ${setsHTML}
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