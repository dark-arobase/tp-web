const express = require('express')
const path = require('path')


const { db, createTable } = require('./db')


// import des routes
const clientsRoutes = require('./api/gestionClients.js')

const loansRoutes = require('./api/gestionLoans.js')

const paiementsRoutes = require('./api/gestionPaiements');


const app = express()

app.use(express.json())

app.use(express.static(path.join(__dirname, '../public')))

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, "../public", "index.html"));
})

<<<<<<< HEAD
    
// Route ajouter un client

app.post('/api/clients', async (req, res) => {
    try {
        const { nom, prenom, telephone, email, adresse } = req.body;
=======
>>>>>>> 840bcd43a1ccf8f7deff07fc4f89a68a50a596d8

app.use('/', clientsRoutes);

app.use('/', loansRoutes);

app.use('/', paiementsRoutes);

<<<<<<< HEAD

// Route liste des clients

app.get('/api/clients', async (req, res) => {
    try {
        const clients = await db('clients').select('*');
        res.json(clients);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});
=======
//app.use('/',
>>>>>>> 840bcd43a1ccf8f7deff07fc4f89a68a50a596d8



// modifier un client (PUT)
app.put('/api/clients/:id', async (req, res)=>{
  try{
    const { id } = req.params
    const { nom, prenom, telephone, email, adresse } = req.body

    const updated = await db('clients')
                          .whereRaw('LOWER(id)=?', [id.toLowerCase()])
                          .update({ nom, prenom, telephone, email, adresse })

    if(updated) res.json({ success: true })
    else res.json({ success: false })
  }catch(err){
    console.error(err)
    res.status(500).json({ success:false, error:'Erreur serveur' })
  }
})

// supprimer un client (DELETE)
app.delete('/api/clients/:id', async (req, res)=>{
  try{
    const { id } = req.params
    const deleted = await db('clients')
                          .whereRaw('LOWER(id)=?', [id.toLowerCase()])
                          .del()
    if(deleted) res.json({ success: true })
    else res.json({ success: false })
  }catch(err){
    console.error(err)
    res.status(500).json({ success:false, error:'Erreur serveur' })
  }
})



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
