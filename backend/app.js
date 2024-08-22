const express = require('express');
const mongoose = require('mongoose');
const Book = require('./models/Book'); // Import du modèle Book

const app = express();

// Middleware pour parser le JSON
app.use(express.json());

// Route GET pour /api/books
app.get('/api/books', async (req, res) => {
  try {
    const books = await Book.find(); // Récupérer tous les livres depuis MongoDB
    res.json(books); // Renvoyer les livres en tant que réponse JSON
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération des livres' });
  }
});

// Exporter l'application
module.exports = app;
