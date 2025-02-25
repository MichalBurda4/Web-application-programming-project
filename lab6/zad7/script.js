let score = 0;
let lives = 3;
let nickname = "";
let isGameOver = false;
const JSON_URL = "https://jsonblob.com/api/jsonBlob/1308922369691279360";

const nicknameScreen = document.getElementById("nickname-screen");
const gameScreen = document.getElementById("game-screen");
const nicknameInput = document.getElementById("nickname-input");
const startGameButton = document.getElementById("start-game-button");
const board = document.querySelector('.board');
const scoreDisplay = document.getElementById('score');
const playerName = document.getElementById('player-name');
const livesContainer = document.getElementById("lives-container");
const customCursor = document.querySelector('.custom-cursor');
const body = document.body;

// Rozpoczęcie gry
startGameButton.addEventListener("click", async () => {
    const input = nicknameInput.value.trim();
    if (input) {
        nickname = input;
        startGame();
    } else {
        alert("Podaj swój nick, aby rozpocząć grę.");
    }
});

//Start Gry
function startGame() {
    score = 0;
    lives = 3;
    isGameOver = false;
    scoreDisplay.textContent = score;
    initializeLives();
    clearZombies();
    playerName.textContent = `Gracz: ${nickname}`;
    nicknameScreen.classList.add("hidden");
    gameScreen.classList.remove("hidden");
    enableCustomCursor();
}


// Funkcja usuwająca wszystkie zombie z planszy
function clearZombies() {
    const zombies = document.querySelectorAll(".zombie");
    zombies.forEach((zombie) => zombie.remove());
}

// Funkcja kończąca grę
async function endGame() {
    isGameOver = true;
    const highscores = await updateHighscores(nickname, score);
    displayHighscores(highscores);
    disableCustomCursor();
}

// Funkcja dodająca zombie
function createZombie() {
    if (isGameOver) return;

    const zombie = document.createElement('div'); // Tworzymy div zamiast img
    zombie.classList.add('zombie');

    const randomHeight = Math.floor(Math.random() * (120 - 20 + 1)) + 20;
    zombie.style.bottom = `${randomHeight}px`;

    zombie.style.left = '100%';
    const speed = Math.random() * 4 + 1;
    zombie.dataset.speed = speed;

    const randomScale = Math.random() * 0.5 + 0.5;
    zombie.style.transform = `scale(${randomScale})`;

    board.appendChild(zombie);
    moveZombie(zombie);
}

// Funkcja poruszająca zombie
function moveZombie(zombie) {
    const moveInterval = setInterval(() => {
        if (isGameOver) {
            clearInterval(moveInterval);
            return;
        }

        const currentLeft = parseFloat(getComputedStyle(zombie).left);
        if (currentLeft < -200) {
            zombie.remove();
            clearInterval(moveInterval);
            loseLife();
        } else {
            zombie.style.left = `${currentLeft - zombie.dataset.speed}px`;
        }
    }, 50);
}
// Funkcja inicjalizująca serca
function initializeLives() {
    livesContainer.innerHTML = ""; // Wyczyść poprzednie serca
    for (let i = 0; i < lives; i++) {
        const heart = document.createElement("img");
        heart.src = "img/serce.png"; // Ścieżka do obrazu serca
        heart.alt = "Serce";
        livesContainer.appendChild(heart);
    }
}

// Funkcja do utraty życia
function loseLife() {
    lives--;
    updateLivesDisplay();

    if (lives <= 0) {
        endGame();
    }
}

// Funkcja do aktualizacji wyświetlania żyć
function updateLivesDisplay() {
    livesContainer.innerHTML = "";
    for (let i = 0; i < lives; i++) {
        const heart = document.createElement("img");
        heart.src = "img/serce.png";
        heart.alt = "Serce";
        livesContainer.appendChild(heart);
    }
}

// Funkcja strzelania
board.addEventListener('click', (e) => {
    if (isGameOver) return;

    const bullet = document.createElement('div');
    bullet.classList.add('bullet');
    bullet.style.left = `${e.clientX}px`;
    bullet.style.top = `${e.clientY}px`;
    board.appendChild(bullet);
    setTimeout(() => bullet.remove(), 500);

    let hitZombie = null;
    const zombies = Array.from(document.querySelectorAll('.zombie'));

    zombies.forEach((zombie) => {
        const zombieRect = zombie.getBoundingClientRect();
        const bulletRect = bullet.getBoundingClientRect();

        if (
            bulletRect.left < zombieRect.right &&
            bulletRect.right > zombieRect.left &&
            bulletRect.top < zombieRect.bottom &&
            bulletRect.bottom > zombieRect.top
        ) {
            hitZombie = zombie;
        }
    });

    if (hitZombie) {
        hitZombie.remove();
        score += 12;
    } else {
        score -= 6;
    }

    scoreDisplay.textContent = score;
});




// Wyświetlenie rankingu
function displayHighscores(highscores) {
    const rankingPanel = document.createElement("div");
    rankingPanel.classList.add("ranking-panel");
    rankingPanel.innerHTML = `
        <h2>Ranking:</h2>
        <ol>
            ${highscores.map(hs => `<li>${hs.nick} - ${hs.score} pkt (${hs.date})</li>`).join("")}
        </ol>
        <button id="restart-button">Rozpocznij ponownie</button>
        <button id="exit-button">Wyjdź z gry</button>
    `;
    document.body.appendChild(rankingPanel);

    document.getElementById("restart-button").addEventListener("click", () => {
        rankingPanel.remove();
        startGame();
    });

    document.getElementById("exit-button").addEventListener("click", () => {
        rankingPanel.remove();
        gameScreen.classList.add("hidden");
        nicknameScreen.classList.remove("hidden");
        nicknameInput.value = "";
    });
}

// Pobieranie wyników z serwera
async function fetchHighscores() {
    try {
        const response = await fetch(JSON_URL);
        return response.ok ? await response.json() : [];
    } catch {
        return [];
    }
}

// Zapis wyników na serwerze
async function saveHighscores(highscores) {
    await fetch(JSON_URL, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(highscores)
    });
}

// Aktualizacja wyników
async function updateHighscores(nick, score) {
    const date = new Date().toISOString().split("T")[0];
    const highscores = await fetchHighscores();

    const existingPlayer = highscores.find(hs => hs.nick === nick);

    if (existingPlayer) {
        if (score > existingPlayer.score) {
            existingPlayer.score = score;
            existingPlayer.date = date;
        }
    } else {
        highscores.push({ nick, score, date });
    }

    highscores.sort((a, b) => b.score - a.score);
    const topHighscores = highscores.slice(0, 7);
    await saveHighscores(topHighscores);
    return topHighscores;
}

// Funkcja włączająca niestandardowy kursor (podczas gry)
function enableCustomCursor() {
    body.classList.add('game-active');
    document.addEventListener('mousemove', moveCustomCursor);
}

// Funkcja wyłączająca niestandardowy kursor (poza grą)
function disableCustomCursor() {
    body.classList.remove('game-active'); // Usuń klasę
    document.removeEventListener('mousemove', moveCustomCursor);
}

// Funkcja poruszania kursorem
function moveCustomCursor(e) {
    customCursor.style.left = `${e.clientX}px`;
    customCursor.style.top = `${e.clientY}px`;
}

// Dodawanie zombie co 2 sekundy
setInterval(createZombie, 2000);
