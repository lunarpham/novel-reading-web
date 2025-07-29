import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { Express } from "express";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Wattpad Clone API",
      version: "1.0.0",
      description:
        "A comprehensive API for a Wattpad-like story sharing platform",
      contact: {
        name: "API Support",
        email: "support@wattpadclone.com",
      },
      license: {
        name: "ISC",
        url: "https://opensource.org/licenses/ISC",
      },
    },
    servers: [
      {
        url: "http://localhost:3000",
        description: "Development server",
      },
      {
        url: "https://api.wattpadclone.com",
        description: "Production server",
      },
    ],
    paths: {
      "/api/auth/register": {
        post: {
          summary: "Register a new user",
          description:
            "Create a new user account with email, username, display name, and password",
          tags: ["Authentication"],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/RegisterRequest",
                },
                examples: {
                  example1: {
                    summary: "Sample registration data",
                    value: {
                      email: "john.doe@example.com",
                      username: "john_doe",
                      displayName: "John Doe",
                      password: "Password123!",
                      bio: "Passionate writer and reader",
                      dateOfBirth: "1995-03-15T00:00:00.000Z",
                      gender: "Male",
                    },
                  },
                },
              },
            },
          },
          responses: {
            201: {
              description: "User registered successfully",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/AuthResponse",
                  },
                },
              },
            },
            400: {
              description: "Validation error",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/ErrorResponse",
                  },
                },
              },
            },
            409: {
              description: "User already exists",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/ErrorResponse",
                  },
                },
              },
            },
            500: {
              description: "Internal server error",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/ErrorResponse",
                  },
                },
              },
            },
          },
        },
      },
      "/api/auth/login": {
        post: {
          summary: "Login user",
          description: "Authenticate user with email and password",
          tags: ["Authentication"],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/LoginRequest",
                },
                examples: {
                  example1: {
                    summary: "Sample login data",
                    value: {
                      email: "john.doe@example.com",
                      password: "Password123!",
                    },
                  },
                },
              },
            },
          },
          responses: {
            200: {
              description: "Login successful",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/AuthResponse",
                  },
                },
              },
            },
            400: {
              description: "Validation error",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/ErrorResponse",
                  },
                },
              },
            },
            401: {
              description: "Invalid credentials",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/ErrorResponse",
                  },
                },
              },
            },
            403: {
              description: "Account restricted",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/ErrorResponse",
                  },
                },
              },
            },
            500: {
              description: "Internal server error",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/ErrorResponse",
                  },
                },
              },
            },
          },
        },
      },
      "/health": {
        get: {
          summary: "Health check endpoint",
          description: "Check if the server is running and healthy",
          tags: ["System"],
          responses: {
            200: {
              description: "Server is healthy",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: {
                        type: "boolean",
                        example: true,
                      },
                      message: {
                        type: "string",
                        example: "Server is healthy",
                      },
                      timestamp: {
                        type: "string",
                        format: "date-time",
                        example: "2024-07-24T10:30:00.000Z",
                      },
                      version: {
                        type: "string",
                        example: "1.0.0",
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      "/": {
        get: {
          summary: "API root endpoint",
          description: "Welcome message and API information",
          tags: ["System"],
          responses: {
            200: {
              description: "API welcome message",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: {
                        type: "boolean",
                        example: true,
                      },
                      message: {
                        type: "string",
                        example: "Welcome to Wattpad Clone API",
                      },
                      documentation: {
                        type: "string",
                        example: "/api-docs",
                      },
                      health: {
                        type: "string",
                        example: "/health",
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    components: {
      securitySchemes: {
        BearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Enter JWT token",
        },
      },
      schemas: {
        User: {
          type: "object",
          properties: {
            id: {
              type: "integer",
              description: "Unique user identifier",
              example: 1,
            },
            email: {
              type: "string",
              format: "email",
              description: "User email address",
              example: "user@example.com",
            },
            username: {
              type: "string",
              description: "Unique username",
              example: "john_doe",
            },
            displayName: {
              type: "string",
              description: "User display name",
              example: "John Doe",
            },
            role: {
              type: "string",
              enum: ["user", "admin"],
              description: "User role",
              example: "user",
            },
            bio: {
              type: "string",
              nullable: true,
              description: "User biography",
              example: "Passionate writer and reader",
            },
            dateOfBirth: {
              type: "string",
              format: "date-time",
              nullable: true,
              description: "User date of birth",
              example: "1995-03-15T00:00:00.000Z",
            },
            avatarUrl: {
              type: "string",
              nullable: true,
              description: "User avatar URL",
              example: "https://example.com/avatar.jpg",
            },
            gender: {
              type: "string",
              nullable: true,
              description: "User gender",
              example: "Male",
            },
            isRestricted: {
              type: "boolean",
              description: "Whether user account is restricted",
              example: false,
            },
            createdAt: {
              type: "string",
              format: "date-time",
              description: "Account creation timestamp",
              example: "2024-01-01T00:00:00.000Z",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
              description: "Account last update timestamp",
              example: "2024-01-01T00:00:00.000Z",
            },
          },
          required: ["id", "email", "username", "displayName", "role"],
        },
        Story: {
          type: "object",
          properties: {
            id: {
              type: "integer",
              description: "Unique story identifier",
              example: 1,
            },
            title: {
              type: "string",
              description: "Story title",
              example: "The Enchanted Forest Chronicles",
            },
            description: {
              type: "string",
              nullable: true,
              description: "Story description",
              example: "A magical adventure about a young girl...",
            },
            authorId: {
              type: "integer",
              description: "Story author ID",
              example: 1,
            },
            status: {
              type: "string",
              enum: ["on_going", "completed", "hiatus", "cancelled"],
              description: "Story status",
              example: "on_going",
            },
            cover: {
              type: "string",
              nullable: true,
              description: "Story cover image URL",
              example: "https://example.com/cover.jpg",
            },
            tags: {
              type: "array",
              items: {
                type: "string",
                enum: [
                  "action",
                  "adult",
                  "romance",
                  "scifi",
                  "fantasy",
                  "mystery",
                  "teen",
                  "tragedy",
                  "comedy",
                  "horror",
                ],
              },
              description: "Story tags",
              example: ["fantasy", "teen", "action"],
            },
            wordCount: {
              type: "integer",
              description: "Total word count",
              example: 25000,
            },
            publishedAt: {
              type: "string",
              format: "date-time",
              nullable: true,
              description: "Story publication timestamp",
              example: "2024-01-15T00:00:00.000Z",
            },
            createdAt: {
              type: "string",
              format: "date-time",
              description: "Story creation timestamp",
              example: "2024-01-01T00:00:00.000Z",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
              description: "Story last update timestamp",
              example: "2024-01-01T00:00:00.000Z",
            },
          },
          required: ["id", "title", "authorId", "status"],
        },
        Chapter: {
          type: "object",
          properties: {
            id: {
              type: "integer",
              description: "Unique chapter identifier",
              example: 1,
            },
            sortIndex: {
              type: "integer",
              description: "Chapter order in story",
              example: 1,
            },
            title: {
              type: "string",
              nullable: true,
              description: "Chapter title",
              example: "Chapter 1: The Journey Begins",
            },
            content: {
              type: "string",
              description: "Chapter content",
              example: "This is the content of the chapter...",
            },
            storyId: {
              type: "integer",
              description: "Parent story ID",
              example: 1,
            },
            authorId: {
              type: "integer",
              description: "Chapter author ID",
              example: 1,
            },
            wordCount: {
              type: "integer",
              description: "Chapter word count",
              example: 2500,
            },
            createdAt: {
              type: "string",
              format: "date-time",
              description: "Chapter creation timestamp",
              example: "2024-01-01T00:00:00.000Z",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
              description: "Chapter last update timestamp",
              example: "2024-01-01T00:00:00.000Z",
            },
          },
          required: ["id", "sortIndex", "content", "storyId", "authorId"],
        },
        LoginRequest: {
          type: "object",
          properties: {
            email: {
              type: "string",
              format: "email",
              description: "User email",
              example: "user@example.com",
            },
            password: {
              type: "string",
              description: "User password",
              example: "Password123!",
            },
          },
          required: ["email", "password"],
        },
        RegisterRequest: {
          type: "object",
          properties: {
            email: {
              type: "string",
              format: "email",
              description: "User email",
              example: "user@example.com",
            },
            username: {
              type: "string",
              description: "Unique username",
              example: "john_doe",
            },
            displayName: {
              type: "string",
              description: "User display name",
              example: "John Doe",
            },
            password: {
              type: "string",
              description:
                "User password (min 8 chars, must contain uppercase, lowercase, number, and special character)",
              example: "Password123!",
            },
            bio: {
              type: "string",
              nullable: true,
              description: "User biography",
              example: "Passionate writer and reader",
            },
            dateOfBirth: {
              type: "string",
              format: "date-time",
              nullable: true,
              description: "User date of birth",
              example: "1995-03-15T00:00:00.000Z",
            },
            gender: {
              type: "string",
              nullable: true,
              description: "User gender",
              example: "Male",
            },
          },
          required: ["email", "username", "displayName", "password"],
        },
        AuthResponse: {
          type: "object",
          properties: {
            success: {
              type: "boolean",
              description: "Operation success status",
              example: true,
            },
            message: {
              type: "string",
              description: "Response message",
              example: "Login successful",
            },
            data: {
              type: "object",
              properties: {
                user: {
                  $ref: "#/components/schemas/User",
                },
                accessToken: {
                  type: "string",
                  description: "JWT access token",
                  example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                },
                refreshToken: {
                  type: "string",
                  description: "JWT refresh token",
                  example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                },
                expiresIn: {
                  type: "integer",
                  description: "Token expiration time in seconds",
                  example: 3600,
                },
              },
            },
          },
        },
        ErrorResponse: {
          type: "object",
          properties: {
            success: {
              type: "boolean",
              description: "Operation success status",
              example: false,
            },
            message: {
              type: "string",
              description: "Error message",
              example: "Invalid email or password",
            },
            error: {
              type: "string",
              description: "Detailed error information",
              example: "Authentication failed",
            },
            errors: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  field: {
                    type: "string",
                    example: "email",
                  },
                  message: {
                    type: "string",
                    example: "Invalid email format",
                  },
                },
              },
              description: "Validation errors",
            },
          },
        },
      },
    },
    security: [
      {
        BearerAuth: [],
      },
    ],
  },
  apis: [], // Remove this since we're defining everything in the config
};

const specs = swaggerJsdoc(options);

export const setupSwagger = (app: Express): void => {
  app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(specs, {
      explorer: true,
      customCss: ".swagger-ui .topbar { display: none }",
      customSiteTitle: "Wattpad Clone API Documentation",
    })
  );

  // Serve the raw swagger.json
  app.get("/api-docs.json", (req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.send(specs);
  });
};

export default specs;
