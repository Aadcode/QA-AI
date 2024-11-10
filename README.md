# Q&A Backend Service

This backend service allows users to upload PDF files, ask questions based on the content, and receive AI-generated responses. The project uses Express.js, Prisma ORM, WebSocket (Socket.IO), and integrates AI for question answering.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [Folder Structure](#folder-structure)
- [API Endpoints](#api-endpoints)
- [Technologies Used](#technologies-used)

## Prerequisites

Make sure you have the following installed:

- **Node.js** (v14 or higher)
- **PostgreSQL** (for database)
- **Docker** (optional, for containerized setup)
- **Git**

## Installation

1. **Clone the repository:**

   ```bash
   https://github.com/Aadcode/QA-AI.git
   cd QA-AI.git
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Set up the database:**

   - Create a PostgreSQL database for this application.
   - Update the database connection string in the `.env` file (see Configuration section).

4. **Run Prisma migrations:**
   ```bash
   npx prisma migrate dev
   ```

## Configuration

Create a `.env` file in the root of the project and add the following variables:

```plaintext
DATABASE_URL="postgresql://user:password@localhost:5432/yourdatabase"

```

### Optional Configuration

If using AI integration for Q&A responses:

```plaintext
AI_API_KEY=your_ai_api_key
```

## Running the Application

1. **Start the server:**

   ```bash
   npm run dev
   ```

2. The application will be running on `http://localhost:5000`.

## Folder Structure

```plaintext
.
├── public
│   └── pdfs                 # Folder to store uploaded PDF files
├── src
│   ├── controllers          # Route handlers for upload, question-answer, etc.
│   ├── db                   # Database connection setup with Prisma
│   ├── models               # Prisma models and schema
│   ├── routes               # API routes
│   ├── utils                # Utility functions (e.g., for PDF parsing)
│   └── index.js             # Main entry point of the server
├── prisma
│   └── schema.prisma        # Prisma schema file
└── README.md
```

## API Endpoints

- `POST /upload`: Endpoint to upload PDF files.
- `POST /ask`: Endpoint to ask questions based on the content of uploaded PDF files.
- `GET /files`: Retrieve a list of uploaded files.

## Technologies Used

- **Express.js**: Backend framework for building API endpoints.
- **Prisma**: ORM for database management with PostgreSQL.
- **Socket.IO**: WebSocket for real-time question and answer functionality.
- **pdf-parse**: Library for extracting text from PDF files.
- **Multer**: Middleware for handling file uploads.

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
