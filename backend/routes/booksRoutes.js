const express = require('express');
const upload = require('../middleware/multer-config'); // Importer la configuration multer
const authMiddleware = require('../middleware/auth'); // Importer le middleware d'authentification
const Book = require('../models/Book'); // Importer le modèle Book

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Books
 *   description: API pour gérer les livres
 */

// Route POST pour ajouter un livre
/**
 * @swagger
 * /api/books:
 *   post:
 *     summary: Ajouter un nouveau livre
 *     description: Créer un nouveau livre
 *     tags: [Books]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: The Great Gatsby
 *               author:
 *                 type: string
 *                 example: F. Scott Fitzgerald
 *               year:
 *                 type: number
 *                 example: 1925
 *               genre:
 *                 type: string
 *                 example: Fiction
 *               imageUrl:
 *                 type: string
 *                 example: https://via.placeholder.com/206x260
 *     responses:
 *       200:
 *         description: Livre créé avec succès
 *       400:
 *         description: Invalid input
 */
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
/**
 * @swagger
 * /api/books:
 *   get:
 *     summary: Récupère tous les livres
 *     description: Retourne une liste de livres.
 *     tags: [Books]
 *     responses:
 *       200:
 *         description: A list of books
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     example: "4"
 *                   userId:
 *                     type: string
 *                     example: "1"
 *                   title:
 *                     type: string
 *                     example: "Milwaukee Mission"
 *                   author:
 *                     type: string
 *                     example: "Elder Cooper"
 *                   imageUrl:
 *                     type: string
 *                     example: "https://via.placeholder.com/206x260"
 *                   year:
 *                     type: number
 *                     example: 2021
 *                   genre:
 *                     type: string
 *                     example: "Policier"
 *                   ratings:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         userId:
 *                           type: string
 *                           example: "1"
 *                         grade:
 *                           type: number
 *                           example: 5
 *                   averageRating:
 *                     type: number
 *                     example: 4.5
 *       500:
 *         description: Internal server error
 */

router.get('/', async (req, res) => {
  try {
    const books = await Book.find(); // Récupérer tous les livres depuis MongoDB
    res.status(200).json(books); // Renvoyer les livres en tant que réponse JSON
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération des livres' });
  }
});

// Route GET pour récupérer les 3 livres avec la meilleure note moyenne
/**
 * @swagger
 * /api/books/bestrating:
 *   get:
 *     summary: TOP 3 des meilleurs notes
 *     description: Retrieve a list of the top 3 books with the highest average ratings.
 *     tags: [Books]
 *     responses:
 *       200:
 *         description: A list of the top 3 books with the highest average ratings
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     example: "4"
 *                   userId:
 *                     type: string
 *                     example: "1"
 *                   title:
 *                     type: string
 *                     example: "Milwaukee Mission"
 *                   author:
 *                     type: string
 *                     example: "Elder Cooper"
 *                   imageUrl:
 *                     type: string
 *                     example: "https://via.placeholder.com/206x260"
 *                   year:
 *                     type: number
 *                     example: 2021
 *                   genre:
 *                     type: string
 *                     example: "Policier"
 *                   ratings:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         userId:
 *                           type: string
 *                           example: "1"
 *                         grade:
 *                           type: number
 *                           example: 5
 *                   averageRating:
 *                     type: number
 *                     example: 4.5
 *       500:
 *         description: Internal server error
 */

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
/**
 * @swagger
 * /api/books/{id}:
 *   get:
 *     summary: Récupère un livre par rapport à une ID
 *     description: Retourne livre par rapport à l'ID.
 *     tags: [Books]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the book to retrieve
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: The book with the specified ID
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   example: "4"
 *                 userId:
 *                   type: string
 *                   example: "1"
 *                 title:
 *                   type: string
 *                   example: "Milwaukee Mission"
 *                 author:
 *                   type: string
 *                   example: "Elder Cooper"
 *                 imageUrl:
 *                   type: string
 *                   example: "https://via.placeholder.com/206x260"
 *                 year:
 *                   type: number
 *                   example: 2021
 *                 genre:
 *                   type: string
 *                   example: "Policier"
 *                 ratings:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       userId:
 *                         type: string
 *                         example: "1"
 *                       grade:
 *                         type: number
 *                         example: 5
 *                 averageRating:
 *                   type: number
 *                   example: 4.5
 *       404:
 *         description: Book not found
 *       500:
 *         description: Internal server error
 */

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
/**
 * @swagger
 * /api/books/{id}:
 *   put:
 *     summary: MAJ livre
 *     description: Update the details of a book if the current user is the creator.
 *     tags: [Books]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the book to update
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: "The Great Gatsby"
 *               author:
 *                 type: string
 *                 example: "F. Scott Fitzgerald"
 *               year:
 *                 type: number
 *                 example: 1925
 *               genre:
 *                 type: string
 *                 example: "Fiction"
 *               imageUrl:
 *                 type: string
 *                 example: "https://via.placeholder.com/206x260"
 *     responses:
 *       200:
 *         description: The updated book
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   example: "4"
 *                 userId:
 *                   type: string
 *                   example: "1"
 *                 title:
 *                   type: string
 *                   example: "The Great Gatsby"
 *                 author:
 *                   type: string
 *                   example: "F. Scott Fitzgerald"
 *                 imageUrl:
 *                   type: string
 *                   example: "https://via.placeholder.com/206x260"
 *                 year:
 *                   type: number
 *                   example: 1925
 *                 genre:
 *                   type: string
 *                   example: "Fiction"
 *                 ratings:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       userId:
 *                         type: string
 *                         example: "1"
 *                       grade:
 *                         type: number
 *                         example: 5
 *                 averageRating:
 *                   type: number
 *                   example: 4.5
 *       403:
 *         description: Unauthorized request
 *       404:
 *         description: Book not found
 *       500:
 *         description: Internal server error
 */

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
  /**
 * @swagger
 * /api/books/{id}:
 *   delete:
 *     summary: Suppression livre
 *     description: Delete a specific book if the current user is the creator.
 *     tags: [Books]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the book to delete
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Book deleted successfully
 *       403:
 *         description: Unauthorized request
 *       404:
 *         description: Book not found
 *       500:
 *         description: Internal server error
 */

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

/**
 * @swagger
 * /api/books/{id}/rating:
 *   post:
 *     summary: Noter un livre
 *     description: Add a rating to a book if the user hasn't already rated it.
 *     tags: [Books]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the book to rate
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *                 example: "1"
 *               rating:
 *                 type: number
 *                 example: 4
 *     responses:
 *       200:
 *         description: Rating added successfully
 *       403:
 *         description: User has already rated this book
 *       404:
 *         description: Book not found
 *       500:
 *         description: Internal server error
 */

router.post('/:id/rating', authMiddleware, async (req, res) => {
  const { userId, rating } = req.body;
  const bookId = req.params.id;

  try {
    const book = await Book.findById(bookId);

    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    // Vérifiez si l'utilisateur a déjà noté ce livre
    const existingRating = book.ratings.find(r => r.userId === userId);
    if (existingRating) {
      return res.status(400).json({ message: 'You have already rated this book' });
    }

    // Ajoutez la nouvelle note
    book.ratings.push({ userId, grade: rating });

    // Recalculer la moyenne
    if (book.ratings.length > 0) {
      const totalRating = book.ratings.reduce((acc, curr) => acc + curr.grade, 0);
      console.log('total rating', totalRating);
      console.log('Book rating', book.ratings.length)
      book.averageRating = totalRating / book.ratings.length;

    } else {
      book.averageRating = 0;
    }

    await book.save();
    res.json(book);
  } catch (error) {
    res.status(500).json({ message: 'Error updating rating', error: error.message });
  }
});




module.exports = router;
