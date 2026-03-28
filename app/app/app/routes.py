from app import app
from app.models import db, Habit
from flask import jsonify, request

@app.route('/api/habits', methods=['GET'])
def get_habits():
    habits = Habit.query.all()
    return jsonify([{'id': h.id, 'name': h.name} for h in habits])

@app.route('/api/habits', methods=['POST'])
def create_habit():
    data = request.get_json()
    habit = Habit(name=data['name'], description=data.get('description', ''))
    db.session.add(habit)
    db.session.commit()
    return jsonify({'id': habit.id}), 201

@app.route('/api/habits/<int:habit_id>', methods=['GET'])
def get_habit(habit_id):
    """Получить одну привычку по ID"""
    habit = Habit.query.get(habit_id)
    if habit is None:
        return jsonify({'error': 'Habit not found'}), 404
    return jsonify(habit.to_dict())
