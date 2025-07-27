// tarot-africain.js

let players = [];         // joueurs sélectionnés pour la partie
let scores = {};          // historique des scores par joueur
let eliminated = {};      // état éliminé ou non
let startScore = 10;      // score de départ par défaut
let gameStarted = false;

// DOM elements
const setupDiv = document.getElementById("setup");
const gameArea = document.getElementById("game-area");
const playerSelect = document.getElementById("player-select"); // toujours visible
const startScoreInput = document.getElementById("start-score");
const startGameBtn = document.getElementById("start-game-btn");
const scoreTable = document.getElementById("score-table");
const messageDiv = document.getElementById("message");
const newRoundBtn = document.getElementById("new-round-btn");
const roundForm = document.getElementById("round-form");
const failuresInputsDiv = document.getElementById("failures-inputs");
const submitRoundBtn = document.getElementById("submit-round-btn");
const endGameBtn = document.getElementById("end-game-btn");
const rankingDiv = document.getElementById("ranking");

// Fonction pour démarrer une partie
startGameBtn.addEventListener("click", () => {
  // Récupérer joueurs sélectionnés
  const selected = Array.from(playerSelect.querySelectorAll("input[type='checkbox']:checked"))
    .map(input => input.value);

  if (selected.length < 2) {
    alert("Veuillez sélectionner au moins 2 joueurs.");
    return;
  }
  players = selected;

  startScore = parseInt(startScoreInput.value);
  if (isNaN(startScore) || startScore <= 0) {
    alert("Score de départ invalide.");
    return;
  }

  initGame();
});

// Initialisation de la partie
function initGame() {
  scores = {};
  eliminated = {};

  players.forEach(p => {
    scores[p] = [startScore]; 
    eliminated[p] = false;
  });

  gameStarted = true;
  rankingDiv.textContent = "";
  messageDiv.textContent = "";
  newRoundBtn.disabled = false;
  roundForm.style.display = "none";

  renderScoreTable();
}

// Générer le tableau des scores
function renderScoreTable() {
  let html = "<thead><tr><th>Manche</th>";
  players.forEach(p => {
    html += `<th>${p}</th>`;
  });
  html += "</tr></thead><tbody>";

  const rounds = scores[players[0]].length;

  for (let i = 0; i < rounds; i++) {
    html += `<tr><td>${i + 1}</td>`;
    players.forEach(p => {
      let val = scores[p][i];
      if (eliminated[p] && i === rounds - 1) {
        val += " (éliminé)";
      }
      html += `<td>${val}</td>`;
    });
    html += "</tr>";
  }

  // Ligne total
  html += "<tr><td><strong>Total</strong></td>";
  players.forEach(p => {
    const total = scores[p][scores[p].length - 1];
    html += `<td><strong>${total}</strong></td>`;
  });
  html += "</tr></tbody>";

  scoreTable.innerHTML = html;
}

// Bouton nouvelle manche
newRoundBtn.addEventListener("click", () => {
  if (!gameStarted) return;

  failuresInputsDiv.innerHTML = "";
  players.forEach(p => {
    if (!eliminated[p]) {
      failuresInputsDiv.innerHTML += `
        <label>${p} - nombre d'échecs :
          <input type="number" min="0" max="${scores[p][scores[p].length - 1]}" value="0" name="fail-${p}" />
        </label><br />`;
    }
  });

  roundForm.style.display = "block";
  newRoundBtn.disabled = true;
  messageDiv.textContent = "Saisis le nombre d'échecs pour chaque joueur et valide la manche.";
  submitRoundBtn.disabled = false;
});

// Valider la manche
submitRoundBtn.addEventListener("click", () => {
  let hasError = false;
  const newScores = {};

  players.forEach(p => {
    if (!eliminated[p]) {
      const input = roundForm.querySelector(`input[name="fail-${p}"]`);
      if (!input) return;
      const fails = parseInt(input.value);
      if (isNaN(fails) || fails < 0 || fails > scores[p][scores[p].length - 1]) {
        alert(`Nombre d'échecs invalide pour ${p}.`);
        hasError = true;
      } else {
        newScores[p] = scores[p][scores[p].length - 1] - fails;
      }
    } else {
      newScores[p] = scores[p][scores[p].length - 1];
    }
  });

  if (hasError) return;

  players.forEach(p => {
    scores[p].push(newScores[p]);
    if (newScores[p] <= 0) {
      eliminated[p] = true;
    }
  });

  roundForm.style.display = "none";
  newRoundBtn.disabled = false;
  messageDiv.textContent = "";
  renderScoreTable();

  const alivePlayers = players.filter(p => !eliminated[p]);
  if (alivePlayers.length === 1) {
    gameStarted = false;
    newRoundBtn.disabled = true;
    messageDiv.textContent = "La partie est terminée !";
    showRanking();
  }
});

// Classement final
function showRanking() {
  const ranking = [...players].sort(
    (a, b) => scores[b][scores[b].length - 1] - scores[a][scores[a].length - 1]
  );
  let text = "Classement final :\n";
  ranking.forEach((p, i) => {
    text += `${i + 1}. ${p} - ${scores[p][scores[p].length - 1]} points\n`;
  });
  rankingDiv.textContent = text;
}

// Finir la partie et reset complet
endGameBtn.addEventListener("click", resetGame);

function resetGame() {
  players = [];
  scores = {};
  eliminated = {};
  gameStarted = false;
  rankingDiv.textContent = "";
  messageDiv.textContent = "";
  failuresInputsDiv.innerHTML = "";
  roundForm.style.display = "none";
  newRoundBtn.disabled = true;
  scoreTable.innerHTML = "";

  // NE PAS toucher à la liste de joueurs, on la laisse cochable
  startScoreInput.value = 10;
}
