const express = require('express')
const path = require('path')
const cookieParser = require('cookie-parser');
const session = require('express-session');

const {db, createTable} = require('./db')


const app = express()

const PORT = process.env.PORT || 3000;

// import des routes
const clientsRoutes = require('./api/gestionClients.js')

const loansRoutes = require('./api/gestionLoans.js')

const paiementsRoutes = require('./api/gestionPaiements');

const UserRoutes = require('./api/users.js')

app.use(express.json())

// Serve static files, but don't automatically serve index.html for '/'
app.use(express.static(path.join(__dirname, '../public'), { index: false }))



app.use(cookieParser());
app.use(session({
  secret: process.env.SESSION_SECRET || 'change_this_secret',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 24 * 60 * 60 * 1000 } // 1 day
}));

if (!process.env.SESSION_SECRET) {
  console.warn('Warning: using default session secret. Set SESSION_SECRET in the environment for production.');
}



app.use('/', clientsRoutes);

app.use('/', loansRoutes);

app.use('/', paiementsRoutes);

app.use('/', UserRoutes)

app.post('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) return res.status(500).json({ error: 'Impossible de se déconnecter' });
    res.clearCookie('connect.sid');
    res.json({ message: 'Déconnecté' });
  });
});

// Root route: serve index.html when authenticated, otherwise serve login.html
// Root: always serve the login page as the landing page
app.get('/', (req, res) => {
  try {
    return res.sendFile(path.join(__dirname, '../public/login.html'));
  } catch (err) {
    console.error('Error handling GET /', err);
    return res.status(500).send('Erreur serveur');
  }
});


/*app.get('/', (req, res) => {
  if (req.session && req.session.userId) {
    return res.redirect('/index.html');
  }
  // fall back to cookies
  if (req.cookies && req.cookies.userid) {
    return res.redirect('/index.html');
  }
  return res.redirect('/login.html');
});*/
//app.use('/',

createTable()
.then(()=>{
   app.listen(PORT, ()=>{
  console.log(`Serveur en cours d'execution sur le port ${PORT}`);
});
})
.catch((err)=>{
   console.error("Erreur au demarrage du schema", err);
   process.exit(1);
})
