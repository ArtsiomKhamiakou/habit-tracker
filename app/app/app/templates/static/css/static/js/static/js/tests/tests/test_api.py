import pytest
from app import app
from app.models import db, Habit

@pytest.fixture
def client():
    """Тестовый клиент Flask"""
    app.config['TESTING'] = True
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
    
    with app.test_client() as client:
        with app.app_context():
            db.create_all()
            yield client
            db.drop_all()

def test_get_habits_empty(client):
    """Тест: получение пустого списка привычек"""
    response = client.get('/api/habits')
    assert response.status_code == 200
    assert response.json == []

def test_create_habit(client):
    """Тест: создание привычки"""
    response = client.post('/api/habits', 
                          json={'name': 'Read books', 'description': 'Every day'})
    assert response.status_code == 201
    assert 'id' in response.json

def test_get_single_habit(client):
    """Тест: получение одной привычки"""
    # Сначала создаём
    create_response = client.post('/api/habits', json={'name': 'Exercise'})
    habit_id = create_response.json['id']
    
    # Потом получаем
    get_response = client.get(f'/api/habits/{habit_id}')
    assert get_response.status_code == 200
    assert get_response.json['name'] == 'Exercise'

def test_update_habit(client):
    """Тест: обновление привычки"""
    create_response = client.post('/api/habits', json={'name': 'Old name'})
    habit_id = create_response.json['id']
    
    update_response = client.put(f'/api/habits/{habit_id}', 
                                 json={'name': 'New name'})
    assert update_response.status_code == 200
    assert update_response.json['name'] == 'New name'

def test_delete_habit(client):
    """Тест: удаление привычки"""
    create_response = client.post('/api/habits', json={'name': 'To delete'})
    habit_id = create_response.json['id']
    
    delete_response = client.delete(f'/api/habits/{habit_id}')
    assert delete_response.status_code == 200
    
    # Проверяем, что привычка удалена
    get_response = client.get(f'/api/habits/{habit_id}')
    assert get_response.status_code == 404
