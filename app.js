/**
 * @file jeu.js
 * @brief Gestionnaire du jeu basé sur les votes.
 * @details Ce script configure et gère les différentes étapes d'un jeu interactif
 *          où les joueurs votent et les résultats sont calculés selon le mode choisi.
 *          Il inclut la gestion des joueurs, des votes, et des conditions de fin de partie.
 */

document.addEventListener("DOMContentLoaded", () => {
    // Éléments HTML
    const btnDemarrer = document.getElementById('demarrerJeu');
    const sectionJeu = document.getElementById('jeu');
    const sectionMenu = document.getElementById('menu');
    const inputNbJoueurs = document.getElementById('nbJoueurs');
    const zoneNomsJoueurs = document.getElementById('zoneNomsJoueurs');
    const btnValiderJoueurs = document.getElementById('validerJoueurs');
    const cartes = document.querySelectorAll('.carte');
    const btnValiderVote = document.getElementById('validerVote');
    const resultatVote = document.getElementById('resultatVote');
    const btnSuivant = document.getElementById('recommencerTour');
    const btnNouvellePartie = document.getElementById('nouvellePartie');
    const btnChargerBacklog = document.getElementById('chargerBacklog');
    const backlogFileInput = document.getElementById("backlogFile");
    const missionActuelle = document.getElementById("missionActuelle");
    const btnTelechargerResultats = document.getElementById('telechargerResultats');
    

    // Variables globales
    let joueurs = [];
    let votesJoueurs = {};
    let joueurActuelIndex = 0;
    let modeJeu = 'moyenne';
    let tour = 1;

    let backlog = [];
    let backlogIndex = 0;
    let resultatFinal = [];

  // Fonction pour afficher la mission actuelle
  function afficherMissionActuelle() {

    if (backlogIndex < backlog.length) {
        const mission = backlog[backlogIndex];
        missionActuelle.innerHTML = `
            <p><strong>Tache :</strong> ${mission.feature}</p>
        `;
        btnValiderVote.disabled = false;
    } else {
        missionActuelle.innerHTML = "<p>Toutes les missions sont terminées.</p>";
        afficherFinDePartie();
    }
}

    // Gère la validation du nombre de joueurs
    btnValiderJoueurs.addEventListener('click', () => {
        const nbJoueurs = parseInt(inputNbJoueurs.value);

        if (!isNaN(nbJoueurs) && nbJoueurs >= 2) {  //Changement v2
            zoneNomsJoueurs.innerHTML = '';
            for (let i = 0; i < nbJoueurs; i++) {
                const input = document.createElement('input');
                input.type = 'text';
                input.placeholder = `Pseudo joueur ${i + 1}`;
                input.classList.add('inputPseudo');
                zoneNomsJoueurs.appendChild(input);
            }
            zoneNomsJoueurs.style.display = 'block';
            btnDemarrer.style.display = 'inline-block';
        } else {
            alert("Veuillez entrer un nombre valide de joueurs (au moins 2) !");
        }
    });

    // Gestion du bouton "Démarrer"
    btnDemarrer.addEventListener('click', () => {
        const inputsNoms = document.querySelectorAll('.inputPseudo');
        joueurs = Array.from(inputsNoms).map(input => input.value.trim()).filter(nom => nom);

        modeJeu = document.getElementById('modeJeu').value;

        if (joueurs.length >= 2 && backlog.length > 0) { //Cnagement
            joueurActuelIndex = 0;
            votesJoueurs = {};
            tour = 1;

            sectionMenu.style.display = 'none';
            sectionJeu.style.display = 'block';
            resultatVote.innerHTML = `${joueurs[joueurActuelIndex]}, c'est à vous de voter.`;
            btnValiderVote.disabled = false;
            afficherMissionActuelle();
        } else {
            alert("Veuillez entrer tous les pseudos et charger un backlog !");
        }
    });

    // Gestion du bouton "Charger Backlog"
    btnChargerBacklog.addEventListener("click", () => {
        const backlogFile = backlogFileInput.files[0];
        if (!backlogFile) {
            alert("Veuillez sélectionner un fichier JSON.");
            console.error("Aucun fichier sélectionné.");
            return;
        }
        const reader = new FileReader();
        reader.onload = ({ target }) => {
            try {
                const data = JSON.parse(target.result);
                if (!Array.isArray(data) || data.length === 0) {
                    throw new Error("Le fichier JSON est vide ou mal formaté.");
                }
                backlog = data;
                alert("Backlog chargé avec succès !");
            } catch (error) {
                console.error("Erreur lors du chargement du fichier JSON :", error);
                alert(error.message);
            }
        };
        reader.readAsText(backlogFile);
    });


    // Gestion des cartes pour voter
    cartes.forEach(carte => {
        carte.addEventListener('click', () => {
            cartes.forEach(c => c.classList.remove('selectionnee'));
            carte.classList.add('selectionnee');
            votesJoueurs[joueurs[joueurActuelIndex]] = parseFloat(carte.alt.split(' ')[1]);
            btnValiderVote.disabled = false;
        });
    });

    // Gestion du bouton "Valider vote"
    btnValiderVote.addEventListener('click', () => {
        if (votesJoueurs[joueurs[joueurActuelIndex]] !== undefined) {
            joueurActuelIndex++;
            if (joueurActuelIndex >= joueurs.length) {
                if (modeJeu === 'strict') {
                    gererUnanimite();
                } else if (modeJeu === 'moyenne') {
                    gererMoyenne();
                }
            } else {
                resultatVote.innerHTML = `${joueurs[joueurActuelIndex]}, c'est à vous de voter.`;
            }
        } else {
            resultatVote.innerHTML = "Vous devez sélectionner une carte avant de voter.";
        }
    });

    // Gestion du mode "Unanimité"
    function gererUnanimite() {
        const votes = Object.values(votesJoueurs);
        const minVote = Math.min(...votes);
        const maxVote = Math.max(...votes);

        if (minVote !== maxVote) {
            const joueurMin = obtenirJoueurParVote(votesJoueurs, minVote);
            const joueurMax = obtenirJoueurParVote(votesJoueurs, maxVote);
    
            resultatVote.innerHTML = `<p>${joueurMin} (min) et ${joueurMax} (max), discutez !</p>`;
            
            // Démarre un minuteur de 30 secondes
            demarrerMinuteur(30, () => {
                joueurActuelIndex = 0; // Réinitialise pour le prochain vote
                votesJoueurs = {}; // Réinitialise les votes
            });
        } else {
            const unanimite = minVote;

            resultatFinal.push({
                tache: backlog[backlogIndex].feature,
                note: unanimite
            });
    
            resultatVote.innerHTML = `<p>Tous les joueurs sont d'accord : ${minVote}.</p>`;
            afficherFinDePartie();
        }
    }

    // Gestion du mode "Moyenne"
   function gererMoyenne() {
        if (tour === 1) {
            const votes = Object.values(votesJoueurs);
            const minVote = Math.min(...votes);
            const maxVote = Math.max(...votes);
    
            const joueurMin = obtenirJoueurParVote(votesJoueurs, minVote);
            const joueurMax = obtenirJoueurParVote(votesJoueurs, maxVote);
    
            resultatVote.innerHTML = `<p>${joueurMin} (min) et ${joueurMax} (max), discutez avant le 2e tour.</p>`;
            
            // Démarre un minuteur de 30 secondes
            demarrerMinuteur(30, () => {
                tour = 2; // Passe au 2e tour
                joueurActuelIndex = 0;
                votesJoueurs = {};
            });
        } else if (tour === 2) {
            const votes = Object.values(votesJoueurs);
            const moyenne = (votes.reduce((somme, vote) => somme + vote, 0) / votes.length).toFixed(2);

            resultatFinal.push({
                tache: backlog[backlogIndex].feature,
                note: moyenne,
            });
    
            resultatVote.innerHTML = `<p>La moyenne des votes est : ${moyenne}.</p>`;
            afficherFinDePartie();
        }
    }
      /**
     * @brief Obtient le nom du joueur par son vote.
     * @param vote Vote du joueur.
     * @return Le pseudo du joueur ayant effectué ce vote.
     */
    function obtenirJoueurParVote(vote) {
        return Object.keys(votesJoueurs).find(joueur => votesJoueurs[joueur] === vote);
    }


/**
 * @brief Gère un minuteur pendant lequel les joueurs discutent.
 * @param {number} duree - La durée du minuteur en secondes.
 * @param {Function} callback - Fonction à exécuter une fois le minuteur écoulé.
 */
    function demarrerMinuteur(duree, callback) {
        const resultatVote = document.getElementById('resultatVote');
        const btnValiderVote = document.getElementById('validerVote');
        let tempsRestant = duree;

    // Bloque le bouton de vote
        btnValiderVote.disabled = true;

    // Met à jour le texte pour afficher le temps restant
     const interval = setInterval(() => {
        resultatVote.innerHTML = `Discussion en cours... ${tempsRestant} secondes restantes.`;
        tempsRestant--;

        if (tempsRestant < 0) {
            clearInterval(interval);
            resultatVote.innerHTML = `Temps écoulé ! Vous pouvez voter.`;
            
            // Réactive le bouton de vote
            btnValiderVote.disabled = false;

            // Exécute le callback si défini
            if (typeof callback === 'function') {
                callback();
            }
        }
            }, 1000); // Exécute toutes les secondes
                                        }
 
    
    function afficherTacheSuivante() {
    
        backlogIndex++; 
        if (backlogIndex < backlog.length) {
            const mission = backlog[backlogIndex];
    
            votesJoueurs = {}; 
            joueurActuelIndex = 0; 
            tour = 1; 
    
            cartes.forEach(carte => carte.classList.remove('selectionnee'));
            missionActuelle.innerHTML = `
                <p><strong>Mission :</strong> ${mission.feature}</p>
            `;
            resultatVote.innerHTML = `
                <p>${joueurs[joueurActuelIndex]}, c'est à vous de voter.</p>
            `;
            btnValiderVote.disabled = true; 
        } else {
            missionActuelle.innerHTML = "<p>Toutes les missions sont terminées.</p>";
            afficherFinDePartie();
        }
    }
    
    btnSuivant.addEventListener("click", () => {
        
            afficherTacheSuivante(); // Passe à la tâche suivante
            afficherMissionActuelle(); // Réinitialise sur la tâche actuelle

    });
    

    function afficherFinDePartie() {
        
        btnValiderVote.disabled = true;
        btnSuivant.style.display = "block";
        btnNouvellePartie.style.display = "block";
        if (missionActuelle.innerHTML === "<p>Toutes les missions sont terminées.</p>") {
            btnSuivant.disabled = true; // Active le bouton
            const btnTelecharger = document.getElementById("telechargerResultats");
            btnTelecharger.style.display = "block";
            btnTelecharger.addEventListener("click", sauvegarderResultats); // Ajouter l'événement ici
        }   
       
    }
    
    btnTelechargerResultats.addEventListener("click", sauvegarderResultats);

    // Gestion du bouton "Nouvelle Partie"
    btnNouvellePartie.addEventListener('click', () => {
        sectionMenu.style.display = 'block';
        sectionJeu.style.display = 'none';
        votesJoueurs = {};
        joueurs = [];
        joueurActuelIndex = 0;
        zoneNomsJoueurs.innerHTML = '';
        zoneNomsJoueurs.style.display = 'none';
        btnDemarrer.style.display = 'none';
    });

    function sauvegarderResultats() {
        const dataStr = JSON.stringify(resultatFinal, null, 2); // Convertit le tableau en JSON formaté
        const blob = new Blob([dataStr], { type: "application/json" });
        const url = URL.createObjectURL(blob);
    
        const a = document.createElement("a");
        a.href = url;
        a.download = "resultat_final.json"; // Nom du fichier téléchargé
        a.click();
        URL.revokeObjectURL(url); // Nettoie l'URL temporaire
    }

   
});
