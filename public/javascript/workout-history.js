const container = document.querySelector('#workouts');
const modal = document.querySelector('dialog');
const closeBtns = document.querySelectorAll('.close');

// workout info array
const workoutInfo = [
    {
        name: 'Fun leg day',
        date: '07/02/25',
        duration: '60',
        intensity: '9',
        exercise: 'Bench Press',
        weight: '275',
        unit: 'lbs',
        sets: '3',
        reps: '3'
    },
    {
        name: 'Epic chest day',
        date: '07/01/25',
        duration: '60',
        intensity: '7',
        exercise: 'Bench Press',
        weight: '255',
        unit: 'lbs',
        sets: '2',
        reps: '10'
    }
]

// display base workout info
workoutInfo.forEach((info, index) => {
    const box = document.createElement('section');
    box.classList = 'workout';
    box.dataset.index = index;
    const html = `
        <p class="name">${info.name} - ${info.date}</p>
        <p class="duration">${info.duration} minutes</p>
        <p class="intensity">Intensity: ${info.intensity}</p>
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

    index = box.dataset.index;
    const info = workoutInfo[index];

    modal.showModal();
    
    const modalBox = document.createElement('section');
    modalBox.classList = 'modalWorkout';

    const modalHTML = `
        <p class="modalName">${info.name} - ${info.date}</p>
        <p class="modalDuration">${info.duration} minutes</p>
        <p class="modalIntensity">Intensity: ${info.intensity}</p>
        <div class="exercise-info">
            <p class="exercise">Exercise: ${info.exercise}</p>
            <p class="weight">Weight: ${info.weight} ${info.unit}</p>
            <p class="sets">Sets: ${info.sets}</p>
            <p class="reps">Reps: ${info.reps}</p>
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