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
    habit = Habit.query.get(habit_id)
    if habit is None:
        return jsonify({'error': 'Habit not found'}), 404
    return jsonify({'id': habit.id, 'name': habit.name})

@app.route('/api/habits/<int:habit_id>', methods=['PUT'])
def update_habit(habit_id):
    habit = Habit.query.get(habit_id)
    if habit is None:
        return jsonify({'error': 'Habit not found'}), 404
    
    data = request.get_json()
    
    if 'name' in data:
        habit.name = data['name']
    if 'description' in data:
        habit.description = data['description']
    
    db.session.commit()
    return jsonify({'id': habit.id, 'name': habit.name, 'description': habit.description})

@app.route('/api/habits/<int:habit_id>', methods=['DELETE'])
def delete_habit(habit_id):
    habit = Habit.query.get(habit_id)
    if habit is None:
        return jsonify({'error': 'Habit not found'}), 404
    
    db.session.delete(habit)
    db.session.commit()
    return jsonify({'message': 'Habit deleted successfully'})

@app.route('/api/habits/<int:habit_id>/complete', methods=['POST'])
def complete_habit(habit_id):
    habit = Habit.query.get(habit_id)
    if habit is None:
        return jsonify({'error': 'Habit not found'}), 404
    
    result = habit.complete()
    db.session.commit()
    
    return jsonify({
        'success': result,
        'streak': habit.streak
    })

@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Resource not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({'error': 'Internal server error'}), 500
