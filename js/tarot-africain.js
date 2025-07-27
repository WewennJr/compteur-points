// --- Variables ---
let allPlayers = [];
let activePlayers = [];
let scores = {};
let eliminated = {};

// --- Load players depuis localStorage ou défaut ---
function loadAllPlayers() {
  const saved = localStorage.getItem("players");
  return saved ? JSON.parse(saved) : ["Alice", "Bob", "Charlie", "David"];
}

// --- Affiche choix joueurs ---
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

// --- Démarrage partie ---
function startGame() {
  const checked = document.querySelectorAll("#player-selection input:checked");
  activePlayers = Array.from(checked).map(c => c.value);
  if (activePlayers.length < 2) {
    alert("Sélectionne au moins 2 joueurs !");
    return;
  }
  const startScoreInput = document.getElementById("start-score").value;
  const startScore = parseInt(startScoreInput, 10) || 20;

  scores = {};
  eliminated = {};
  activePlayers.forEach(p => {
    scores[p] = [startScore];
    eliminated[p] = false;
  });

  updateScoreTable();
  document.getElementById("setup").style.display = "none";
  document.getElementById("game").style.display = "block";

  console.log("Partie démarrée avec joueurs:", activePlayers, "Score départ:", startScore);
}

// --- Met à jour tableau des scores ---
function updateScoreTable() {
  const table = document.getElementById("score-table");
  table.innerHTML = "";

  const headerRow = document.createElement("tr");
  headerRow.appendChild(document.createElement("th")); // coin vide

  activePlayers.forEach(p => {
    const th = document.createElement("th");
    th.textContent = p;
    if (eliminated[p]) th.classList.add("elimine");
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
      if (eliminated[p]) td.classList.add("elimine");
      row.appendChild(td);
    });

    table.appendChild(row);
  }

  // Ligne total
  const totalRow = document.createElement("tr");
  const totalLabel = document.createElement("td");
  totalLabel.textContent = "Total";
  totalRow.appendChild(totalLabel);

  activePlayers.forEach(p => {
    const td = document.createElement("td");
    const total = scores[p].reduce((a, b) => a + b, 0);
    td.textContent = total;
    if (eliminated[p]) td.classList.add("elimine");
    td.style.textAlign = "right"; // aligner score à droite
    totalRow.appendChild(td);
  });

  table.appendChild(totalRow);
}

// --- Nouvelle manche ---
function newRound() {
  const roundInputs = {};
  for (const p of activePlayers) {
    if (!eliminated[p]) {
      let fails = prompt(`Combien d'échecs pour ${p} ?`, "0");
      if (fails === null) return; // annule prompt = annule manche
      fails = parseInt(fails, 10) || 0;
      roundInputs[p] = fails;
    } else {
      roundInputs[p] = 0;
    }
  }

  for (const p of activePlayers) {
    const penalty = -1 * roundInputs[p];
    scores[p].push(penalty);

    const total = scores[p].reduce((a, b) => a + b, 0);
    if (total <= 0 && !eliminated[p]) {
      eliminated[p] = true;
      alert(`${p} est éliminé !`);
    }
  }

  updateScoreTable();
  checkEndGame();
}

// --- Vérifie si la partie est terminée ---
function checkEndGame() {
  const alive = activePlayers.filter(p => !eliminated[p]);
  if (alive.length === 1) {
    const winner = alive[0];
    alert(`Fin de partie ! ${winner} est le dernier en jeu.`);

    // Classement final trié décroissant
    const ranking = activePlayers
      .map(p => ({ name: p, total: scores[p].reduce((a, b) => a + b, 0) }))
      .sort((a, b) => b.total - a.total);

    let msg = "Classement final :\n\n";
    ranking.forEach((r, i) => {
      msg += `${i + 1}. ${r.name.padEnd(12, ' ')} | ${String(r.total).padStart(4, ' ')} pts\n`;
    });
    alert(msg);

    // Masquer bouton nouvelle manche, afficher retour accueil
    document.getElementById("new-round").style.display = "none";
    const returnBtn = document.getElementById("return-home");
    returnBtn.style.display = "block";
  }
}

// --- Retour accueil ---
function returnHome() {
  document.getElementById("game").style.display = "none";
  document.getElementById("setup").style.display = "block";
  document.getElementById("new-round").style.display = "inline-block";
  document.getElementById("return-home").style.display = "none";

  // Reset sélection et scores
  showPlayerSelection();
  document.getElementById("start-score").value = 20;
  scores = {};
  eliminated = {};
  activePlayers = [];
  console.log("Retour à l'accueil.");
}

// --- Initialisation ---
document.addEventListener("DOMContentLoaded", () => {
  allPlayers = loadAllPlayers();
  showPlayerSelection();

  document.getElementById("start-game").addEventListener("click", startGame);
  document.getElementById("new-round").addEventListener("click", newRound);
  document.getElementById("return-home").addEventListener("click", returnHome);

  console.log("Script chargé, prêt !");
});
