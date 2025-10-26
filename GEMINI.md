# GEMINI.md

## Project Overview

This is a Node.js e-commerce application for selling doors. It uses the Express framework for the back-end, EJS for templating, and MongoDB for the database. The project is structured with a clear separation of concerns, with dedicated folders for routes, controllers, models, and views. It also includes features like internationalization (i18n), authentication, and product management.

## Building and Running

### Prerequisites

*   Node.js and npm
*   MongoDB

### Installation

1.  Clone the repository.
2.  Install the dependencies:
    ```bash
    npm install
    ```
3.  Create a `.env` file in the root directory and add the following environment variables:
    ```
    MONGODB_URI=<your_mongodb_connection_string>
    PORT=3000
    ```

### Running the Application

*   **Development Mode:**
    ```bash
    npm run dev
    ```
    This will start the server with nodemon, which will automatically restart the server on file changes.

*   **Production Mode:**
    ```bash
    npm start
    ```

*   **Seeding the Database:**
    ```bash
    npm run seed
    ```
    This will populate the database with initial data for products, settings, and admin users.

## Development Conventions

*   **Code Style:** The project follows the standard JavaScript conventions.
*   **Testing:** There are no explicit testing practices evident in the project structure.
*   **Contribution:** There are no contribution guidelines specified.
