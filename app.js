document.addEventListener("DOMContentLoaded", () => {
    const btnDemarrer = document.getElementById('demarrerJeu');
    const sectionJeu = document.getElementById('jeu');
    const sectionMenu = document.getElementById('menu');
    const inputNbJoueurs = document.getElementById('nbJoueurs');
    const zoneNomsJoueurs = document.getElementById('zoneNomsJoueurs');
    const btnValiderJoueurs = document.getElementById('validerJoueurs');
    const cartes = document.querySelectorAll('.carte');
    const btnValiderVote = document.getElementById('validerVote');
    const resultatVote = document.getElementById('resultatVote');
    const btnRecommencer = document.getElementById('recommencerTour');
    const btnNouvellePartie = document.getElementById('nouvellePartie');

    let joueurs = [];
    let votesJoueurs = {};
    let joueurActuelIndex = 0;
    let modeJeu = 'moyenne';
    let tour = 1;

    // Validation du nombre de joueurs
    btnValiderJoueurs.addEventListener('click', () => {
        const nbJoueurs = parseInt(inputNbJoueurs.value);
        if (nbJoueurs >= 2) {
            zoneNomsJoueurs.innerHTML = ''; // Réinitialisation des champs noms
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

    // Démarrer le jeu
    btnDemarrer.addEventListener('click', () => {
        const inputsNoms = document.querySelectorAll('.inputPseudo');
        joueurs = Array.from(inputsNoms).map(input => input.value.trim()).filter(nom => nom);

        modeJeu = document.getElementById('modeJeu').value;

        if (joueurs.length >= 2) {
            joueurActuelIndex = 0;
            votesJoueurs = {};
            tour = 1;

            sectionMenu.style.display = 'none';
            sectionJeu.style.display = 'block';
            resultatVote.innerHTML = `${joueurs[joueurActuelIndex]}, c'est à vous de voter.`;
            btnValiderVote.disabled = false;
        } else {
            alert("Veuillez entrer tous les pseudos !");
        }
    });

    // Sélection des cartes
    cartes.forEach(carte => {
        carte.addEventListener('click', () => {
            cartes.forEach(c => c.classList.remove('selectionnee'));
            carte.classList.add('selectionnee');
            votesJoueurs[joueurs[joueurActuelIndex]] = parseFloat(carte.alt.split(' ')[1]);
            btnValiderVote.disabled = false;
        });
    });

    // Validation des votes
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

    // Gestion du mode Unanimité
    function gererUnanimite() {
        const votes = Object.values(votesJoueurs);
        const minVote = Math.min(...votes);
        const maxVote = Math.max(...votes);

        if (minVote !== maxVote) {
            const joueurMin = obtenirJoueurParVote(minVote);
            const joueurMax = obtenirJoueurParVote(maxVote);

            resultatVote.innerHTML = `<p>${joueurMin} (min) et ${joueurMax} (max), discutez et revotez !</p>`;
            joueurActuelIndex = 0; // Repartir au premier joueur
            votesJoueurs = {}; // Réinitialiser les votes
        } else {
            resultatVote.innerHTML = `<p>Tous les joueurs sont d'accord : ${minVote}.</p>`;
            afficherFinDePartie();
        }
    }

    // Gestion du mode Moyenne
    function gererMoyenne() {
        if (tour === 1) {
            const votes = Object.values(votesJoueurs);
            const minVote = Math.min(...votes);
            const maxVote = Math.max(...votes);

            const joueurMin = obtenirJoueurParVote(minVote);
            const joueurMax = obtenirJoueurParVote(maxVote);

            resultatVote.innerHTML = `<p>${joueurMin} (min) et ${joueurMax} (max), discutez avant le 2e tour.</p>`;
            tour = 2; // Passer au deuxième tour
            joueurActuelIndex = 0;
            votesJoueurs = {}; // Réinitialiser les votes
        } else if (tour === 2) {
            const votes = Object.values(votesJoueurs);
            const moyenne = (votes.reduce((somme, vote) => somme + vote, 0) / votes.length).toFixed(2);

            resultatVote.innerHTML = `<p>La moyenne des votes est : ${moyenne}.</p>`;
            afficherFinDePartie();
        }
    }

    // Obtenir le nom du joueur par son vote
    function obtenirJoueurParVote(vote) {
        return Object.keys(votesJoueurs).find(joueur => votesJoueurs[joueur] === vote);
    }

    // Afficher les boutons de fin de partie
    function afficherFinDePartie() {
        btnValiderVote.disabled = true;
        btnRecommencer.style.display = 'block';
        btnNouvellePartie.style.display = 'block';
    }

    // Recommencer le tour
    btnRecommencer.addEventListener('click', () => {
        joueurActuelIndex = 0;
        votesJoueurs = {};
        resultatVote.innerHTML = `${joueurs[joueurActuelIndex]}, c'est à vous de voter.`;
        btnRecommencer.style.display = 'none';
        btnNouvellePartie.style.display = 'none';
        btnValiderVote.disabled = false;
    });

    // Nouvelle partie
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
});
