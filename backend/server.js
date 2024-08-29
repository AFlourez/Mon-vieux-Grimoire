const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const app = require('./app'); // Importer l'application Express depuis app.js
require('dotenv').config(); // Charger les variables d'environnement

// Servir les fichiers statiques depuis le répertoire 'uploads'
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const MONGO_URI = process.env.MONGO_URI;

// Connexion à MongoDB
mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connecté à MongoDB'))
.catch(error => console.error('Erreur de connexion à MongoDB :', error));

// Lancement du serveur
app.listen(4000, () => {
  console.log('Le serveur backend tourne sur le port : 4000');
});
