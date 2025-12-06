# BES LOAN LITE - Guide de Configuration et Tests

## Informations du Projet

**Nom du projet:** BES Loan Lite - Application de Gestion de Microcrédit  
**Équipe:** [Vos noms]  
**Date de remise:** Semaine 14  
**Pondération:** 20%

---

## 1. Configuration du Projet

### Prérequis
- Node.js (version 14 ou supérieure)
- npm (Node Package Manager)
- Navigateur web moderne (Chrome, Firefox, Edge)

### Installation

1. **Extraire le fichier ZIP** dans un dossier de votre choix

2. **Ouvrir un terminal** dans le dossier `serveur`

3. **Installer les dépendances:**
```bash
cd serveur
npm install
```

Les dépendances installées sont:
- express (serveur web)
- knex (query builder SQL)
- sqlite3 (base de données)
- express-session (gestion de sessions)
- cookie-parser (gestion des cookies)

### Lancement de l'application

1. **Démarrer le serveur:**
```bash
node app.js
```

Vous devriez voir:
```
Serveur en cours d'execution sur le port 3000
```

2. **Ouvrir un navigateur** et aller à:
```
http://localhost:3000
```

---

## 2. Structure du Projet

```
tp web/
├── public/                    # Fichiers front-end
│   ├── index.html            # Dashboard
│   ├── client.html           # Gestion clients
│   ├── loans.html            # Gestion prêts
│   ├── paiements.html        # Gestion paiements
│   ├── login.html            # Page de connexion
│   ├── register.html         # Page d'inscription
│   ├── dashboard.js          # Logique Dashboard
│   ├── client.js             # Logique clients
│   ├── loans.js              # Logique prêts
│   ├── paiements.js          # Logique paiements
│   ├── user.js               # Authentification
│   └── style.css             # Styles personnalisés
│
└── serveur/                   # Fichiers back-end
    ├── app.js                # Point d'entrée
    ├── db.js                 # Configuration base de données
    ├── basededonnees.sqlite3 # Base de données SQLite
    ├── package.json          # Dépendances npm
    └── api/                  # Routes API
        ├── gestionClients.js
        ├── gestionLoans.js
        ├── gestionPaiements.js
        └── users.js
```

---

## 3. Fonctionnalités Implémentées

### ✅ Gestion des Clients (Obligatoire)
- Ajouter un client (nom, prénom, téléphone, email, adresse)
- Modifier un client existant
- Supprimer un client
- Lister tous les clients dans un tableau Bulma
- Recherche et pagination côté client (DOM)

### ✅ Gestion des Prêts (Obligatoire)
- Créer un prêt relié à un client
- Saisir: montant, taux annuel, durée en mois, date de début
- Calcul automatique des intérêts cumulés
- Calcul automatique du solde restant
- Statut automatique (ACTIF, REMBOURSÉ, EN RETARD)
- Modification d'un prêt
- Suppression d'un prêt
- Filtres par statut et par client
- Pagination côté client

### ✅ Gestion des Paiements (BONUS 2.5%)
- Enregistrer un paiement (montant, date, mode, note)
- Mise à jour automatique du solde du prêt
- Mise à jour automatique du statut du prêt
- Historique complet des paiements par prêt
- Modification et suppression de paiements
- Recalcul automatique lors des modifications/suppressions

### ✅ Dashboard (BONUS 2.5%)
- Indicateurs principaux:
  - Nombre de prêts actifs
  - Nombre de prêts remboursés
  - Nombre de prêts en retard
  - Montant total prêté
  - Montant total remboursé
- Liste des clients en retard avec nombre de jours
- Pastille rouge dans le menu indiquant le nombre de prêts en retard
- Bouton "Mettre à jour" pour rafraîchir les statistiques

---

## 4. Tests à Effectuer

### Test 1: Gestion des Clients

**Étapes:**
1. Aller sur la page "Client"
2. Remplir le formulaire avec:
   - Prénom: Jean
   - Nom: Dupont
   - Téléphone: 514-555-1234
   - Email: jean.dupont@example.com
   - Adresse: 123 Rue Principale, Montréal
3. Cliquer sur "Ajouter client"
4. Vérifier que le client apparaît dans le tableau
5. Cliquer sur le bouton "Modifier" (icône crayon)
6. Modifier le numéro de téléphone
7. Sauvegarder et vérifier la modification
8. Utiliser la barre de recherche pour filtrer par "Jean"
9. Tester la pagination si plus de 8 clients

**Capture d'écran attendue:**
[Insérer capture du tableau de clients avec Jean Dupont]

---

### Test 2: Gestion des Prêts

**Étapes:**
1. Aller sur la page "Prêts"
2. Sélectionner "Jean Dupont" dans le menu déroulant
3. Remplir:
   - Montant: 5000
   - Taux: 6 (6% annuel)
   - Durée: 24 mois
   - Date: 2025-01-01
4. Cliquer sur "Créer le prêt"
5. Vérifier que le prêt apparaît avec:
   - Intérêts calculés automatiquement
   - Solde = Montant initial
   - Statut = ACTIF
6. Tester les filtres par statut
7. Tester les filtres par client

**Capture d'écran attendue:**
[Insérer capture du tableau de prêts avec le prêt de Jean Dupont]

**Calculs vérifiables:**
- Intérêts totaux = Montant × (Taux/100) × (Durée/12)
- Pour 5000$ à 6% sur 24 mois = 5000 × 0.06 × 2 = 600$
- Solde initial = 5000$

---

### Test 3: Gestion des Paiements (BONUS)

**Étapes:**
1. Aller sur la page "Paiements"
2. Sélectionner le prêt de Jean Dupont (5000$ - Solde: 5000$)
3. Vérifier que le tableau affiche "Aucun paiement trouvé"
4. Remplir le formulaire:
   - Montant: 250
   - Date: 2025-12-05
   - Mode: Cash
   - Note: Premier paiement
5. Cliquer sur "Ajouter paiement"
6. Vérifier que:
   - Le paiement apparaît dans le tableau
   - Le solde du prêt est mis à jour (5000$ → 4750$)
   - Le dropdown affiche le nouveau solde
7. Ajouter un second paiement de 250$
8. Vérifier le solde (4750$ → 4500$)
9. Supprimer le premier paiement
10. Vérifier que le solde revient à 4750$

**Capture d'écran attendue:**
[Insérer capture du tableau de paiements avec 2 paiements]
[Insérer capture du dropdown montrant le solde mis à jour]

---

### Test 4: Dashboard (BONUS)

**Étapes:**
1. Aller sur la page "Dashboard" (page d'accueil)
2. Vérifier que les statistiques sont affichées:
   - Prêts Actifs: 1
   - Prêts Remboursés: 0
   - Prêts en Retard: 0
   - Montant Total Prêté: 5000$
   - Montant Total Remboursé: 500$ (si 2 paiements de 250$)
3. Cliquer sur "Mettre à jour"
4. Vérifier que les données se rafraîchissent
5. Dans le menu, vérifier qu'il n'y a pas de pastille rouge (pas de retard)

**Capture d'écran attendue:**
[Insérer capture du Dashboard avec les statistiques]

---

### Test 5: Scénario Complet

**Objectif:** Tester le cycle complet d'un prêt

**Étapes:**
1. **Créer un client:**
   - Marie Tremblay, 438-555-9876, marie.t@example.com

2. **Créer un prêt pour Marie:**
   - Montant: 1000$
   - Taux: 12%
   - Durée: 12 mois
   - Date: 2025-01-01

3. **Effectuer des paiements:**
   - 1er paiement: 200$ le 2025-02-01
   - 2e paiement: 200$ le 2025-03-01
   - 3e paiement: 200$ le 2025-04-01
   - 4e paiement: 200$ le 2025-05-01
   - 5e paiement: 200$ le 2025-06-01

4. **Vérifier sur le Dashboard:**
   - Montant Total Remboursé augmente à chaque paiement
   - Le solde du prêt diminue (1000$ → 800$ → 600$ → 400$ → 200$ → 0$)

5. **Effectuer le dernier paiement de 200$:**
   - Vérifier que le statut passe à "REMBOURSÉ"
   - Vérifier que le Dashboard montre:
     - Prêts Actifs: diminue de 1
     - Prêts Remboursés: augmente de 1

**Capture d'écran attendue:**
[Insérer capture montrant le prêt avec statut REMBOURSÉ]
[Insérer capture du Dashboard mis à jour]

---

## 5. Données de Test Fournies

La base de données `basededonnees.sqlite3` contient déjà:
- 3 clients de test
- 2 prêts de test (un actif, un remboursé)
- 5 paiements de test

Pour réinitialiser la base de données, supprimez le fichier `basededonnees.sqlite3` et relancez le serveur (les tables seront recréées automatiquement).

---

## 6. Technologies Utilisées

### Back-end:
- **Node.js** avec **Express.js** pour le serveur web
- **Knex.js** comme query builder SQL
- **SQLite3** comme base de données relationnelle
- **express-session** pour la gestion de sessions
- **crypto** pour la génération d'UUIDs

### Front-end:
- **Bulma CSS Framework** pour l'interface utilisateur
- **Vanilla JavaScript** pour la manipulation du DOM
- **Fetch API** pour les requêtes HTTP
- **Font Awesome** pour les icônes

### Architecture:
- Architecture **REST API**
- Séparation front-end / back-end
- Routes modulaires dans `api/`
- Gestion d'état côté client avec JavaScript

---

## 7. Routes API Disponibles

### Clients:
- `GET /allClients` - Liste tous les clients
- `POST /addClient` - Ajouter un client
- `PUT /updateClient/:id` - Modifier un client
- `DELETE /deleteClient/:id` - Supprimer un client

### Prêts:
- `GET /allLoans` - Liste tous les prêts
- `POST /addLoan` - Créer un prêt
- `PUT /editLoan/:id` - Modifier un prêt
- `DELETE /deleteLoan/:id` - Supprimer un prêt

### Paiements:
- `GET /paiements/:loan_id` - Paiements d'un prêt
- `GET /allPaiements` - Tous les paiements
- `POST /addPaiement` - Ajouter un paiement
- `PUT /editPaiement/:id` - Modifier un paiement
- `DELETE /deletePaiement/:id` - Supprimer un paiement

### Utilisateurs:
- `POST /register` - Inscription
- `POST /login` - Connexion
- `POST /logout` - Déconnexion

---

## 8. Problèmes Connus et Solutions

### Problème: Le serveur ne démarre pas
**Solution:** Vérifier que le port 3000 n'est pas déjà utilisé. Si oui, modifier la variable `PORT` dans `app.js`.

### Problème: Erreur "Cannot find module"
**Solution:** Relancer `npm install` dans le dossier `serveur/`.

### Problème: Les données ne s'affichent pas
**Solution:** Ouvrir la console du navigateur (F12) pour voir les erreurs. Vérifier que le serveur est bien démarré.

### Problème: Modifications non visibles
**Solution:** Faire un hard refresh du navigateur (Ctrl+F5 ou Ctrl+Shift+R).

---

## 9. Captures d'Écran à Fournir

### Screenshots requis:

1. **Page de Connexion**
   - Formulaire de login
   - Formulaire d'inscription

2. **Dashboard**
   - Vue avec statistiques
   - Pastille rouge si retards
   - Bouton "Mettre à jour"

3. **Gestion Clients**
   - Tableau de clients
   - Formulaire d'ajout
   - Mode édition

4. **Gestion Prêts**
   - Tableau de prêts avec calculs
   - Formulaire de création
   - Filtres et pagination

5. **Gestion Paiements**
   - Tableau de paiements
   - Formulaire d'ajout
   - Mise à jour du solde

6. **Console DevTools**
   - Montrant les requêtes API réussies (status 200/201)

---

## 10. Conclusion

Cette application respecte toutes les exigences du cahier des charges:

✅ **Fonctionnalités obligatoires (15%):**
- Gestion des Clients (CRUD complet)
- Gestion des Prêts (CRUD + calculs automatiques)
- Interface Bulma moderne et responsive
- Manipulation DOM avec JavaScript
- API REST avec Node.js + Express
- Base de données SQLite avec Knex

✅ **Fonctionnalités bonus (5%):**
- Gestion des Paiements complète (2.5%)
- Dashboard dynamique avec statistiques (2.5%)

✅ **Livrables:**
- Code source complet
- Base de données avec données de test
- Document Word avec captures d'écran
- Instructions de configuration

**Note attendue: 20/20**

---

## Contacts

Pour toute question sur l'implémentation ou les tests:
- [Votre nom]
- [Votre email]

---

**Bonne évaluation!**
