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
      label.innerHTML = `<span>${p}</span> <input type="number" min="0" value="0" name="${p}">`;
      form.appendChild(label);
    }
  });

  document.getElementById("round-form").style.display = "block";
  document.getElementById("new-round").style.display = "none";
  roundPending = true;
  document.getElementById("status").textContent = "Entrez les scores de la manche puis validez.";
}

// --- Valider la nouvelle manche ---
function validateRound() {
  if (!roundPending) {
    alert("Cliquez sur 'Nouvelle manche' pour commencer.");
    return;
  }

  const inputs = document.querySelectorAll("#round-inputs input");
  let sum = 0;
  inputs.forEach(input => {
    sum += parseInt(input.value) || 0;
  });

  if (sum !== 10) {
    alert("La somme des points doit être égale à 10 !");
    return;
  }

  inputs.forEach(input => {
    const p = input.name;
    const val = parseInt(input.value) || 0;
    scores[p].push(val);
  });

  // Met à jour élimination si total >= 40
  activePlayers.forEach(p => {
    const total = scores[p].reduce((a, b) => a + b, 0);
    if (total >= 40) eliminated[p] = true;
  });

  updateScoreTable();
  document.getElementById("round-form").style.display = "none";

  checkEndGame();
}

// --- Vérifier fin de partie ---
function checkEndGame() {
  const stillAlive = activePlayers.filter(p => !eliminated[p]);
  if (stillAlive.length === 1) {
    const winner = stillAlive[0];
    document.getElementById("final-ranking").innerHTML = `<li>${winner} (Gagnant !)</li>`;
    document.getElementById("game").style.display = "none";
    document.getElementById("end-game").style.display = "block";
    document.getElementById("new-round").style.display = "none";
    document.getElementById("status").textContent = "";
    roundPending = false;
  } else {
    document.getElementById("new-round").style.display = "inline-block";
    document.getElementById("status").textContent = "Partie en cours.";
    roundPending = false;
  }
}

// --- Bouton nouvelle manche ---
function newRound() {
  showRoundForm();
}

// --- Initialisation ---
window.onload = () => {
  allPlayers = loadAllPlayers();
  showPlayerSelection();

  document.getElementById("start-game").onclick = startGame;
  document.getElementById("new-round").onclick = newRound;
  document.getElementById("validate-round").onclick = validateRound;
};
