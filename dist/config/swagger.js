"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupSwagger = void 0;
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
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
const swaggerSpec = (0, swagger_jsdoc_1.default)(options);
// Function to Setup Swagger
const setupSwagger = (app) => {
    app.use("/api/docs", swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swaggerSpec));
};
exports.setupSwagger = setupSwagger;
