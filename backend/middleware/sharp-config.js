const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const resizeImage = async (req, res, next) => {
  if (!req.file) {
    console.log('Aucun fichier reçu.');
    return next();
  }

  const filePath = path.join(__dirname, '../uploads', req.file.filename);
  const outputFilePath = path.join(__dirname, '../uploads', 'resized-' + path.parse(req.file.filename).name + '.webp');

  console.log('Chemin du fichier original:', filePath);
  console.log('Chemin du fichier redimensionné:', outputFilePath);

  try {
    await sharp(filePath)
      .resize(206, 260) // Redimensionne l'image
      .toFormat('webp') // Convertit l'image en WebP
      .toFile(outputFilePath); // Enregistre l'image redimensionnée et convertie

    // Supprimer l'image originale
    fs.unlinkSync(filePath);

    // Met à jour le chemin de l'image dans req.file
    req.file.filename = 'resized-' + path.parse(req.file.filename).name + '.webp';
    req.file.path = outputFilePath;

    next();
  } catch (error) {
    console.error('Erreur lors du redimensionnement ou de la conversion de l\'image:', error);
    res.status(500).json({ message: 'Erreur lors du traitement de l\'image', error: error.message });
  }
};

module.exports = resizeImage;
