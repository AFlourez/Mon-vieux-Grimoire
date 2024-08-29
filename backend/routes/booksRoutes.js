const express = require('express');
const upload = require('../middleware/multer-config'); // Importer la configuration multer
const authMiddleware = require('../middleware/auth'); // Importer le middleware d'authentification
const Book = require('../models/Book'); // Importer le modèle Book

const router = express.Router();

// Route POST pour ajouter un livre
router.post('/', authMiddleware, upload.single('image'), (req, res) => {
  console.log('Requête reçue:', req.body);
  console.log('Fichier reçu:', req.file);

  let bookData;

  try {
      // Convertir les données JSON du livre en objet JavaScript
      bookData = JSON.parse(req.body.book);
  } catch (error) {
      return res.status(400).json({ message: 'Erreur dans les données du livre', error: error.message });
  }

  // Ajouter l'URL de l'image si elle est présente
  if (req.file) {
      bookData.imageUrl = `/uploads/${req.file.filename}`;
  }

  const book = new Book({
      ...bookData,
      userId: req.userId // Ajoute l'ID de l'utilisateur au livre
  });

  book.save()
      .then(() => res.status(201).json({ message: 'Livre enregistré !' }))
      .catch(error => {
          console.error('Erreur lors de la sauvegarde:', error);
          res.status(400).json({ error });
      });
});
  

// Route GET pour récupérer tous les livres
router.get('/', async (req, res) => {
  try {
    const books = await Book.find(); // Récupérer tous les livres depuis MongoDB
    res.status(200).json(books); // Renvoyer les livres en tant que réponse JSON
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération des livres' });
  }
});

// Route GET pour récupérer les 3 livres avec la meilleure note moyenne
router.get('/bestrating', async (req, res) => {
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
router.get('/:id', (req, res) => {
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

// Route PUT pour mettre à jour un livre
router.put('/:id', upload.single('image'), async (req, res) => {
    const { id } = req.params;
    const image = req.file; // Le fichier image, si présent
  
    console.log('ID:', id);
    console.log('Fichier reçu:', image);
    console.log('Corps de la requête:', req.body);
    
    try {
      const updateFields = {};
  
      // Si une image est téléchargée, mettre à jour le champ imageUrl
      if (image) {
        updateFields.imageUrl = `/uploads/${image.filename}`;
      }
  
      // Mettre à jour les champs du livre
      if (req.body.book) {
        const bookData = JSON.parse(req.body.book);
        Object.assign(updateFields, bookData);
      } else {
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
      console.error('Erreur lors de la mise à jour du livre:', error.message);
      res.status(500).json({ message: 'Erreur lors de la mise à jour du livre', error: error.message });
    }
  });

  // Route DELETE pour supprimer un livre
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
      const bookId = req.params.id;
      const userId = req.userId; // ID de l'utilisateur extrait du middleware d'authentification

      // Rechercher le livre par ID
      const book = await Book.findById(bookId);

      if (!book) {
          return res.status(404).json({ message: 'Livre non trouvé' });
      }

      // Vérifier si l'utilisateur est le créateur du livre
      if (book.userId.toString() !== userId) {
          return res.status(403).json({ message: 'Accès refusé. Vous ne pouvez supprimer que vos propres livres.' });
      }

      // Supprimer le livre
      await Book.findByIdAndDelete(bookId);

      res.status(200).json({ message: 'Livre supprimé avec succès' });
  } catch (error) {
      console.error('Erreur lors de la suppression du livre:', error.message);
      res.status(500).json({ message: 'Erreur lors de la suppression du livre', error: error.message });
  }
});

// Route PUT pour ajouter ou mettre à jour la note
router.post('/:id/rating', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { userId, rating } = req.body;

  console.log('Données reçues:', { userId, rating });

  if (typeof rating !== 'number' || rating < 1 || rating > 5) {
    return res.status(400).json({ message: 'La note doit être un nombre entre 1 et 5.' });
  }

  try {
    const book = await Book.findById(id);

    if (!book) {
      return res.status(404).json({ message: 'Livre non trouvé' });
    }

    const existingRatingIndex = book.ratings.findIndex(r => r.userId === userId);
    
    if (existingRatingIndex !== -1) {
      return res.status(400).json({ message: 'Vous avez déjà noté ce livre.' });
    }

    book.ratings.push({ userId, grade: rating });

    const totalRatings = book.ratings.length;
    const sumRatings = book.ratings.reduce((sum, rating) => sum + rating.grade, 0);
    book.averageRating = sumRatings / totalRatings;

    await book.save();

    res.status(200).json(book);
  } catch (error) {
    console.error('Erreur lors de l\'ajout de la note:', error);
    res.status(500).json({ message: 'Erreur lors de l\'ajout de la note', error: error.message });
  }
});


module.exports = router;
