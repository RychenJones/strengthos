const addExercise = document.getElementById('add-exercise');
const box = document.getElementById('exercise-box');

let exerciseList = [];

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

    const block = document.createElement('div');
    block.className = 'exercise-info';

    block.innerHTML = `
        <p class="removeX">x</p>
        <p class="remove">- remove</p>

        <label class="exercise-label">Exercise:</label>
        <select class="exercise" name="exercise[]" required>
            <option value="" disabled selected>Select an exercise</option>
        </select>

        <section class="weight-group">
            <label class="weight-label">Weight:</label>
            <input type="number" name="weight[]" placeholder="135" class="weight" required>
            <select name="unit[]" class="unit">
                <option value="lbs" selected>lbs</option>
                <option value="kgs">kgs</option>
            </select>
        </section>

        <label class="sets-label">Sets:</label>
        <input class="sets" type="number" name="sets[]" placeholder="3" required>

        <label class="reps-label">Reps:</label>
        <input class="reps" type="number" name="reps[]" placeholder="5" required>
    `;

    const select = block.querySelector(".exercise");

    exerciseList.forEach(ex => {
        const option = document.createElement("option");
        option.value = ex.exercises_id;
        option.textContent = ex.name;
        select.appendChild(option);
    });

    box.appendChild(block);
});


// remove chosen exercise block
box.addEventListener('click', e => {
    if (e.target.classList.contains('remove') ||
        e.target.classList.contains('removeX')
    ) {
        e.target.closest('.exercise-info').remove();
    }
});