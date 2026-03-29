import pytest
from app.models import Habit
from datetime import date, timedelta

def test_habit_creation():
    """Тест: создание привычки"""
    habit = Habit(name="Test Habit", description="Test Description")
    assert habit.name == "Test Habit"
    assert habit.description == "Test Description"

def test_streak_increment():
    """Тест: увеличение счётчика дней"""
    habit = Habit(name="Test Habit")
    
    # Первое выполнение
    habit.complete()
    assert habit.streak == 1
    
    # Симулируем, что прошёл день
    habit.last_completed = date.today() - timedelta(days=1)
    
    # Второе выполнение
    habit.complete()
    assert habit.streak == 2

def test_complete_method():
    """Тест: метод complete() возвращает True"""
    habit = Habit(name="Test Habit")
    result = habit.complete()
    assert result == True
    assert habit.streak == 1

def test_to_dict():
    """Тест: преобразование в словарь"""
    habit = Habit(name="Test Habit", description="Test", category="health")
    habit_dict = habit.to_dict()
    
    assert habit_dict['name'] == "Test Habit"
    assert habit_dict['description'] == "Test"
    assert habit_dict['category'] == "health"
    assert 'id' in habit_dict
    assert 'created_at' in habit_dict
