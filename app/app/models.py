class Habit(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    category = db.Column(db.String(50), default='general')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    streak = db.Column(db.Integer, default=0)
    
    def complete(self):
        """Отметить привычку как выполненную"""
        from datetime import date
        today = date.today()
        self.streak += 1
        return True
    
    def to_dict(self):
        """Преобразует модель в словарь для API"""
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'category': self.category,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'streak': self.streak
        }
