document.addEventListener('DOMContentLoaded', () => {
    loadHabits();
    setupModal();
    setupThemeToggle();
});

let currentModal = null;

function setupModal() {
    const modal = document.getElementById('habit-modal');
    const openBtn = document.getElementById('open-modal-btn');
    const closeBtn = document.querySelector('.close-btn');
    const form = document.getElementById('habit-form');
    
    currentModal = modal;
    
    if (openBtn) {
        openBtn.onclick = () => {
            modal.style.display = 'flex';
        };
    }
    
    if (closeBtn) {
        closeBtn.onclick = () => {
            modal.style.display = 'none';
        };
    }
    
    window.onclick = (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    };
    
    if (form) {
        form.onsubmit = async (e) => {
            e.preventDefault();
            
            const habit = {
                name: document.getElementById('habit-name').value,
                description: document.getElementById('habit-description').value,
                category: document.getElementById('habit-category').value
            };
            
            if (!habit.name.trim()) {
                showNotification('Введите название привычки', 'error');
                return;
            }
            
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
                    modal.style.display = 'none';
                    loadHabits();
                    showNotification('✅ Привычка добавлена!', 'success');
                } else {
                    const error = await response.json();
                    showNotification(error.error || 'Ошибка при добавлении', 'error');
                }
            } catch (error) {
                console.error('Error:', error);
                showNotification('❌ Не удалось добавить привычку', 'error');
            }
        };
    }
}

async function loadHabits() {
    try {
        const response = await fetch('/api/habits');
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const habits = await response.json();
        displayHabits(habits);
    } catch (error) {
        console.error('Error loading habits:', error);
        document.getElementById('habits-list').innerHTML = '<p>❌ Ошибка загрузки привычек</p>';
        showNotification('Не удалось загрузить привычки', 'error');
    }
}

function displayHabits(habits) {
    const container = document.getElementById('habits-list');
    
    if (habits.length === 0) {
        container.innerHTML = '<p>✨ Нет привычек. Нажмите "Новая привычка" чтобы добавить!</p>';
        return;
    }
    
    container.innerHTML = habits.map(habit => `
        <div class="habit-card" data-id="${habit.id}">
            <h3>${escapeHtml(habit.name)}</h3>
            <span class="category">${escapeHtml(habit.category || 'general')}</span>
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
            showNotification('❌ Привычка не найдена', 'error');
        } else {
            const error = await response.json();
            showNotification(error.error || 'Ошибка при выполнении', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showNotification('❌ Не удалось отметить привычку', 'error');
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
            showNotification('🗑️ Привычка удалена', 'success');
        } else if (response.status === 404) {
            showNotification('❌ Привычка не найдена', 'error');
        } else {
            const error = await response.json();
            showNotification(error.error || 'Ошибка при удалении', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showNotification('❌ Не удалось удалить привычку', 'error');
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
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
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

// Добавляем анимации в CSS (добавим в следующем коммите)
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);
/* Модальное окно */
.modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
    animation: fadeIn 0.3s ease;
}

.modal-content {
    background: white;
    padding: 2rem;
    border-radius: 12px;
    width: 90%;
    max-width: 500px;
    position: relative;
    animation: slideUp 0.3s ease;
}

body.dark .modal-content {
    background: #374151;
}

.close-btn {
    position: absolute;
    top: 1rem;
    right: 1rem;
    font-size: 1.5rem;
    cursor: pointer;
    color: #666;
    transition: color 0.2s;
}

.close-btn:hover {
    color: #000;
}

body.dark .close-btn {
    color: #9ca3af;
}

body.dark .close-btn:hover {
    color: #fff;
}

.modal-content h2 {
    margin-top: 0;
    margin-bottom: 1.5rem;
    color: #333;
}

body.dark .modal-content h2 {
    color: #f3f4f6;
}

.modal-content input,
.modal-content textarea,
.modal-content select {
    width: 100%;
    padding: 0.75rem;
    margin-bottom: 1rem;
    border: 1px solid #ddd;
    border-radius: 8px;
    font-size: 1rem;
}

body.dark .modal-content input,
body.dark .modal-content textarea,
body.dark .modal-content select {
    background: #1f2937;
    color: #f3f4f6;
    border-color: #4b5563;
}

.modal-content button {
    width: 100%;
    padding: 0.75rem;
    background: #667eea;
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 1rem;
    cursor: pointer;
    transition: background 0.3s;
}

.modal-content button:hover {
    background: #5a67d8;
}

@keyframes fadeIn {
    from {
        opacity: 0;
    }
    to {
        opacity: 1;
    }
}

@keyframes slideUp {
    from {
        transform: translateY(50px);
        opacity: 0;
    }
    to {
        transform: translateY(0);
        opacity: 1;
    }
}
function showSkeletonLoader() {
    const container = document.getElementById('habits-list');
    container.innerHTML = `
        <div class="skeleton skeleton-card"></div>
        <div class="skeleton skeleton-card"></div>
        <div class="skeleton skeleton-card"></div>
    `;
}
