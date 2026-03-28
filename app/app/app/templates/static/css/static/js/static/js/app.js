document.addEventListener('DOMContentLoaded', () => {
    loadHabits();
    setupFormHandler();
});

async function loadHabits() {
    try {
        const response = await fetch('/api/habits');
        const habits = await response.json();
        displayHabits(habits);
    } catch (error) {
        console.error('Error loading habits:', error);
        document.getElementById('habits-list').innerHTML = '<p>Ошибка загрузки</p>';
    }
}

function displayHabits(habits) {
    const container = document.getElementById('habits-list');
    
    if (habits.length === 0) {
        container.innerHTML = '<p>Нет привычек. Добавьте первую!</p>';
        return;
    }
    
    container.innerHTML = habits.map(habit => `
        <div class="habit-card" data-id="${habit.id}">
            <h3>${escapeHtml(habit.name)}</h3>
            <span class="category">${habit.category || 'general'}</span>
            <div class="streak">🔥 Серия: ${habit.streak || 0} дней</div>
            ${habit.description ? `<p>${escapeHtml(habit.description)}</p>` : ''}
            <div class="actions">
                <button onclick="completeHabit(${habit.id})">✅ Выполнено</button>
                <button onclick="deleteHabit(${habit.id})">🗑️ Удалить</button>
            </div>
        </div>
    `).join('');
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function setupFormHandler() {
    const form = document.getElementById('habit-form');
    if (form) {
        form.onsubmit = async (e) => {
            e.preventDefault();
            
            const habit = {
                name: document.getElementById('habit-name').value,
                description: document.getElementById('habit-description').value,
                category: document.getElementById('habit-category').value
            };
            
            try {
                const response = await fetch('/api/habits', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(habit)
                });
                
                if (response.ok) {
                    form.reset();
                    loadHabits();
                }
            } catch (error) {
                console.error('Error:', error);
            }
        };
    }
}

async function completeHabit(id) {
    try {
        const response = await fetch(`/api/habits/${id}/complete`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            loadHabits();
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

async function deleteHabit(id) {
    if (!confirm('Вы уверены?')) return;
    
    try {
        const response = await fetch(`/api/habits/${id}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            loadHabits();
        }
    } catch (error) {
        console.error('Error:', error);
    }
}
