// Joueurs possibles (exemple, à remplacer par ta liste réelle)
const allPlayers = ["Alice", "Bob", "Charlie", "David", "Eve"];

const playerSelect = document.getElementById("player-select");
const startScoreInput = document.getElementById("start-score");
const startGameBtn = document.getElementById("start-game");
const gameArea = document.getElementById("game-area");
const newRoundBtn = document.getElementById("new-round-btn");
const scoreTable = document.getElementById("score-table");

const roundForm = document.getElementById("round-form");
const failuresInputs = document.getElementById("failures-inputs");
const failuresForm = document.getElementById("failures-form");
const cancelRoundBtn = document.getElementById("cancel-round");
const rankingDiv = document.getElementById("ranking");

let activePlayers = [];
let scores = {};
let eliminated = {};

function initPlayerSelect() {
  allPlayers.forEach(p => {
    const option = document.createElement("option");
    option.value = p;
    option.textContent = p;
    playerSelect.appendChild(option);
  });
}

function startGame() {
  const selectedOptions = [...playerSelect.selectedOptions];
  if (selectedOptions.length < 2) {
    alert("Choisissez au moins 2 joueurs.");
    return;
  }
  activePlayers = selectedOptions.map(o => o.value);
  const startScore = parseInt(startScoreInput.value);
  if (isNaN(startScore) || startScore <= 0) {
    alert("Score de départ invalide.");
    return;
  }

  scores = {};
  eliminated = {};
  activePlayers.forEach(p => {
    scores[p] = [startScore];
    eliminated[p] = false;
  });

  playerSelect.disabled = true;
  startScoreInput.disabled = true;
  startGameBtn.disabled = true;

  gameArea.style.display = "block";
  updateScoreTable();
  rankingDiv.textContent = "";
}

function updateScoreTable() {
  // En-tête
  scoreTable.innerHTML = "";
  const thead = document.createElement("thead");
  const headerRow = document.createElement("tr");
  activePlayers.forEach(p => {
    const th = document.createElement("th");
    th.textContent = p + (eliminated[p] ? " (éliminé)" : "");
    headerRow.appendChild(th);
  });
  thead.appendChild(headerRow);
  scoreTable.appendChild(thead);

  // Nombre de manches jouées = longueur des scores de premier joueur
  const roundsCount = scores[activePlayers[0]].length;

  // Corps du tableau
  const tbody = document.createElement("tbody");

  for (let i = 0; i < roundsCount; i++) {
    const row = document.createElement("tr");
    activePlayers.forEach(p => {
      const td = document.createElement("td");
      td.textContent = scores[p][i];
      row.appendChild(td);
    });
    tbody.appendChild(row);
  }

  // Ligne somme
  const sumRow = document.createElement("tr");
  activePlayers.forEach(p => {
    const td = document.createElement("td");
    const total = scores[p].reduce((a, b) => a + b, 0);
    td.textContent = total;
    sumRow.appendChild(td);
  });
  tbody.appendChild(sumRow);

  scoreTable.appendChild(tbody);
}

function newRound() {
  // Afficher le formulaire pour saisir les échecs
  failuresInputs.innerHTML = "";
  activePlayers.forEach(p => {
    if (!eliminated[p]) {
      const label = document.createElement("label");
      label.textContent = `${p} : `;
      const input = document.createElement("input");
      input.type = "number";
      input.min = "0";
      input.value = "0";
      input.name = p;
      input.required = true;
      label.appendChild(input);
      failuresInputs.appendChild(label);
      failuresInputs.appendChild(document.createElement("br"));
    }
  });
  roundForm.style.display = "block";
  newRoundBtn.disabled = true;
}

// Gestion validation du formulaire
failuresForm.addEventListener("submit", e => {
  e.preventDefault();
  const formData = new FormData(failuresForm);
  activePlayers.forEach(p => {
    if (!eliminated[p]) {
      const fails = parseInt(formData.get(p)) || 0;
      const penalty = -fails;
      scores[p].push(penalty);

      const total = scores[p].reduce((a, b) => a + b, 0);
      if (total <= 0 && !eliminated[p]) {
        eliminated[p] = true;
        alert(`${p} est éliminé !`);
      }
    } else {
      // Pour les éliminés on ajoute 0
      scores[p].push(0);
    }
  });
  updateScoreTable();
  roundForm.style.display = "none";
  failuresForm.reset();
  newRoundBtn.disabled = false;
  checkEndGame();
});

cancelRoundBtn.addEventListener("click", () => {
  roundForm.style.display = "none";
  failuresForm.reset();
  newRoundBtn.disabled = false;
});

function checkEndGame() {
  const remaining = activePlayers.filter(p => !eliminated[p]);
  if (remaining.length === 1) {
    const winner = remaining[0];
    rankingDiv.textContent = `Partie terminée ! Le gagnant est ${winner}.`;
    newRoundBtn.disabled = true;
  }
}

// Évènements
startGameBtn.addEventListener("click", startGame);
newRoundBtn.addEventListener("click", newRound);

// Initialisation
initPlayerSelect();
