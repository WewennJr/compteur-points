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
  console.log("Démarrage de la partie");
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

  // Affiche le bouton nouvelle manche et status
  document.getElementById("new-round").style.display = "inline-block";
  document.getElementById("status").textContent = "Cliquez sur 'Nouvelle manche' pour commencer.";
  roundPending = false;
  console.log("Bouton nouvelle manche affiché");
}

// --- Mettre à jour le tableau des scores ---
function updateScoreTable() {
  const table = document.getElementById("score-table");
  table.innerHTML = "";

  // Ligne d'entête
  const headerRow = document.createElement("tr");
  headerRow.appendChild(document.createElement("th")); // case vide en haut à gauche
  activePlayers.forEach(p => {
    const th = document.createElement("th");
    th.textContent = p + (eliminated[p] ? " (Éliminé)" : "");
    if (eliminated[p]) th.classList.add("eliminated");
    headerRow.appendChild(th);
  });
  table.appendChild(headerRow);

  // Nombre de manches max (longueur max dans scores)
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

  // Ligne des totaux
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
      label.style.marginRight = "10px";
      label.innerHTML = `<span>${p}</span> <input type="number" min="0" value="0" name="${p}">`;
      form.appendChild(label);
    }
  });

  document.getElementById("round-form").style.display = "block";
  document.getElementById("new-round").style.display = "none";
  document.getElementById("status").textContent = "Remplis les scores de la manche puis valide.";
}

// --- Valider une manche ---
function validateRound() {
  if (roundPending) return; // Empêche double validation
  roundPending = true;

  const form = document.getElementById("round-inputs");
  const inputs = form.querySelectorAll("input");
  const roundScores = {};

  for (const input of inputs) {
    let val = parseInt(input.value);
    if (isNaN(val) || val < 0) {
      alert("Scores invalides. Veuillez entrer des nombres positifs.");
      roundPending = false;
      return;
    }
    roundScores[input.name] = val;
  }

  // Ajouter les scores à chaque joueur actif
  activePlayers.forEach(p => {
    if (!eliminated[p]) {
      scores[p].push(roundScores[p] || 0);
    } else {
      // Joueurs éliminés ne changent plus
      scores[p].push(scores[p][scores[p].length -1]);
    }
  });

  // Éliminer joueurs avec total <= 0
  activePlayers.forEach(p => {
    const total = scores[p].reduce((a,b) => a + b, 0);
    if (total <= 0 && !eliminated[p]) {
      eliminated[p] = true;
      alert(`Le joueur ${p} est éliminé !`);
    }
  });

  updateScoreTable();
  document.getElementById("round-form").style.display = "none";
  document.getElementById("new-round").style.display = "inline-block";

  // Vérifier si la partie est finie
  const remaining = activePlayers.filter(p => !eliminated[p]);
  if (remaining.length <= 1) {
    endGame();
  } else {
    document.getElementById("status").textContent = "Cliquez sur 'Nouvelle manche' pour continuer.";
    roundPending = false;
  }
}

// --- Fin de la partie ---
function endGame() {
  document.getElementById("game").style.display = "none";
  document.getElementById("end-game").style.display = "block";

  // Trier par score total décroissant
  const ranking = [...activePlayers].sort((a,b) => {
    const totalB = scores[b].reduce((a,b) => a + b, 0);
    const totalA = scores[a].reduce((a,b) => a + b, 0);
    return totalB - totalA;
  });

  const ol = document.getElementById("final-ranking");
  ol.innerHTML = "";

  ranking.forEach(p => {
    const li = document.createElement("li");
    const total = scores[p].reduce((a,b) => a + b, 0);
    li.textContent = `${p} : ${total} points${eliminated[p] ? " (Éliminé)" : ""}`;
    ol.appendChild(li);
  });
}

// --- Événements ---
document.getElementById("start-game").addEventListener("click", startGame);
document.getElementById("new-round").addEventListener("click", showRoundForm);
document.getElementById("validate-round").addEventListener("click", validateRound);

// --- Initialisation ---
allPlayers = loadAllPlayers();
showPlayerSelection();
