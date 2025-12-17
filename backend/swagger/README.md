# Swagger Documentation

This folder contains all Swagger/OpenAPI documentation for the Every Nation Education API.

## Folder Structure

```
swagger/
├── swagger.config.js          # Main Swagger configuration file
├── paths/                     # API endpoint definitions
│   ├── auth.paths.js         # Authentication endpoints
│   ├── church.paths.js       # Church management endpoints
│   ├── event.paths.js        # Event management endpoints
│   ├── note.paths.js         # Bible notes endpoints
│   ├── prayerRequest.paths.js # Prayer request endpoints
│   └── health.paths.js       # Health check endpoints
└── schemas/                   # Data model schemas
    └── schemas.js            # All request/response schemas
```

## How It Works

1. **swagger.config.js**: Main configuration file that sets up OpenAPI 3.0 specification, includes server URLs, security schemes, tags, and references to path and schema files.

2. **paths/**: Contains separate files for each API section. Each file uses JSDoc comments with `@swagger` annotations to define endpoints.

3. **schemas/**: Contains all data models, request bodies, and response schemas used across the API documentation.

## Accessing the Documentation

Once the server is running, you can access the Swagger UI at:
- **Local**: http://localhost:8000/api-docs
- **Production**: https://your-domain.com/api-docs

## Adding New Endpoints

1. Add the endpoint definition in the appropriate file in `paths/` folder
2. If you need new schemas, add them to `schemas/schemas.js`
3. Reference the schema in your endpoint definition using `$ref: '#/components/schemas/SchemaName'`

## Example Endpoint Definition

```javascript
/**
 * @swagger
 * /api/v2/example:
 *   get:
 *     summary: Example endpoint
 *     tags: [Example]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success response
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ExampleResponse'
 */
```

## Security

Most endpoints require JWT authentication. Use the "Authorize" button in Swagger UI to add your Bearer token.

