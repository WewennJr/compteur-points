const allPlayers = ["Alice", "Bob", "Charlie", "David", "Emma"];
let selectedPlayers = [];
let scores = {};
let history = [];

// Générer les cases à cocher pour la sélection des joueurs
function generatePlayerSelection() {
  const container = document.getElementById("players-list");
  container.innerHTML = "";
  allPlayers.forEach(player => {
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.value = player;
    checkbox.id = `player-${player}`;

    const label = document.createElement("label");
    label.htmlFor = `player-${player}`;
    label.textContent = player;

    container.appendChild(checkbox);
    container.appendChild(label);
    container.appendChild(document.createElement("br"));
  });
}

// Lancer la partie
function startGame() {
  const checkboxes = document.querySelectorAll("#players-list input[type='checkbox']:checked");
  selectedPlayers = Array.from(checkboxes).map(cb => cb.value);

  if (selectedPlayers.length < 2) {
    alert("Sélectionnez au moins 2 joueurs !");
    return;
  }

  const startScore = parseInt(document.getElementById("starting-score").value);
  scores = {};
  history = [];

  selectedPlayers.forEach(p => scores[p] = startScore);
  renderScoreTable();
}

// Afficher la table des scores
function renderScoreTable() {
  const table = document.getElementById("score-table");
  table.innerHTML = "";

  // En-tête
  const headerRow = document.createElement("tr");
  selectedPlayers.forEach(player => {
    const th = document.createElement("th");
    th.textContent = player;
    headerRow.appendChild(th);
  });
  table.appendChild(headerRow);

  // Historique des tours
  history.forEach(turnScores => {
    const row = document.createElement("tr");
    selectedPlayers.forEach(p => {
      const cell = document.createElement("td");
      cell.textContent = turnScores[p];
      row.appendChild(cell);
    });
    table.appendChild(row);
  });

  // Ligne totale
  const totalRow = document.createElement("tr");
  selectedPlayers.forEach(p => {
    const cell = document.createElement("td");
    cell.textContent = scores[p] <= 0 ? "Éliminé" : scores[p];
    totalRow.appendChild(cell);
  });
  table.appendChild(totalRow);
}

// Tour suivant
function nextTurn() {
  if (selectedPlayers.length < 2) {
    alert("Lancez une partie d'abord !");
    return;
  }

  const turnScores = {};
  selectedPlayers.forEach(p => {
    if (scores[p] > 0) {
      const fails = parseInt(prompt(`Combien d'échecs pour ${p} ?`)) || 0;
      scores[p] -= fails;
    }
    turnScores[p] = scores[p];
  });

  history.push(turnScores);
  renderScoreTable();

  // Vérifier si un seul joueur reste en jeu
  const remaining = selectedPlayers.filter(p => scores[p] > 0);
  if (remaining.length === 1) {
    alert(`Partie terminée ! Gagnant : ${remaining[0]}`);
  }
}

// Initialisation
generatePlayerSelection();
