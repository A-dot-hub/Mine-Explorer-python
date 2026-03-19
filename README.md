💣 Mine-Explorer (Python + N-Queens)

Mine-Explorer is a unique puzzle game that merges the classic Minesweeper experience with the N-Queens algorithm. Unlike traditional Minesweeper, where bombs are randomly scattered, here the bombs are placed intelligently so that no two bombs share the same row, column, or diagonal. This makes the game both challenging and algorithmically interesting.
 
🧩 Gameplay

The game starts with a grid (default 8×8, but easily customizable). 

Bombs are positioned using the N-Queens problem solution, ensuring a fair but tricky distribution.

Players click on cells to reveal what’s underneath:

✅ Safe cell → Continue exploring.

💥 Bomb cell → Game Over.

The goal is to uncover all safe cells without hitting a bomb.

Once the board is cleared, you win the game 🎉.

🚀 Features

Algorithm-driven bomb placement → N-Queens ensures non-random, puzzle-like positioning.

Frontend: Interactive grid built with HTML, CSS, and JavaScript.

Backend: Flask (Python) to serve the game logic.

Responsive Design → Playable on desktop or mobile.

Win/Lose messages with simple game feedback.

Easy expansion → Add difficulty levels, timers, scoring, or animations.

🛠️ Tech Stack

Python (Flask) – Backend server

HTML5, CSS3, JavaScript – Game UI

N-Queens Algorithm – Bomb placement logic

🎯 Purpose

This project was created as a fun blend of game development and algorithm design, showing how classical computer science problems like N-Queens can be applied to real-world games.

🌐 Deployment

The project is lightweight and can be deployed on:

GitHub Pages (Frontend only, if backend not needed)
