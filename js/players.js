let players = JSON.parse(localStorage.getItem("players")) || [];

// Sauvegarde
function savePlayers() {
  localStorage.setItem("players", JSON.stringify(players));
}

// Ajout d’un joueur
function addPlayer() {
  const name = document.getElementById("newPlayer").value.trim();
  if (!name) return alert("Entrez un nom !");
  players.push(name);
  savePlayers();
  renderPlayers();
  document.getElementById("newPlayer").value = "";
}

// Suppression d’un joueur
function removePlayer(index) {
  if (confirm("Supprimer ce joueur ?")) {
    players.splice(index, 1);
    savePlayers();
    renderPlayers();
  }
}

// Affiche la liste dans la modale
function renderPlayers() {
  const list = document.getElementById("playerList");
  list.innerHTML = "";
  players.forEach((p, index) => {
    const li = document.createElement("li");
    li.innerHTML = `${p} <button onclick="removePlayer(${index})">❌</button>`;
    list.appendChild(li);
  });
}
