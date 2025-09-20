from flask import Flask, render_template, jsonify, request
import random

app = Flask(__name__)

class NQueensBombPlacer:
    def __init__(self, size):
        self.size = size
        self.board = []
        self.bombs = []
    
    def is_safe(self, row, col, placed_bombs):
        for bomb_row, bomb_col in placed_bombs:
            if bomb_row == row or bomb_col == col:
                return False
            if abs(bomb_row - row) == abs(bomb_col - col):
                return False
        return True
    
    def place_bombs_backtrack(self, row, placed_bombs, target_bombs):
        if len(placed_bombs) == target_bombs:
            return True
        
        if row >= self.size:
            return False
        
        for col in range(self.size):
            if self.is_safe(row, col, placed_bombs):
                placed_bombs.append((row, col))
                if self.place_bombs_backtrack(row + 1, placed_bombs, target_bombs):
                    return True
                placed_bombs.pop()
        
        return self.place_bombs_backtrack(row + 1, placed_bombs, target_bombs)
    
    def generate_bomb_positions(self):
        bomb_count_map = {
            4: 3,   # 4x4 grid: 3 bombs
            5: 4,   # 5x5 grid: 4 bombs  
            6: 5,   # 6x6 grid: 5 bombs
            10: 8   # 10x10 grid: 8 bombs
        }
        target_bombs = bomb_count_map.get(self.size, max(2, self.size // 2))
        placed_bombs = []
        
        positions = [(r, c) for r in range(self.size) for c in range(self.size)]
        positions.remove((0, 0))
        positions.remove((self.size - 1, self.size - 1))
        
        random.shuffle(positions)
        self.bombs = positions[:target_bombs]
        
        return self.bombs

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/new_game', methods=['POST'])
def new_game():
    data = request.json
    level = data.get('level', 'beginner')
    
    size_map = {
        'beginner': 4,
        'intermediate': 5,
        'advanced': 6,
        'expert': 10
    }
    
    size = size_map.get(level, 4)
    
    bomb_placer = NQueensBombPlacer(size)
    bombs = bomb_placer.generate_bomb_positions()
    
    return jsonify({
        'size': size,
        'bombs': bombs,
        'bomb_count': len(bombs)
    })

if __name__ == '__main__':
    app.run(debug=True)
