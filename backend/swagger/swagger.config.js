const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Every Nation Education API",
      version: "1.0.0",
      description: "API documentation for Every Nation Education Backend. This API includes REST endpoints and Socket.IO for real-time chat functionality. For Socket.IO events and real-time messaging documentation, see API_DOCUMENTATION_CHAT.md",
      contact: {
        name: "API Support",
        email: "support@example.com",
      },
    },
    servers: [
      {
        url: process.env.API_URL || "https://ljs0r9k3-8000.asse.devtunnels.ms",
        description: "Tunnel server",
      },
      {
        url: process.env.API_URL || "http://localhost:8000",
        description: "Development server",
      },
      {
        url: "https://api.example.com",
        description: "Production server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Enter JWT token",
        },
      },
      schemas: require("./schemas/schemas"),
    },
    tags: [
      {
        name: "Authentication",
        description: "User authentication and authorization endpoints",
      },
      {
        name: "Admin Authentication",
        description: "Admin authentication and authorization endpoints",
      },
      {
        name: "Admin Dashboard",
        description: "Admin dashboard statistics and overview endpoints",
      },
      {
        name: "Admin Users",
        description: "Admin user management endpoints",
      },
      {
        name: "Admin Pastor Requests",
        description: "Admin pastor request management endpoints",
      },
      {
        name: "Admin Follow-Up Requests",
        description: "Admin follow-up request management endpoints",
      },
      {
        name: "Admin Churches",
        description: "Admin church management endpoints",
      },
      {
        name: "Admin Prayer Requests",
        description: "Admin prayer request management endpoints",
      },
      {
        name: "Churches",
        description: "Church management endpoints",
      },
      {
        name: "Events",
        description: "Event management endpoints",
      },
      {
        name: "Notes",
        description: "Bible notes and highlights management endpoints",
      },
      {
        name: "Prayer Requests",
        description: "Prayer request management endpoints",
      },
      {
        name: "Chat",
        description: "User-Admin chat endpoints. Note: Real-time messaging is handled via Socket.IO. See API_DOCUMENTATION_CHAT.md for Socket.IO events documentation.",
      },
      {
        name: "Admin Videos",
        description: "Admin video management endpoints",
      },
      {
        name: "Videos",
        description: "Video viewing endpoints for users",
      },
      {
        name: "Health",
        description: "Health check endpoints",
      },
    ],
  },
  apis: ["./swagger/paths/*.js", "./swagger/schemas/*.js"],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
