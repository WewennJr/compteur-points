// Ouvrir / fermer la modale
document.getElementById("settingsBtn").addEventListener("click", () => {
  document.getElementById("settingsModal").style.display = "block";
  renderPlayers();
});

function closeModal() {
  document.getElementById("settingsModal").style.display = "none";
}

// Fermer en cliquant dehors
window.onclick = function(event) {
  const modal = document.getElementById("settingsModal");
  if (event.target === modal) {
    closeModal();
  }
}
