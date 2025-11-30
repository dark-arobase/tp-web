const express = require('express')
const path = require('path')

const { db, createTable } = require('./db')

// import des routes
const clientsRoutes = require('./api/gestionClients.js')
const loansRoutes = require('./api/gestionLoans.js')
const paiementsRoutes = require('./api/gestionPaiements');

const app = express()

app.use(express.json())

// dossier public
app.use(express.static(path.join(__dirname, '../public')))

// page d'accueil
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, "../public", "index.html"));
})

// utiliser les routes importées
app.use('/', clientsRoutes)
app.use('/', loansRoutes)
app.use('/', paiementsRoutes)

// Démarrage serveur
createTable()
    .then(() => {
        app.listen(3000, () => {
            console.log("Serveur en cours d'exécution sur le port 3000")
        });
    })
    .catch((err) => {
        console.error("Erreur au démarrage du schema", err);
        process.exit(1);
    })
