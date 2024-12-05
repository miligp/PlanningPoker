import { gererUnanimite, gererMoyenne, obtenirJoueurParVote } from './functions';

describe('Tests pour les fonctions principales du jeu', () => {
    test('gererUnanimite - détecte une unanimité', () => {
        const votesJoueurs = { Ilyna: 1, Milena: 1, Tomtom: 1 };
        const resultat = gererUnanimite(votesJoueurs);
        expect(resultat.unanimite).toBe(true);
        expect(resultat.valeur).toBe(1);
    });

    test('gererUnanimite - détecte un désaccord', () => {
        const votesJoueurs = { Ilyna: 1, Milena: 2, Tomtom: 3 };
        const resultat = gererUnanimite(votesJoueurs);
        expect(resultat.unanimite).toBe(false);
        expect(resultat.minVote).toBe(1);
        expect(resultat.maxVote).toBe(3);
    });

    test('gererMoyenne - calcule correctement la moyenne', () => {
        const votes = [1, 2, 3];
        const resultat = gererMoyenne(votes);
        expect(resultat.moyenne).toBe(2.00);
    });

    test('gererMoyenne - fonctionne avec des votes identiques', () => {
        const votes = [3, 3, 3];
        const resultat = gererMoyenne(votes);
        expect(resultat.moyenne).toBe(3.0);
    });

    test('obtenirJoueurParVote - trouve le joueur correspondant à un vote', () => {
        const votesJoueurs = { Ilyna: 1, Milena: 2, Tomtom: 3 };
        expect(obtenirJoueurParVote(votesJoueurs, 2)).toBe('Milena');
        expect(obtenirJoueurParVote(votesJoueurs, 3)).toBe('Tomtom');
    });

    test('obtenirJoueurParVote - retourne null si aucun joueur ne correspond', () => {
        const votesJoueurs = { Ilyna: 1, Milena: 2, Tomtom: 3 };
        expect(obtenirJoueurParVote(votesJoueurs, 5)).toBeNull();
    });
});
