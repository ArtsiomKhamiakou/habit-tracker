import pytest
from app.models import Habit

def test_habit_creation():
    habit = Habit(name="Test Habit")
    assert habit.name == "Test Habit"
