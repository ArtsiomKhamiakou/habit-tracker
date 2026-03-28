document.addEventListener('DOMContentLoaded', () => {
    loadHabits();
});

async function loadHabits() {
    try {
        const response = await fetch('/api/habits');
        const habits = await response.json();
        displayHabits(habits);
    } catch (error) {
        console.error('Error loading habits:', error);
    }
}

function displayHabits(habits) {
    const container = document.getElementById('app');
    container.innerHTML = habits.map(habit => `
        <div class="habit-card">
            <h3>${habit.name}</h3>
        </div>
    `).join('');
}
