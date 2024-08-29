const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0', // Version OpenAPI
    info: {
      title: 'API Mon vieux grimoire', // Titre de l'API
      version: '1.0.0', // Version de l'API
      description: 'Mon vieux grimoire',
    },
  },
  apis: ['.backend/routes/*.js'], // Chemin vers vos fichiers de route
};

const specs = swaggerJsdoc(options);

const swaggerDocs = (app) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
};

module.exports = swaggerDocs;
