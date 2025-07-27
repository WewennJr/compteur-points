// tarot-africain.js

// Variables globales
let players = [];
let scores = {};
let eliminated = {};
let startScore = 10;
let gameStarted = false;

// Références DOM
const setupDiv = document.getElementById("setup");
const gameArea = document.getElementById("game-area");
const playerSelect = document.getElementById("player-select");
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

// Démarrer la partie
startGameBtn.addEventListener("click", () => {
  // Récupérer joueurs sélectionnés
  players = Array.from(playerSelect.selectedOptions).map(opt => opt.value);
  if (players.length < 2) {
    alert("Veuillez sélectionner au moins 2 joueurs.");
    return;
  }
  startScore = parseInt(startScoreInput.value);
  if (isNaN(startScore) || startScore <= 0) {
    alert("Score de départ invalide.");
    return;
  }
  initGame();
});

// Initialisation de la partie
function initGame() {
  // Initialiser scores et état
  scores = {};
  eliminated = {};
  players.forEach(p => {
    scores[p] = [startScore]; // tableau des scores par manche
    eliminated[p] = false;
  });

  // Afficher / cacher les zones
  setupDiv.style.display = "none";
  gameArea.style.display = "block";
  messageDiv.textContent = "";
  rankingDiv.textContent = "";
  newRoundBtn.disabled = false;
  roundForm.style.display = "none";

  renderScoreTable();

  gameStarted = true;
}

// Affichage tableau scores
function renderScoreTable() {
  // En-tête
  let html = "<thead><tr><th>Manche</th>";
  players.forEach(p => {
    html += `<th>${p}</th>`;
  });
  html += "</tr></thead><tbody>";

  // Nombre de manches = longueur des tableaux score (ils sont tous égaux)
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

  // Ligne total (somme des scores actuels)
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

  // Afficher le formulaire de saisie des échecs pour chaque joueur pas éliminé
  failuresInputsDiv.innerHTML = "";
  players.forEach(p => {
    if (!eliminated[p]) {
      failuresInputsDiv.innerHTML += `
        <label>${p} nombre d'échecs :
          <input type="number" min="0" max="${scores[p][scores[p].length - 1]}" value="0" name="fail-${p}" />
        </label><br />`;
    }
  });
  roundForm.style.display = "block";
  newRoundBtn.disabled = true;
  messageDiv.textContent = "Saisissez le nombre d'échecs pour chaque joueur puis validez la manche.";
  submitRoundBtn.disabled = false;
});

// Valider la manche
submitRoundBtn.addEventListener("click", () => {
  // Lire les échecs et calculer nouveaux scores
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

  // Mise à jour scores et état élimination
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

  // Vérifier fin de partie (1 seul joueur non éliminé)
  const alivePlayers = players.filter(p => !eliminated[p]);
  if (alivePlayers.length === 1) {
    // Afficher classement
    gameStarted = false;
    newRoundBtn.disabled = true;
    messageDiv.textContent = "La partie est terminée !";
    showRanking();
  }
});

// Afficher classement final
function showRanking() {
  // Trier joueurs par score final décroissant
  const ranking = [...players].sort((a, b) => scores[b][scores[b].length - 1] - scores[a][scores[a].length - 1]);
  let text = "Classement final :\n";
  ranking.forEach((p, i) => {
    text += `${i + 1}. ${p} - ${scores[p][scores[p].length - 1]} points\n`;
  });
  rankingDiv.textContent = text;
}

// Bouton Finir la partie
endGameBtn.addEventListener("click", () => {
  resetGame();
});

// Fonction reset complète
function resetGame() {
  players = [];
  scores = {};
  eliminated = {};
  gameStarted = false;
  messageDiv.textContent = "";
  rankingDiv.textContent = "";
  failuresInputsDiv.innerHTML = "";
  roundForm.style.display = "none";
  newRoundBtn.disabled = true;
  scoreTable.innerHTML = "";

  // Montrer zone setup, cacher jeu
  setupDiv.style.display = "block";
  gameArea.style.display = "none";

  // Déselectionner joueurs
  Array.from(playerSelect.options).forEach(opt => (opt.selected = false));

  // Remettre valeur start score à 10 par défaut
  startScoreInput.value = 10;
}
