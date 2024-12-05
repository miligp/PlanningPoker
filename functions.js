export function gererUnanimite(votesJoueurs) {
    const votes = Object.values(votesJoueurs);
    const minVote = Math.min(...votes);
    const maxVote = Math.max(...votes);

    if (minVote !== maxVote) {
        return { unanimite: false, minVote, maxVote };
    }
    return { unanimite: true, valeur: minVote };
}

export function gererMoyenne(votes) {
    const moyenne = (votes.reduce((somme, vote) => somme + vote, 0) / votes.length).toFixed(2);
    return { moyenne: parseFloat(moyenne) };
}

export function obtenirJoueurParVote(votesJoueurs, vote) {
    return Object.keys(votesJoueurs).find(joueur => votesJoueurs[joueur] === vote) || null;
}
