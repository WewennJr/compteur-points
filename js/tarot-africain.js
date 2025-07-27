// --- VARIABLES GLOBALES ---
let allPlayers = []; // Liste globale des joueurs (vient du localStorage)
let activePlayers = []; // Joueurs choisis pour cette partie
let scores = {}; // scores[joueur] = [score initial, ...]
let eliminated = {}; // joueur -> true si éliminé

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

  // Initialiser les scores
  scores = {};
  eliminated = {};
  activePlayers.forEach(p => {
    scores[p] = [startScore];
    eliminated[p] = false;
  });

  // Afficher le tableau initial
  updateScoreTable();

  // Basculer sur la vue "jeu"
  document.getElementById("setup").style.display = "none";
  document.getElementById("game").style.display = "block";
}

// --- Mettre à jour le tableau des scores ---
function updateScoreTable() {
  const table = document.getElementById("score-table");
  table.innerHTML = "";

  // Ligne d'entête
  const headerRow = document.createElement("tr");
  headerRow.appendChild(document.createElement("th")); // cellule vide pour les manches
  activePlayers.forEach(p => {
    const th = document.createElement("th");
    th.textContent = p + (eliminated[p] ? " (Éliminé)" : "");
    headerRow.appendChild(th);
  });
  table.appendChild(headerRow);

  // Nombre de manches max
  const maxRounds = Math.max(...Object.values(scores).map(s => s.length));

  // Lignes des manches
  for (let r = 0; r < maxRounds; r++) {
    const row = document.createElement("tr");
    const roundCell = document.createElement("td");
    roundCell.textContent = r === 0 ? "Départ" : "Manche " + r;
    row.appendChild(roundCell);

    activePlayers.forEach(p => {
      const td = document.createElement("td");
      td.textContent = scores[p][r] !== undefined ? scores[p][r] : "";
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
    if (eliminated[p]) td.style.color = "gray";
    totalRow.appendChild(td);
  });

  table.appendChild(totalRow);
}

// --- Nouvelle manche ---
function newRound() {
  const roundInputs = {};

  // Demander le nombre d'échecs par joueur
  for (const p of activePlayers) {
    if (!eliminated[p]) {
      let fails = prompt(`Combien d'échecs pour ${p} ?`, "0");
      if (fails === null) return; // annuler
      fails = parseInt(fails) || 0;
      roundInputs[p] = fails;
    } else {
      roundInputs[p] = 0; // pas de points pour les éliminés
    }
  }

  // Appliquer les pénalités
  for (const p of activePlayers) {
    const penalty = -1 * roundInputs[p];
    scores[p].push(penalty);

    // Vérifier élimination
    const total = scores[p].reduce((a, b) => a + b, 0);
    if (total <= 0 && !eliminated[p]) {
      eliminated[p] = true;
      alert(`${p} est éliminé !`);
    }
  }

  updateScoreTable();
  checkEndGame();
}

// --- Vérifier fin de partie ---
function checkEndGame() {
  const stillAlive = activePlayers.filter(p => !eliminated[p]);
  if (stillAlive.length === 1) {
    const winner = stillAlive[0];
    alert(`Fin de partie ! ${winner} est le dernier en jeu.`);

    // Créer un classement final
    const ranking = activePlayers
      .map(p => {
        return {
          name: p,
          total: scores[p].reduce((a, b) => a + b, 0)
        };
      })
      .sort((a, b) => b.total - a.total);

    let msg = "Classement final :\n";
    ranking.forEach((r, i) => {
      msg += `${i + 1}. ${r.name} (${r.total} points)\n`;
    });
    alert(msg);
  }
}

// --- Initialisation ---
document.addEventListener("DOMContentLoaded", () => {
  allPlayers = loadAllPlayers();
  showPlayerSelection();

  document.getElementById("start-game").addEventListener("click", startGame);
  document.getElementById("new-round").addEventListener("click", newRound);
});
