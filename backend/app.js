const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('./models/User'); // Assure-toi que le chemin est correct
const Book = require('./models/Book'); // Import du modèle Book
const authMiddleware = require('./middleware/auth'); // Import du middleware d'authentification
const upload = require('./middleware/multer-config'); // Importer la configuration 
const cors = require('cors'); // Import du middleware CORS

const app = express();

// Configurer CORS pour autoriser les requêtes depuis votre frontend
app.use(cors({
  origin: 'http://localhost:3000',  // Remplacez par l'URL de votre frontend
  methods: 'GET,POST,PUT,DELETE',
  allowedHeaders: 'Content-Type,Authorization',
}));

// Middleware pour parser le JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Route POST pour ajouter un livre (protégée par authentification)
app.post('/api/books', authMiddleware, (req, res) => {
  const book = new Book({
    ...req.body,
    userId: req.userId // Ajoute l'ID de l'utilisateur au livre
  });
  book.save()
    .then(() => res.status(201).json({ message: 'Livre enregistré !' }))
    .catch(error => res.status(400).json({ error }));
});

// Route GET pour récupérer tous les livres
app.get('/api/books', async (req, res) => {
  try {
    const books = await Book.find(); // Récupérer tous les livres depuis MongoDB
    res.status(200).json(books); // Renvoyer les livres en tant que réponse JSON
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération des livres' });
  }
});

// Route GET pour récupérer les 3 livres avec la meilleure note moyenne
app.get('/api/books/bestrating', async (req, res) => {
  try {
    const topBooks = await Book.find()
      .sort({ averageRating: -1 }) // Trier par note moyenne en ordre décroissant
      .limit(3); // Limiter à 3 livres

    res.status(200).json(topBooks);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération des livres', error });
  }
});

// Route GET pour récupérer un livre par ID
app.get('/api/books/:id', (req, res) => {
  console.log('ID demandé:', req.params.id);
  Book.findOne({ _id: req.params.id })
    .then(book => {
      if (book) {
        res.status(200).json(book);
      } else {
        res.status(404).json({ message: 'Livre non trouvé' });
      }
    })
    .catch(error => res.status(404).json({ error }));
});


// Clé secrète pour signer le token JWT (à ne pas exposer en production)
const JWT_SECRET = 'your_jwt_secret_key'; // Change cela pour une clé plus sécurisée en production

// Route POST pour l'inscription
app.post('/api/auth/signup', async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ message: 'Email et mot de passe requis' });
    }

    const existingUser = await User.findOne({ email: email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email déjà utilisé' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      email: email,
      password: hashedPassword
    });

    await user.save();
    res.status(201).json({ message: 'Utilisateur créé !' });

  } catch (error) {
    console.error('Erreur lors de l\'inscription:', error);
    res.status(500).json({ message: 'Erreur lors de la création de l\'utilisateur', error });
  }
});

// Route POST pour la connexion
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      console.log('Email ou mot de passe manquant');
      return res.status(400).json({ message: 'Email et mot de passe requis' });
    }

    const user = await User.findOne({ email: email });
    if (!user) {
      console.log('Utilisateur non trouvé');
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      console.log('Mot de passe incorrect');
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }

    const token = jwt.sign(
      { userId: user._id },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.status(200).json({
      userId: user._id,
      token: token,
    });
    console.log('Connexion reussie')

  } catch (error) {
    console.error('Erreur lors de la connexion:', error);
    res.status(500).json({ message: 'Erreur lors de la connexion', error });
  }
});


// Route PUT pour mettre à jour un livre
app.put('/api/books/:id', upload.single('image'), async (req, res) => {
  const { id } = req.params;
  const image = req.file; // Le fichier image, si présent

  try {
    const updateFields = {};

    // Si une image est téléchargée, mettre à jour le champ imageUrl
    if (image) {
      updateFields.imageUrl = `/uploads/${image.filename}`;
    }

    // Si req.body.book existe, cela signifie que le reste des informations du livre est dans req.body.book sous forme de chaîne JSON
    if (req.body.book) {
      const bookData = JSON.parse(req.body.book); // Convertir la chaîne JSON en objet
      Object.assign(updateFields, bookData); // Mettre à jour les champs du livre
    } else {
      // Sinon, les informations du livre se trouvent directement dans req.body
      const { title, author, year, genre, ratings, averageRating } = req.body;
      if (title) updateFields.title = title;
      if (author) updateFields.author = author;
      if (year) updateFields.year = year;
      if (genre) updateFields.genre = genre;
      if (ratings) updateFields.ratings = ratings;
      if (averageRating) updateFields.averageRating = averageRating;
    }

    // Mettre à jour le livre dans la base de données
    const updatedBook = await Book.findByIdAndUpdate(id, updateFields, { new: true });

    if (!updatedBook) {
      return res.status(404).json({ message: 'Livre non trouvé' });
    }

    res.status(200).json({ message: 'Livre mis à jour avec succès', updatedBook });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du livre:', error);
    res.status(500).json({ message: 'Erreur lors de la mise à jour du livre', error });
  }
});

// Exporter l'application
module.exports = app;
