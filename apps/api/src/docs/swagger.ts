import { Router, type Request, type Response } from "express";
import swaggerUi from "swagger-ui-express";
import { openApiSpec } from "./openapi.js";

export const docsRouter: Router = Router();

// Expose OpenAPI JSON spec endpoint
docsRouter.get("/openapi.json", (_req: Request, res: Response) => {
  res.setHeader("Content-Type", "application/json");
  res.status(200).send(openApiSpec);
});

// Options for Swagger UI styling and behavior
const swaggerUiOptions: swaggerUi.SwaggerOptions = {
  customCss: ".swagger-ui .topbar { display: none } .swagger-ui .info { margin: 20px 0 }",
  customSiteTitle: "StudentHub REST API Docs",
  swaggerOptions: {
    docExpansion: "list",
    filter: true,
    persistAuthorization: true,
    displayRequestDuration: true,
  },
};

// Mount Swagger UI at /api/docs
docsRouter.use("/docs", swaggerUi.serve, swaggerUi.setup(openApiSpec, swaggerUiOptions));
