const addExercise = document.getElementById('add-exercise');
const box = document.getElementById('exercise-box');
let exerciseCount = 0;

// add a single exercise info block
addExercise.addEventListener('click', () => {
    exerciseCount++;
    const block = document.createElement('div');
    block.className = 'exercise-info';

    block.innerHTML = `
        <p class="remove">- remove</p>

        <label>Exercise</label>
        <select name="exercise[]" required>
            <option value="" disabled selected>Select an exercise</option>
            <option value="bench press">Bench Press</option>
            <option value="squat">Squat</option>
            <option value="deadlift">Deadlift</option>
        </select>

        <label>Weight:</label>
        <input type="number" name="weight[]" placeholder="135" required>
        <select name="unit[]">
            <option value="lbs" selected>lbs</option>
            <option value="kgs">kgs</option>
        </select>

        <label>Sets:</label>
        <input type="number" name="sets[]" placeholder="3" required>

        <label>Reps:</label>
        <input type="number" name="reps[]" placeholder="5" required>
    `;

    box.appendChild(block);
});

// remove chosen exercise block
box.addEventListener('click', e => {
    if (e.target.classList.contains('remove')) {
        e.target.closest('.exercise-info').remove();
    }
});