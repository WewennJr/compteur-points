const playerSelect = document.getElementById("player-select");
const startScoreInput = document.getElementById("start-score");
const startGameBtn = document.getElementById("start-game-btn");
const gameArea = document.getElementById("game-area");
const scoreTable = document.getElementById("score-table");
const roundForm = document.getElementById("round-form");
const failuresInputs = document.getElementById("failures-inputs");
const submitRoundBtn = document.getElementById("submit-round-btn");
const newRoundBtn = document.getElementById("new-round-btn");
const messageDiv = document.getElementById("message");
const rankingDiv = document.getElementById("ranking");
const endGameBtn = document.getElementById("end-game-btn");

let activePlayers = [];
let scores = {};
let eliminated = {};

function createScoreTable() {
  scoreTable.innerHTML = "";

  // Header row avec noms joueurs
  const headerRow = document.createElement("tr");
  activePlayers.forEach(player => {
    const th = document.createElement("th");
    th.textContent = player;
    headerRow.appendChild(th);
  });
  scoreTable.appendChild(headerRow);

  // 10 lignes de scores initialisées à 0
  for (let i = 0; i < 10; i++) {
    const tr = document.createElement("tr");
    activePlayers.forEach(player => {
      const td = document.createElement("td");
      td.textContent = scores[player] && scores[player][i] !== undefined ? scores[player][i] : "";
      tr.appendChild(td);
    });
    scoreTable.appendChild(tr);
  }

  // Ligne total des scores
  const totalRow = document.createElement("tr");
  activePlayers.forEach(player => {
    const td = document.createElement("td");
    const total = scores[player] ? scores[player].reduce((a,b) => a+b, 0) : 0;
    td.textContent = total;
    totalRow.appendChild(td);
  });
  scoreTable.appendChild(totalRow);
}

function updateTableAfterRound(failures) {
  activePlayers.forEach(player => {
    if (!scores[player]) scores[player] = [];
    // -1 point par échec
    scores[player].push(-failures[player]);
  });
}

function checkEliminations() {
  activePlayers.forEach(player => {
    const total = scores[player].reduce((a,b) => a+b, 0);
    if (total <= 0 && !eliminated[player]) {
      eliminated[player] = true;
      messageDiv.textContent += `\n${player} est éliminé !`;
    }
  });
}

function checkForWinner() {
  const remaining = activePlayers.filter(p => !eliminated[p]);
  if (remaining.length === 1) {
    rankingDiv.textContent = "Classement final :\n";
    // Les joueurs éliminés en dernier à premier
    const eliminatedOrder = Object.keys(eliminated).reverse();
    eliminatedOrder.forEach((p, i) => {
      rankingDiv.textContent += `${i+2}e: ${p}\n`;
    });
    rankingDiv.textContent += `1er: ${remaining[0]}`;
    return true;
  }
  return false;
}

function startGame() {
  const selectedOptions = Array.from(playerSelect.selectedOptions);
  if (selectedOptions.length === 0) {
    alert("Veuillez sélectionner au moins un joueur.");
    return;
  }

  activePlayers = selectedOptions.map(opt => opt.value);
  const startScore = parseInt(startScoreInput.value, 10);
  if (isNaN(startScore) || startScore <= 0) {
    alert("Veuillez entrer un score de départ valide (> 0).");
    return;
  }

  // Initialiser les scores
  scores = {};
  activePlayers.forEach(player => {
    scores[player] = [startScore];
  });
  eliminated = {};
  messageDiv.textContent = "";
  rankingDiv.textContent = "";

  createScoreTable();

  // Désactiver les entrées de sélection et de score
  playerSelect.disabled = true;
  startScoreInput.disabled = true;
  startGameBtn.disabled = true;

  // Afficher la zone de jeu
  gameArea.style.display = "block";
  roundForm.style.display = "none";

  newRoundBtn.disabled = false;
}

function newRound() {
  roundForm.style.display = "block";
  failuresInputs.innerHTML = "";

  activePlayers.forEach(player => {
    if (!eliminated[player]) {
      const label = document.createElement("label");
      label.textContent = `${player} échecs : `;
      const input = document.createElement("input");
      input.type = "number";
      input.min = 0;
      input.max = 10;
      input.value = 0;
      input.name = player;
      label.appendChild(input);
      failuresInputs.appendChild(label);
      failuresInputs.appendChild(document.createElement("br"));
    }
  });

  newRoundBtn.disabled = true;
}

function submitRound() {
  const inputs = failuresInputs.querySelectorAll("input");
  const failures = {};
  let valid = true;

  inputs.forEach(input => {
    const val = parseInt(input.value, 10);
    if (isNaN(val) || val < 0) {
      valid = false;
    } else {
      failures[input.name] = val;
    }
  });

  if (!valid) {
    alert("Veuillez entrer des nombres valides pour les échecs.");
    return;
  }

  updateTableAfterRound(failures);
  createScoreTable();
  checkEliminations();

  if (checkForWinner()) {
    roundForm.style.display = "none";
    newRoundBtn.disabled = true;
  } else {
    roundForm.style.display = "none";
    newRoundBtn.disabled = false;
  }
}

function endGame() {
  // Réactiver la sélection
  playerSelect.disabled = false;
  startScoreInput.disabled = false;
  startGameBtn.disabled = false;

  // Cacher la zone de jeu
  gameArea.style.display = "none";

  // Réinitialiser variables
  activePlayers = [];
  scores = {};
  eliminated = {};

  // Nettoyer la table, le formulaire et le message
  scoreTable.innerHTML = "";
  failuresInputs.innerHTML = "";
  roundForm.style.display = "none";
  messageDiv.textContent = "";
  rankingDiv.textContent = "";

  // Réactiver bouton nouvelle manche
  newRoundBtn.disabled = false;
}

startGameBtn.addEventListener("click", startGame);
newRoundBtn.addEventListener("click", newRound);
submitRoundBtn.addEventListener("click", submitRound);
endGameBtn.addEventListener("click", endGame);

// Au début, cacher la zone de jeu
gameArea.style.display = "none";
roundForm.style.display = "none";
