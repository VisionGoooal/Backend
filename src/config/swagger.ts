import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { Express } from "express";

// Swagger Definition
const swaggerDefinition = {
  openapi: "3.0.0",
  info: {
    title: "VisionGoal API",
    version: "1.0.0",
    description: "API documentation for VisionGoal - AI-powered football predictions",
  },
  servers: [
    {
      url: "http://localhost:5000",
      description: "Local Development Server",
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
  },
  security: [{ bearerAuth: [] }],
};

// Options for Swagger
const options = {
  swaggerDefinition,
  apis: ["./src/routes/*.ts"], // Scan all routes for Swagger documentation
};

const swaggerSpec = swaggerJSDoc(options);

// Function to Setup Swagger
export const setupSwagger = (app: Express) => {
  app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
};