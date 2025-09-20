class LandExplorerGame {
  constructor() {
    this.board = []
    this.bombs = []
    this.revealed = []
    this.flagged = []
    this.size = 4
    this.gameOver = false
    this.gameWon = false
    this.score = 0
    this.startTime = null
    this.timerInterval = null
    this.playerRow = 0
    this.playerCol = 0
    this.playerPath = []

    this.initializeElements()
    this.bindEvents()
    this.newGame()
  }

  initializeElements() {
    this.gameBoard = document.getElementById("game-board")
    this.levelSelect = document.getElementById("level")
    this.newGameBtn = document.getElementById("new-game-btn")
    this.resetBtn = document.getElementById("reset-btn")
    this.bombCountEl = document.getElementById("bomb-count")
    this.scoreEl = document.getElementById("score")
    this.timerEl = document.getElementById("timer")
    this.statusEl = document.getElementById("game-status")
    this.victoryModal = document.getElementById("victory-modal")
    this.playAgainBtn = document.getElementById("play-again-btn")
    this.finalStepsEl = document.getElementById("final-steps")
    this.finalTimeEl = document.getElementById("final-time")

    this.hamburgerMenu = document.getElementById("hamburger-menu")
    this.navMenu = document.getElementById("nav-menu")
    this.navOverlay = document.getElementById("nav-overlay")
    this.navClose = document.getElementById("nav-close")
    this.aboutLink = document.getElementById("about-link")
    this.contactLink = document.getElementById("contact-link")
    this.newJourneyLink = document.getElementById("new-journey-link")
    this.resetJourneyLink = document.getElementById("reset-journey-link")
  }

  bindEvents() {
    this.newGameBtn.addEventListener("click", () => this.newGame())
    this.resetBtn.addEventListener("click", () => this.resetGame())
    this.levelSelect.addEventListener("change", () => this.newGame())
    this.playAgainBtn.addEventListener("click", () => {
      this.hideVictoryModal()
      this.newGame()
    })

    this.hamburgerMenu.addEventListener("click", () => this.openNavMenu())
    this.navClose.addEventListener("click", () => this.closeNavMenu())
    this.navOverlay.addEventListener("click", () => this.closeNavMenu())

    this.aboutLink.addEventListener("click", (e) => {
      e.preventDefault()
      this.showAboutModal()
      this.closeNavMenu()
    })

    this.contactLink.addEventListener("click", (e) => {
      e.preventDefault()
      this.showContactModal()
      this.closeNavMenu()
    })

    this.newJourneyLink.addEventListener("click", (e) => {
      e.preventDefault()
      this.newGame()
      this.closeNavMenu()
    })

    this.resetJourneyLink.addEventListener("click", (e) => {
      e.preventDefault()
      this.resetGame()
      this.closeNavMenu()
    })

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        this.closeNavMenu()
        this.hideVictoryModal()
      }
      if (e.key === "n" || e.key === "N") {
        this.newGame()
      }
      if (e.key === "r" || e.key === "R") {
        this.resetGame()
      }
    })
  }

  openNavMenu() {
    this.navMenu.classList.add("open")
    this.navOverlay.classList.add("active")
    document.body.style.overflow = "hidden"
  }

  closeNavMenu() {
    this.navMenu.classList.remove("open")
    this.navOverlay.classList.remove("active")
    document.body.style.overflow = ""
  }

  showAboutModal() {
    const aboutContent = `
      <div class="modal-content">
        <h2>About Mine Explorer</h2>
        <p>Mine Explorer is a strategic puzzle game that combines the classic minesweeper mechanics with an adventure theme. Navigate from your village to the treasure castle while avoiding hidden traps!</p>
        <p>This game uses advanced N-Queens algorithms to ensure fair and challenging bomb placement on every level.</p>
        <p>Created with modern web technologies for an optimal gaming experience.</p>
        <button class="btn btn-primary" onclick="this.parentElement.parentElement.remove()">Close</button>
      </div>
    `
    this.showModal(aboutContent)
  }

  showContactModal() {
    const contactContent = `
      <div class="modal-content">
        <h2>Contact Us</h2>
        <p>Have feedback or suggestions? We'd love to hear from you!</p>
        <div style="margin: 20px 0;">
          <p><strong>Email:</strong> abhishekjaiswar224@gmail.com</p>
       
          <p><strong>GitHub:</strong> https://github.com/A-dot-hub</p>
        </div>
        <p>Follow Me for updates and new features!</p>
        <button class="btn btn-primary" onclick="this.parentElement.parentElement.remove()">Close</button>
      </div>
    `
    this.showModal(contactContent)
  }

  showModal(content) {
    const modal = document.createElement("div")
    modal.className = "victory-modal"
    modal.innerHTML = content
    modal.style.zIndex = "1002"
    document.body.appendChild(modal)

    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        modal.remove()
      }
    })
  }

  async newGame() {
    const level = this.levelSelect.value

    try {
      const response = await fetch("/new_game", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ level: level }),
      })

      const data = await response.json()

      this.size = data.size
      this.bombs = data.bombs
      this.bombCountEl.textContent = data.bomb_count

      this.initializeGame()
      this.createBoard()
      this.startTimer()
    } catch (error) {
      console.error("Error starting new game:", error)
      this.statusEl.textContent = "Connection Error"
      this.statusEl.style.color = "#dc2626"
    }
  }

  initializeGame() {
    this.board = Array(this.size)
      .fill()
      .map(() => Array(this.size).fill(0))
    this.revealed = Array(this.size)
      .fill()
      .map(() => Array(this.size).fill(false))
    this.flagged = Array(this.size)
      .fill()
      .map(() => Array(this.size).fill(false))
    this.gameOver = false
    this.gameWon = false
    this.score = 0
    this.scoreEl.textContent = "0"
    this.statusEl.textContent = "Exploring"
    this.statusEl.style.color = "#f8fafc"
    this.playerRow = 0
    this.playerCol = 0
    this.playerPath = [[0, 0]]

    this.calculateAdjacentCounts()
  }

  calculateAdjacentCounts() {
    for (let row = 0; row < this.size; row++) {
      for (let col = 0; col < this.size; col++) {
        if (!this.isBomb(row, col)) {
          let count = 0
          for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
              if (dr === 0 && dc === 0) continue
              const nr = row + dr
              const nc = col + dc
              if (nr >= 0 && nr < this.size && nc >= 0 && nc < this.size) {
                if (this.isBomb(nr, nc)) {
                  count++
                }
              }
            }
          }
          this.board[row][col] = count
        }
      }
    }
  }

  isBomb(row, col) {
    return this.bombs.some((bomb) => bomb[0] === row && bomb[1] === col)
  }

  createBoard() {
    this.gameBoard.innerHTML = ""
    this.gameBoard.style.gridTemplateColumns = "repeat(" + this.size + ", 1fr)"

    for (let row = 0; row < this.size; row++) {
      for (let col = 0; col < this.size; col++) {
        const cell = document.createElement("div")
        cell.className = "cell"
        cell.dataset.row = row
        cell.dataset.col = col

        if (row === 0 && col === 0) {
          cell.classList.add("start-position")
        }
        if (row === this.size - 1 && col === this.size - 1) {
          cell.classList.add("end-position")
        }

        cell.addEventListener("click", (e) => this.handleCellClick(e, row, col))
        cell.addEventListener("contextmenu", (e) => this.handleRightClick(e, row, col))

        this.gameBoard.appendChild(cell)
      }
    }

    this.revealCell(0, 0, false)
    this.updatePlayerPath()
  }

  handleCellClick(e, row, col) {
    e.preventDefault()

    if (this.gameOver || this.gameWon || this.flagged[row][col]) {
      return
    }

    if (!this.isAdjacentToPlayer(row, col) && !this.revealed[row][col]) {
      const cell = this.getCellElement(row, col)
      cell.style.animation = "shake 0.3s ease-in-out"
      setTimeout(() => {
        cell.style.animation = ""
      }, 300)
      return
    }

    this.revealCell(row, col, true)
  }

  isAdjacentToPlayer(row, col) {
    const dr = Math.abs(row - this.playerRow)
    const dc = Math.abs(col - this.playerCol)
    return dr <= 1 && dc <= 1 && !(dr === 0 && dc === 0)
  }

  handleRightClick(e, row, col) {
    e.preventDefault()

    if (this.gameOver || this.gameWon || this.revealed[row][col]) {
      return
    }

    this.toggleFlag(row, col)
  }

  revealCell(row, col, updatePlayer = true) {
    if (this.revealed[row][col] || this.flagged[row][col]) {
      return
    }

    this.revealed[row][col] = true
    const cell = this.getCellElement(row, col)
    cell.classList.add("revealed", "cell-reveal")

    if (this.isBomb(row, col)) {
      this.explodeTrap(row, col)
      this.gameOver = true
      this.endGame(false)
    } else {
      if (updatePlayer) {
        this.playerRow = row
        this.playerCol = col
        this.playerPath.push([row, col])
        if (!(row === 0 && col === 0)) {
          this.score += 1
        }
        this.scoreEl.textContent = this.score
        this.updatePlayerPath()
      }

      const count = this.board[row][col]
      if (count > 0) {
        cell.textContent = count
        cell.classList.add("number-" + count)
      } else {
        cell.classList.add("safe")
      }

      if (row === this.size - 1 && col === this.size - 1) {
        this.gameWon = true
        this.endGame(true)
      }
    }
  }

  updatePlayerPath() {
    document.querySelectorAll(".player-path").forEach((cell) => {
      cell.classList.remove("player-path", "path-glow")
    })

    this.playerPath.forEach(([row, col]) => {
      const cell = this.getCellElement(row, col)
      cell.classList.add("player-path")
    })

    const currentCell = this.getCellElement(this.playerRow, this.playerCol)
    currentCell.classList.add("path-glow")
  }

  toggleFlag(row, col) {
    this.flagged[row][col] = !this.flagged[row][col]
    const cell = this.getCellElement(row, col)

    if (this.flagged[row][col]) {
      cell.classList.add("flagged")
    } else {
      cell.classList.remove("flagged")
    }
  }

  explodeTrap(row, col) {
    const cell = this.getCellElement(row, col)
    cell.classList.add("bomb", "trap-explode")

    setTimeout(() => {
      this.bombs.forEach(([bombRow, bombCol]) => {
        if (bombRow !== row || bombCol !== col) {
          const bombCell = this.getCellElement(bombRow, bombCol)
          bombCell.classList.add("bomb", "revealed")
        }
      })
    }, 400)
  }

  endGame(won) {
    this.stopTimer()

    if (won) {
      this.statusEl.textContent = "Victory!"
      this.statusEl.style.color = "#10b981"
      this.scoreEl.textContent = this.score
      setTimeout(() => this.showVictoryModal(), 1000)
    } else {
      this.statusEl.textContent = "Trapped!"
      this.statusEl.style.color = "#dc2626"
      setTimeout(() => this.showGameOverModal(), 2000)
    }

    this.statusEl.classList.add("pulse-animation")
    setTimeout(() => {
      this.statusEl.classList.remove("pulse-animation")
    }, 3000)
  }

  showGameOverModal() {
    const gameOverContent = `
      <div class="victory-content">
        <h2 style="color: #dc2626;">Game Over!</h2>
        <p>You hit a trap! Better luck next time, explorer.</p>
        <div class="victory-stats">
          <div>Steps: <span>${this.score}</span></div>
          <div>Time: <span>${this.timerEl.textContent}</span></div>
        </div>
        <div style="display: flex; gap: 12px; justify-content: center;">
          <button class="btn btn-primary" onclick="game.newGame(); this.parentElement.parentElement.parentElement.remove()">New Journey</button>
          <button class="btn btn-highlight" onclick="game.resetGame(); this.parentElement.parentElement.parentElement.remove()">Reset Journey</button>
        </div>
      </div>
    `
    this.showModal(gameOverContent)
  }

  showVictoryModal() {
    // console.log(" Victory! Total steps:", this.score)
    this.finalStepsEl.textContent = this.score
    this.finalTimeEl.textContent = this.timerEl.textContent
    this.victoryModal.classList.remove("hidden")
  }

  hideVictoryModal() {
    this.victoryModal.classList.add("hidden")
  }

  resetGame() {
    this.stopTimer()
    this.score = 0
    this.scoreEl.textContent = "0"
    this.statusEl.textContent = "Ready"
    this.statusEl.style.color = "#f8fafc"
    this.timerEl.textContent = "00:00"
    this.gameBoard.innerHTML = ""
    this.hideVictoryModal()
  }

  startTimer() {
    this.startTime = Date.now()
    this.timerInterval = setInterval(() => {
      if (!this.gameOver && !this.gameWon) {
        const elapsed = Math.floor((Date.now() - this.startTime) / 1000)
        const minutes = Math.floor(elapsed / 60)
          .toString()
          .padStart(2, "0")
        const seconds = (elapsed % 60).toString().padStart(2, "0")
        this.timerEl.textContent = minutes + ":" + seconds
      }
    }, 1000)
  }

  stopTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval)
      this.timerInterval = null
    }
  }

  getCellElement(row, col) {
    return this.gameBoard.children[row * this.size + col]
  }
}

const style = document.createElement("style")
style.textContent = `
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-4px); }
    75% { transform: translateX(4px); }
  }
`
document.head.appendChild(style)

let game
document.addEventListener("DOMContentLoaded", () => {
  game = new LandExplorerGame()
})
