// --- VARIABLES GLOBALES ---
let allPlayers = [];
let activePlayers = [];
let scores = {};
let eliminated = {};
let roundPending = false;

// --- Récupérer la liste globale des joueurs ---
function loadAllPlayers() {
  const saved = localStorage.getItem("players");
  return saved ? JSON.parse(saved) : ["Alice", "Bob", "Charlie", "David"];
}

// --- Afficher la sélection des joueurs ---
function showPlayerSelection() {
  const container = document.getElementById("player-selection");
  container.innerHTML = "";
  allPlayers.forEach(name => {
    const label = document.createElement("label");
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.value = name;
    label.appendChild(checkbox);
    label.appendChild(document.createTextNode(" " + name));
    container.appendChild(label);
    container.appendChild(document.createElement("br"));
  });
}

// --- Démarrer la partie ---
function startGame() {
  const checkboxes = document.querySelectorAll("#player-selection input:checked");
  activePlayers = Array.from(checkboxes).map(c => c.value);

  if (activePlayers.length < 2) {
    alert("Sélectionne au moins 2 joueurs !");
    return;
  }

  const startScore = parseInt(document.getElementById("start-score").value) || 20;

  scores = {};
  eliminated = {};
  activePlayers.forEach(p => {
    scores[p] = [startScore];
    eliminated[p] = false;
  });

  updateScoreTable();

  document.getElementById("setup").style.display = "none";
  document.getElementById("game").style.display = "block";

  // On affiche le bouton pour la première manche
  document.getElementById("new-round").style.display = "inline-block";
}

// --- Mettre à jour le tableau des scores ---
function updateScoreTable() {
  const table = document.getElementById("score-table");
  table.innerHTML = "";

  const headerRow = document.createElement("tr");
  headerRow.appendChild(document.createElement("th"));
  activePlayers.forEach(p => {
    const th = document.createElement("th");
    th.textContent = p + (eliminated[p] ? " (Éliminé)" : "");
    if (eliminated[p]) th.classList.add("eliminated");
    headerRow.appendChild(th);
  });
  table.appendChild(headerRow);

  const maxRounds = Math.max(...Object.values(scores).map(s => s.length));

  for (let r = 0; r < maxRounds; r++) {
    const row = document.createElement("tr");
    const roundCell = document.createElement("td");
    roundCell.textContent = r === 0 ? "Départ" : "Manche " + r;
    row.appendChild(roundCell);

    activePlayers.forEach(p => {
      const td = document.createElement("td");
      td.textContent = scores[p][r] !== undefined ? scores[p][r] : "";
      if (eliminated[p]) td.classList.add("eliminated");
      row.appendChild(td);
    });

    table.appendChild(row);
  }

  const totalRow = document.createElement("tr");
  const totalLabel = document.createElement("td");
  totalLabel.textContent = "Total";
  totalRow.appendChild(totalLabel);

  activePlayers.forEach(p => {
    const td = document.createElement("td");
    const total = scores[p].reduce((a, b) => a + b, 0);
    td.textContent = total;
    if (eliminated[p]) td.classList.add("eliminated");
    totalRow.appendChild(td);
  });

  table.appendChild(totalRow);
}

// --- Créer le formulaire de nouvelle manche ---
function showRoundForm() {
  const form = document.getElementById("round-inputs");
  form.innerHTML = "";

  activePlayers.forEach(p => {
    if (!eliminated[p]) {
      const label = document.createElement("label");
      label.innerHTML = `
        <span style="display:inline-block;width:100px;text-align:right;">${p} :</span>
        <input type="number" min="0" value="0" name="${p}">
      `;
      form.appendChild(label);
      form.appendChild(document.createElement("br"));
    }
  });

  document.getElementById("round-form").style.display = "block";
}

// --- Valider une manche ---
function validateRound() {
  const form = document.getElementById("round-inputs");
  const inputs = form.querySelectorAll("input");

  let roundInputs = {};
  inputs.forEach(input => {
    const p = input.name;
    roundInputs[p] = parseInt(input.value) || 0;
  });

  // Appliquer les pénalités
  for (const p of activePlayers) {
    const penalty = -1 * (roundInputs[p] || 0);
    scores[p].push(penalty);

    const total = scores[p].reduce((a, b) => a + b, 0);
    if (total <= 0 && !eliminated[p]) {
      eliminated[p] = true;
      alert(`${p} est éliminé !`);
    }
  }

  document.getElementById("round-form").style.display = "none";
  updateScoreTable();
  checkEndGame();

  // Réaffiche le bouton pour une nouvelle manche (si la partie n’est pas finie)
  if (!isGameOver()) {
    document.getElementById("new-round").style.display = "inline-block";
    roundPending = false;
  }
}

// --- Nouvelle manche ---
function newRound() {
  if (roundPending) return;
  roundPending = true;
  document.getElementById("new-round").style.display = "none";
  showRoundForm();
}

// --- Vérifier si la partie est finie ---
function isGameOver() {
  const stillAlive = activePlayers.filter(p => !eliminated[p]);
  return stillAlive.length <= 1;
}

// --- Vérifier fin de partie ---
function checkEndGame() {
  if (isGameOver()) {
    const winner = activePlayers.find(p => !eliminated[p]);
    document.getElementById("game").style.display = "none";
    document.getElementById("end-game").style.display = "block";

    const ranking = activePlayers
      .map(p => ({
        name: p,
        total: scores[p].reduce((a, b) => a + b, 0)
      }))
      .sort((a, b) => b.total - a.total);

    const list = document.getElementById("final-ranking");
    list.innerHTML = "";
    ranking.forEach((r) => {
      const li = document.createElement("li");
      li.textContent = `${r.name} (${r.total} points)`;
      list.appendChild(li);
    });
  }
}

// --- Initialisation ---
document.addEventListener("DOMContentLoaded", () => {
  allPlayers = loadAllPlayers();
  showPlayerSelection();

  document.getElementById("start-game").addEventListener("click", startGame);
  document.getElementById("new-round").addEventListener("click", newRound);
  document.getElementById("validate-round").addEventListener("click", validateRound);
});
