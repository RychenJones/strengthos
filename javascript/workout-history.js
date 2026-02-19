const container = document.querySelector('#workouts');
const modal = document.querySelector('dialog');
const closeBtns = document.querySelectorAll('.close');

// workout info array
const workoutInfo = [
    {
        name: 'Epic chest day',
        date: '07/01/25',
        duration: '60',
        intensity: '7',
        exercise: 'bench press',
        weight: '255',
        sets: '2',
        reps: '10'
    }
]

// display base workout info
workoutInfo.forEach(info => {
    const box = document.createElement('section');
    box.classList = 'workout';
    const html = `
        <p>Name: ${info.name}</p>
        <p>Date: ${info.date}</p>
        <p>Duration: ${info.duration}</p>
        <p>Intensity: ${info.intensity}</p>
    `
    box.innerHTML = html;
    container.appendChild(box);
})

// create modalInfo section within dialog
const modalContainer = document.createElement('section');
modalContainer.classList = 'modalInfo';
modal.appendChild(modalContainer);

//open modal and populate workout info section within modalInfo
container.addEventListener('click', (e) => {
    const box = e.target.closest('.workout');
    if (!box) return;

    const info = workoutInfo[0];

    modal.showModal();
    
    const modalBox = document.createElement('section');
    modalBox.classList = 'modalWorkout';

    const modalHTML = `
        <p>Name: ${info.name}</p>
        <p>Date: ${info.date}</p>
        <p>Duration: ${info.duration}</p>
        <p>Intensity: ${info.intensity}</p>
        <div class="exercise-info">
            <p>Exercise: ${info.exercise}</p>
            <p>Weight: ${info.weight}</p>
            <p>Sets: ${info.sets}</p>
            <p>Reps: ${info.reps}</p>
        </div>
    `
    modalContainer.innerHTML = '';
    modalBox.innerHTML = modalHTML;
    modalContainer.appendChild(modalBox);
})

// Close modal if clicking outside the image
modal.addEventListener('click', (event) => {
    if (event.target === modal) {
        modal.close();
    }
});

// Close modal if close button is clicked
closeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
    modal.close();
    });
});