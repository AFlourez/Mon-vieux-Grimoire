const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes'); // Importer les routes d'authentification
const booksRoutes = require('./routes/booksRoutes'); // Importer les routes des livres
require('dotenv').config();

const app = express();

// Configurer CORS pour autoriser les requêtes depuis votre frontend
app.use(cors({
  origin: 'http://localhost:3000',  // Remplacez par l'URL de votre frontend
  methods: 'GET,POST,PUT,DELETE',
  allowedHeaders: 'Content-Type,Authorization',
}));

app.options('*', cors()); // Répond à toutes les requêtes OPTIONS avec les headers CORS appropriés


// Middleware pour parser le JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Utiliser les routes
app.use('/api/auth', authRoutes); // Routes d'authentification
app.use('/api/books', booksRoutes); // Routes des livres

module.exports = app;
