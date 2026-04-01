document.addEventListener('DOMContentLoaded', () => {
    loadHabits();
    loadStats();
    setupModal();
    setupThemeToggle();
    setupClearAllButton();
    setupSearch();
});

let currentPage = 1;
let allHabits = [];

async function loadHabits(page = 1) {
    currentPage = page;
    try {
        const response = await fetch(`/api/habits?page=${page}&per_page=10`);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        allHabits = data.items || data;
        displayHabits(allHabits);
        displayPagination(data);
    } catch (error) {
        console.error('Error loading habits:', error);
        document.getElementById('habits-list').innerHTML = '<p>❌ Ошибка загрузки привычек</p>';
        showNotification('Не удалось загрузить привычки', 'error');
    }
}

function displayHabits(habits) {
    const container = document.getElementById('habits-list');
    
    if (!habits || habits.length === 0) {
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

function displayPagination(data) {
    const paginationContainer = document.getElementById('pagination');
    if (!paginationContainer) return;
    
    if (!data.pages || data.pages <= 1) {
        paginationContainer.innerHTML = '';
        return;
    }
    
    let html = '<div class="pagination">';
    
    if (data.page > 1) {
        html += `<button onclick="loadHabits(${data.page - 1})">← Назад</button>`;
    }
    
    html += `<span>Страница ${data.page} из ${data.pages}</span>`;
    
    if (data.page < data.pages) {
        html += `<button onclick="loadHabits(${data.page + 1})">Вперед →</button>`;
    }
    
    html += '</div>';
    paginationContainer.innerHTML = html;
}

// ФУНКЦИЯ ПОИСКА
function setupSearch() {
    const searchInput = document.getElementById('search-input');
    if (!searchInput) return;
    
    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        filterHabits(searchTerm);
    });
}

function filterHabits(searchTerm) {
    if (!searchTerm) {
        displayHabits(allHabits);
        return;
    }
    
    const filtered = allHabits.filter(habit => 
        habit.name.toLowerCase().includes(searchTerm) ||
        (habit.description && habit.description.toLowerCase().includes(searchTerm))
    );
    
    displayHabits(filtered);
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function setupModal() {
    const modal = document.getElementById('habit-modal');
    const openBtn = document.getElementById('open-modal-btn');
    const closeBtn = document.querySelector('.close-btn');
    const form = document.getElementById('habit-form');
    
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
                    loadStats();
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
            loadStats();
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
            loadStats();
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

async function loadStats() {
    try {
        const response = await fetch('/api/stats');
        if (response.ok) {
            const stats = await response.json();
            displayStats(stats);
        }
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

function displayStats(stats) {
    const statsContainer = document.getElementById('stats-container');
    if (!statsContainer) return;
    
    statsContainer.innerHTML = `
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-value">${stats.total_habits || 0}</div>
                <div class="stat-label">Всего привычек</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${stats.total_streak || 0}</div>
                <div class="stat-label">Всего дней</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${stats.completed_today || 0}</div>
                <div class="stat-label">Выполнено сегодня</div>
            </div>
        </div>
    `;
}

function setupClearAllButton() {
    const clearBtn = document.getElementById('clear-all-btn');
    if (!clearBtn) return;
    
    clearBtn.addEventListener('click', async () => {
        const confirmed = confirm('⚠️ ВНИМАНИЕ! Вы уверены, что хотите удалить ВСЕ привычки?\n\nЭто действие нельзя отменить!');
        
        if (!confirmed) return;
        
        showNotification('🗑️ Удаление всех привычек...', 'info');
        
        try {
            const response = await fetch('/api/habits');
            const habits = await response.json();
            
            if (habits.length === 0) {
                showNotification('✨ Нет привычек для удаления', 'info');
                return;
            }
            
            let deleted = 0;
            for (const habit of habits) {
                const deleteResponse = await fetch(`/api/habits/${habit.id}`, {
                    method: 'DELETE'
                });
                if (deleteResponse.ok) {
                    deleted++;
                }
            }
            
            loadHabits();
            loadStats();
            showNotification(`✅ Удалено ${deleted} привычек`, 'success');
            
        } catch (error) {
            console.error('Error clearing habits:', error);
            showNotification('❌ Ошибка при удалении привычек', 'error');
        }
    });
}

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
