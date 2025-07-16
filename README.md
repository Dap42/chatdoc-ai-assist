# ChatDoc AI Assistant

This project is a full-stack AI assistant application, featuring a React-based frontend and a Python-based backend. It is designed to provide an interactive chat interface,for document-related queries or assistance, leveraging AI capabilities.

hi

## Project Structure

The project is divided into two main parts:

- **`frontend/`**: Contains the user interface built with modern web technologies.
- **`backend/`**: Contains the server-side logic and AI processing components.

## Technologies Used

### Frontend

- **Vite**: A fast build tool for modern web projects.
- **TypeScript**: A superset of JavaScript that adds static typing.
- **React**: A JavaScript library for building user interfaces.
- **shadcn-ui**: A collection of reusable components for React.
- **Tailwind CSS**: A utility-first CSS framework for rapidly building custom designs.

### Backend

- **Python**: The primary programming language for the backend.
- **Flask**: The web framework used for building the API.
- **Flask-CORS**: Used for handling Cross-Origin Resource Sharing.
- **Gunicorn**: A Python WSGI HTTP Server for UNIX, used for deploying Python web applications (indicated by `start_gunicorn.sh` and `Procfile`).
- **Snowflake Libraries**: Integration with Snowflake is present, including `snowflake-snowpark-python`, `snowflake-core`, `snowflake-connector-python`, and `snowflake-sqlalchemy`.
- **Pandas**: A data manipulation and analysis library.
- **SQLAlchemy**: An SQL toolkit and Object-Relational Mapper.

## Local Development Setup

To set up and run the project locally, follow these steps:

### Prerequisites

- **Node.js & npm**: Required for the frontend. It's recommended to install with [nvm](https://github.com/nvm-sh/nvm#installing-and-updating).
- **Python 3.x**: Required for the backend.
- **pip**: Python package installer.

### Step-by-step Guide

1.  **Clone the repository**:

    ```sh
    git clone

    cd chatdoc-ai-assist
    ```

2.  **Backend Setup**:
    Navigate into the `backend` directory, create a virtual environment, install dependencies, and set up environment variables.

    ```sh
    cd backend
    python -m venv venv
    ./venv/Scripts/activate  # On Windows
    # source venv/bin/activate # On macOS/Linux
    pip install -r requirements.txt
    cp .env.example .env # Create a .env file and configure necessary environment variables
    ```

    \*Note: Ensure your `.env` file contains necessary environment variables for Snowflake connection and `FRONTEND_URL`.

3.  **Frontend Setup**:
    Open a new terminal, navigate into the `frontend` directory, and install dependencies.

    ```sh
    cd ../frontend
    npm install
    ```

4.  **Run the Backend Server**:
    From the `backend` directory (where you activated the virtual environment), start the backend server.

    ```sh
    # Ensure your virtual environment is active
    python main.py
    ```

5.  **Run the Frontend Development Server**:
    From the `frontend` directory, start the frontend development server.
    ```sh
    npm run dev
    ```

Now you should have both the frontend and backend running locally, and you can access the application through your web browser.

## Deployment on AWS EC2

To deploy this project on an AWS EC2 instance, you will generally follow these steps:

1.  **Provision an EC2 Instance**: Launch an EC2 instance (e.g., Ubuntu, Amazon Linux) with appropriate security groups configured to allow inbound traffic on ports 80 (HTTP), 443 (HTTPS), and the backend port (e.g., 8000).
2.  **Connect to EC2 Instance**: SSH into your EC2 instance.
3.  **Install Dependencies**:
    - Install Node.js, npm, and Python 3.x, and pip on the EC2 instance.
    - Install a process manager like PM2 (for Node.js) or Supervisor (for Python) to keep your applications running.
    - Install a web server like Nginx or Apache to act as a reverse proxy for both frontend and backend.
4.  **Clone the Repository**: Clone your project repository onto the EC2 instance.
5.  **Backend Deployment**:
    - Navigate to the `backend` directory.
    - Set up a Python virtual environment and install `requirements.txt`.
    - Configure your `.env` file with production-specific environment variables (e.g., Snowflake credentials, `FRONTEND_URL` pointing to your deployed frontend URL).
    - Use Gunicorn to serve the Flask application. You can use the `start_gunicorn.sh` script or a custom systemd service.
6.  **Frontend Deployment**:
    - Navigate to the `frontend` directory.
    - Build the frontend for production: `npm run build`. This will create a `dist` directory.
    - Configure Nginx/Apache to serve the static files from the `frontend/dist` directory.
7.  **Configure Reverse Proxy (Nginx/Apache)**:
    - Set up Nginx or Apache to proxy requests to your backend Gunicorn server (e.g., requests to `/api` go to `http://localhost:8000`).
    - Configure Nginx/Apache to serve the static frontend files.
    - Set up SSL/TLS with Let's Encrypt or your own certificates for HTTPS.
8.  **Start Services**: Start your Nginx/Apache server, Gunicorn process, and any frontend process managers.

This general outline provides a starting point for deploying on AWS EC2. Specific commands and configurations will depend on your chosen operating system and setup preferences.
