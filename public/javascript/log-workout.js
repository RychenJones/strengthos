const addExercise = document.getElementById('add-exercise');
const box = document.getElementById('exercise-box');

let exerciseList = [];
let exerciseIndex = 0; // <-- added

fetch("/exercises")
  .then(res => res.json())
  .then(data => {
    exerciseList = data;
  })
  .catch(err => console.error(err));

// add a single exercise info block
addExercise.addEventListener('click', () => {
    if (exerciseList.length === 0) {
        alert("Exercises are still loading, try again in a moment.");
        return;
    }

    const currentIndex = exerciseIndex++; // <-- added

    const block = document.createElement('div');
    block.className = 'exercise-info';

    block.innerHTML = `
        <p class="removeEx">X</p>

        <label class="exercise-label">Exercise:</label>
        <select class="exercise" name="exercise[${currentIndex}]" required>
            <option value="" disabled selected>Select an exercise</option>
        </select>

        <button class="add-set" type="button">Add set</button>
        <div class="set-box"></div>
    `;

    const select = block.querySelector(".exercise");

    exerciseList.forEach(ex => {
        const option = document.createElement("option");
        option.value = ex.exercises_id;
        option.textContent = ex.name;
        select.appendChild(option);
    });

    // Add initial set automatically
    addSetToBlock(block, currentIndex); // <-- changed

    box.appendChild(block);
});

// remove chosen exercise block, add set, remove individual set
box.addEventListener('click', e => {
    const block = e.target.closest('.exercise-info');
    if (!block) return;

    // remove exercise block
    if (e.target.classList.contains('removeEx')) {
        block.remove();
        return;
    }

    // add set to this exercise
    if (e.target.classList.contains('add-set')) {
        const select = block.querySelector('.exercise');
        const match = select.name.match(/\d+/);
        const index = match ? match[0] : 0; // <-- added
        addSetToBlock(block, index); // <-- changed
        return;
    }

    // remove individual set
    if (e.target.classList.contains('removeSet')) {
        e.target.closest('.set-info').remove();
    }
});

// helper function to add a set to an exercise block
function addSetToBlock(block, index) { // <-- changed
    const container = block.querySelector('.set-box');

    const setDiv = document.createElement('div');
    setDiv.className = 'set-info';

    setDiv.innerHTML = `
        <p class="removeSet">x</p>
        <section class="weight-group">
            <label class="weight-label">Weight:</label>
            <input type="number" name="weight[${index}][]" placeholder="135" class="weight" required>
            <select name="unit[${index}][]" class="unit">
                <option value="lbs" selected>lbs</option>
                <option value="kgs">kgs</option>
            </select>
        </section>

        <label class="reps-label">Reps:</label>
        <input class="reps" type="number" name="reps[${index}][]" placeholder="5" required>
    `;

    container.appendChild(setDiv);
}