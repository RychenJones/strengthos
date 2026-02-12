const addExercise = document.getElementById('add-exercise');
const box = document.getElementById('exercise-box');
// const remove = document.getElementsByClassName('remove');

// exercise-info inner html
let html = `
    <p class="remove">- remove</p>
    <label class="exercise-label" for="exercise">Exercise</label>
    <select class="exercise">
        <option value="" disabled selected>Select an exercise</option>
        <option value="bench press">Bench Press</option>
    </select>

    <div class="weight-group">
        <label class="weight-label" for="weight">Weight: </label>
        <div class="weight-input">
            <input type="number" class="weight" name="weight">
            <select class="unit" name="unit">
                <option value="lbs" selected>lbs</option>
                <option value="kgs">kgs</option>
            </select>
        </div>
    </div>
    
    <label class="sets-label" for="sets">Sets completed: </label>
    <input type="number" class="sets" name="sets">

    <label class="reps-label" for="reps">Reps completed: </label>
    <input type="number" class="reps" name="reps">
`

// add a single exercise info block
addExercise.addEventListener('click', () => {
    const block = document.createElement('div');
    block.className = 'exercise-info';
    block.innerHTML = html;
    box.appendChild(block);
});


box.addEventListener('click', e => {
    if (e.target.classList.contains('remove')) {
    const block = e.target.closest('.exercise-info');
    block.remove();
    }
});