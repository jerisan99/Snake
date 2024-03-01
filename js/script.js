// 13.06.2023
//V2
"use strict";
let canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");
let rows = 20;
let cols = 20;
let snake = [
  {
    x: 9,
    y: 3,
  },
];
let walls = [
  {
    x: 0,
    y: 0,
  },
];
let gameOver = false;
let food;
let wallSetting;
let cellWidth = canvas.width / cols;
let cellHeight = canvas.height / rows;
let direction = "";
let foodCollected = false;
let score = 0;
let pause;
let pauseChecker = true;
let difficulty = 1;
let highscores = [];
let fieldSize = 20;
let foodColor = "yellow";
let snakeColor = "green";
let canvasColor = "black";
// for (let i = 0; i < 5; i++) {
//   highscores[i] = 0;
// }
let speed = 200;
let restart = false;

let eatMusic = new Audio("sounds/eating.mp3");
let gameOverMusic = new Audio("sounds/gameOver.mp3");
let musicButton = document.getElementById("musicButton");
let backgroundMusic = new Audio("sounds/background_Gunna1.mp3");
let musicOn = false;

function toggleMusic() {
  if (musicOn) {
    musicButton.innerHTML = '<i class="fa-solid fa-volume-mute"></i>';
    backgroundMusic.pause();
    musicOn = false;
  } else {
    musicButton.innerHTML = '<i class="fa-solid fa-volume-up"></i>';
    backgroundMusic.volume = 1;
    backgroundMusic.play();
    musicOn = true;
  }
}

// Geschwindigkeit wählen
let difficultySelect = document.getElementById("difficulty-select");
difficultySelect.addEventListener("change", () => {
  difficulty = parseInt(difficultySelect.value);
  speed = 125 / difficulty;
  setInterval(gameLoop, speed);
});

let fieldSizeSelect = document.getElementById("fieldSize");
fieldSizeSelect.addEventListener("change", () => {
  cols = fieldSizeSelect.value;
  rows = fieldSizeSelect.value;
  cellWidth = canvas.width / cols;
  cellHeight = canvas.height / rows;
});

let snakeColorSelect = document.getElementById("snakeColor");
snakeColorSelect.addEventListener("change", () => {
  snakeColor = snakeColorSelect.value;
});

let foodColorSelect = document.getElementById("foodColor");
foodColorSelect.addEventListener("change", () => {
  foodColor = foodColorSelect.value;
});

let canvasColorSelect = document.getElementById("canvasColor");
canvasColorSelect.addEventListener("change", () => {
  canvasColor = canvasColorSelect.value;
});

let wallsSelect = document.getElementById("wallSetting");
wallsSelect.addEventListener("change", () => {
  wallSetting = wallsSelect.value;
  if (wallSetting) {
    placeWall();
  } else {
    for (let anzahlWalls = 0; anzahlWalls < 5; anzahlWalls++) {
      walls[anzahlWalls] = {
        x: 0,
        y: 0,
      };
    }
  }
});

let settings = document.getElementById("settings");
let settingsButton = document.getElementById("settingsButton");

settingsButton.addEventListener("click", function () {
  if (settings.classList.contains("settings-closed")) {
    settings.classList.remove("settings-closed");
    settings.classList.add("settings-open");
  } else {
    settings.classList.remove("settings-open");
    settings.classList.add("settings-closed");
  }
});

loadHighscoresFromLocalStorage();
placeFood();
setInterval(gameLoop, speed);
document.addEventListener("keydown", keyDown);
draw();

function gameLoop() {
  if (pause == true) {
    setTimeout();
  }
  if (gameOver != true) {
    testGameOver();
  }
  if (restart) {
    snake = [
      {
        x: 9,
        y: 3,
      },
    ];
    placeFood();
    draw();
    restart = false;
    gameOver = false;
    direction = "";
  }
  if (gameOver) {
    return;
  }
  if (foodCollected) {
    if (musicOn) {
      eatMusic.play();
    }
    snake = [
      {
        x: snake[0].x,
        y: snake[0].y,
      },
      ...snake,
    ];
    score++;
    if (score > 0) {
      document.querySelector("#score").textContent = "Score: " + score;
      foodCollected = false;
    }
  }
  shiftSnake();
  if (direction == "LEFT") {
    snake[0].x--;
  }
  if (direction == "RIGHT") {
    snake[0].x++;
  }
  if (direction == "UP") {
    snake[0].y--;
  }
  if (direction == "DOWN") {
    snake[0].y++;
  }
  if (snake[0].x == food.x && snake[0].y == food.y) {
    foodCollected = true;
    placeWall();
    placeFood();
  }
}

function drawHighscoreTable() {
  for (let i = 0; i < highscores.length; i++) {
    if (highscores[i] > 0) {
      document.querySelector("#s" + (i + 1)).textContent = highscores[i];
    } else {
      document.querySelector("#s" + (i + 1)).textContent = "";
    }
  }
}

function updateHighscoreTable() {
  highscores.push(score);
  highscores.sort((a, b) => b - a);
  highscores = highscores.slice(0, 5);
  drawHighscoreTable(); // Aktualisiert die Highscore-Tabelle
  // Speichern der Highscores im Local Storage
  localStorage.setItem("highscores", JSON.stringify(highscores));
}

function loadHighscoresFromLocalStorage() {
  const highscoresData = localStorage.getItem("highscores");
  if (highscoresData) {
    highscores = JSON.parse(highscoresData);
    drawHighscoreTable(); // Aktualisiert die Highscore-Tabelle beim Laden der Seite
  }
}

function draw() {
  ctx.fillStyle = canvasColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = "gray";
  for (let i = 0; i < cols; i++) {
    ctx.beginPath();
    ctx.moveTo(i * cellWidth, 0);
    ctx.lineTo(i * cellWidth, canvas.height);
    ctx.stroke();
  }
  for (let j = 0; j < rows; j++) {
    ctx.beginPath();
    ctx.moveTo(0, j * cellHeight);
    ctx.lineTo(canvas.width, j * cellHeight);
    ctx.stroke();
  }

  ctx.fillStyle = snakeColor;
  snake.forEach((part, index) => {
    if (index === 0) {
      ctx.fillStyle = "teal"; // Hier kannst du die gewünschte Farbe für den Kopf der Schlange angeben
    } else {
      ctx.fillStyle = snakeColor;
    }
    add(part.x, part.y);
  });

  ctx.fillStyle = foodColor;
  add(food.x, food.y); // Food
  if (wallSetting) {
    ctx.fillStyle = "white";
    for (let anzahlWalls = 0; anzahlWalls < 5; anzahlWalls++) {
      add(walls[anzahlWalls].x, walls[anzahlWalls].y);
    }
  }
  requestAnimationFrame(draw);
}

function testGameOver() {
  let wallCrash = false;
  let firstPart = snake[0];
  let otherParts = snake.slice(1);
  let duplicatePart = otherParts.find(
    (part) => part.x == firstPart.x && part.y == firstPart.y
  );

  if (wallSetting) {
    for (let anzahlWalls = 0; anzahlWalls < 5; anzahlWalls++) {
      if (
        snake[0].x == walls[anzahlWalls].x &&
        snake[0].y == walls[anzahlWalls].y
      ) {
        wallCrash = true;
      }
    }
  }
  if (
    snake[0].x < 0 ||
    snake[0].x > cols - 1 ||
    snake[0].y < 0 ||
    snake[0].y > rows - 1 ||
    duplicatePart ||
    wallCrash
  ) {
    gameOver = true;
    if (musicOn) {
      backgroundMusic.pause();
      gameOverMusic.play();
    }
    updateHighscoreTable();
  }
}

function placeFood() {
  let randomX = Math.floor(Math.random() * cols);
  let randomY = Math.floor(Math.random() * rows);
  food = {
    x: randomX,
    y: randomY,
  };
}

function placeWall() {
  let randomX;
  let randomY;
  let wallPosition = Math.floor(Math.random() * 4);
console.log(wallPosition);
  while (true) {
    randomX = Math.floor(Math.random() * cols);
    randomY = Math.floor(Math.random() * rows);
    if (
      randomX != food.x &&
      randomY != food.y &&
      randomX != snake.x &&
      randomY != snake.y
    ) {
      walls[0] = {
        x: randomX,
        y: randomY,
      };
      break;
    }
  }

  switch (wallPosition) {
    case 0:
      for (let anzahlWalls = 0; anzahlWalls < 5; anzahlWalls++) {
        walls[anzahlWalls] = {
          x: randomX++,
          y: randomY--,
        };
      }
      break;

    case 1:
      for (let anzahlWalls = 0; anzahlWalls < 5; anzahlWalls++) {
        walls[anzahlWalls] = {
          x: randomX--,
          y: randomY--,
        };
      }
      break;
    case 2:
      for (let anzahlWalls = 0; anzahlWalls < 5; anzahlWalls++) {
        walls[anzahlWalls] = {
          x: randomX,
          y: randomY++,
        };
      }
      break;

      case 3:
        for (let anzahlWalls = 0; anzahlWalls < 5; anzahlWalls++) {
          walls[anzahlWalls] = {
            x: randomX++,
            y: randomY,
          };
        }
        break;
    default:
      break;
  }
}

function add(x, y) {
  ctx.fillRect(x * cellWidth, y * cellHeight, cellWidth - 1, cellHeight - 1);
}

//Verlängert Snake
function shiftSnake() {
  for (let i = snake.length - 1; i > 0; i--) {
    const part = snake[i];
    const lastPart = snake[i - 1];
    part.x = lastPart.x;
    part.y = lastPart.y;
  }
}

function moveSnake(btnDirection) {
  if (btnDirection == "LEFT") {
    if (direction !== "RIGHT") {
      direction = btnDirection;
    }
  } else if (btnDirection == "RIGHT") {
    if (direction !== "LEFT") {
      direction = btnDirection;
    }
  } else if (btnDirection == "UP") {
    if (direction !== "DOWN") {
      direction = btnDirection;
    }
  } else if (btnDirection == "DOWN") {
    if (direction !== "UP") {
      direction = btnDirection;
    }
  }
}

//Überprüft Pause button
function pauseSnake(btnPause) {
  if (pauseChecker == btnPause) {
    pauseChecker = false;
    pause = true;
  } else {
    pauseChecker = true;
    pause = false;
  }
}
function scoreDelete(index) {
  score = 0;
  loadHighscoresFromLocalStorage();
  highscores.splice(index, 1);
  highscores.sort((a, b) => b - a);
  highscores = highscores.slice(0, 5);
  localStorage.setItem("highscores", JSON.stringify(highscores));
  drawHighscoreTable(); // Aktualisiert die Highscore-Tabelle
}

function keyDown(e) {
  if (e.keyCode == 37 && direction !== "RIGHT") {
    direction = "LEFT";
  } else if (e.keyCode == 38 && direction !== "DOWN") {
    direction = "UP";
  } else if (e.keyCode == 39 && direction !== "LEFT") {
    direction = "RIGHT";
  } else if (e.keyCode == 40 && direction !== "UP") {
    direction = "DOWN";
  } else if (e.keyCode == 76) {
    if (musicOn) {
      gameOverMusic.pause();
      backgroundMusic.play();
    }
    score = 0;
    updateHighscoreTable();
    document.querySelector("#score").textContent = "Score: " + score;
    restart = true; 
    if (wallSetting) {
      placeWall();
    }
  } else if (e.keyCode == 84) {
    if (pause == true) {
      pause = false;
    } else {
      pause = true;
    }
  }
}