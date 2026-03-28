document.addEventListener('DOMContentLoaded', () => {
    loadHabits();
    setupFormHandler();
    setupThemeToggle();
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
                    showNotification('Привычка добавлена!', 'success');
                }
            } catch (error) {
                console.error('Error:', error);
                showNotification('Ошибка при добавлении', 'error');
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
            const result = await response.json();
            loadHabits();
            showNotification(`✅ Выполнено! Серия: ${result.streak} дней`, 'success');
        } else if (response.status === 404) {
            showNotification('Привычка не найдена', 'error');
        } else {
            showNotification('Ошибка при выполнении', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showNotification('Не удалось отметить привычку', 'error');
    }
}

async function deleteHabit(id) {
    if (!confirm('Вы уверены, что хотите удалить эту привычку?')) {
        return;
    }
    
    try {
        const response = await fetch(`/api/habits/${id}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            loadHabits();
            showNotification('Привычка удалена', 'success');
        } else if (response.status === 404) {
            showNotification('Привычка не найдена', 'error');
        } else {
            showNotification('Ошибка при удалении', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showNotification('Не удалось удалить привычку', 'error');
    }
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    const colors = {
        success: '#10b981',
        error: '#ef4444',
        info: '#3b82f6'
    };
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 20px;
        border-radius: 8px;
        background: ${colors[type] || colors.info};
        color: white;
        font-weight: bold;
        z-index: 2000;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

function setupThemeToggle() {
    const themeBtn = document.getElementById('theme-toggle');
    if (!themeBtn) return;
    
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark');
        themeBtn.textContent = '☀️';
    }
    
    themeBtn.onclick = () => {
        document.body.classList.toggle('dark');
        const isDark = document.body.classList.contains('dark');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
        themeBtn.textContent = isDark ? '☀️' : '🌙';
    };
}
