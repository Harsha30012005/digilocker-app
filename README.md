# DigiLocker App

## Overview
The **DigiLocker App** is a secure, web-based digital document repository designed to help users store, manage, and access their important documents securely. It provides functionalities for user authentication, document upload, viewing, downloading, deletion, and sharing, aiming to be a personal digital locker for various types of essential files.

## Features
* **Secure User Authentication**: Provides a robust login and registration system to ensure only authorized users can access their documents.
* **Document Management**: Allows users to upload, organize, view, download, and delete their digital documents.
* **Categorization**: Documents can be categorized (e.g., Aadhaar, PAN, Driving License, Education, Medical, Other) for easy organization and retrieval.
* **Storage Statistics**: Users can monitor their total documents and storage usage.
* **Document Sharing**: Functionality to share documents with others securely (though specific sharing mechanisms would need to be implemented/detailed).
* **Responsive User Interface**: Designed with a responsive UI to work across various devices.
* **Search and Filtering**: Enables users to quickly find documents through search and filter by category.

## Technologies Used

### Frontend
* **HTML5**: Structure of the web application.
* **CSS3**: Styling the application, including responsive design elements.
* **JavaScript**: Core logic for UI interactions, authentication, and document management.
    * `ui.js`: Manages overall user interface interactions, section visibility, modals, drag-and-drop, and responsiveness.
    * `auth.js`: Handles user registration, login, session management, and authentication flow.
    * `documents.js`: Manages document-related operations like upload, view, download, delete, share, categorization, and statistics.
    * `storage.js` (inferred): Likely handles client-side data persistence (e.g., localStorage) for user and document data.
* **Font Awesome**: For icons used throughout the application.

### Infrastructure & Deployment
* **Nginx**: Used as a web server to serve the frontend application, as indicated by `nginx.conf`.
* **Docker**: Containerization of the application for consistent deployment environments, indicated by `docker-compose.yml`.
* **Kubernetes**: Orchestration for deploying and managing the frontend application in a scalable manner, as indicated by `k8s-deployment.yaml`.

## Installation and Setup

### Prerequisites
* [**Docker**](https://docs.docker.com/get-docker/): For building and running the application in containers.
* [**Kubernetes CLI (kubectl)**](https://kubernetes.io/docs/tasks/tools/install-kubectl/) (Optional, for Kubernetes deployment): If you plan to deploy to a Kubernetes cluster.

### Local Development (using Docker Compose)

1.  **Clone the repository**:
    ```bash
    git clone [https://github.com/Harsha30012005/digilocker-app.git](https://github.com/Harsha30012005/digilocker-app.git)
    cd digilocker-app
    ```

2.  **Build and run the Docker containers**:
    Use the `docker-compose.yml` file to build the frontend image and start the service.
    ```bash
    docker-compose up --build
    ```
    This will build the Docker image for the frontend (as defined by the `.` build context in `docker-compose.yml`, assuming a `Dockerfile` exists at the root or within the `frontend` directory) and expose it on port `8080`.

3.  **Access the application**:
    Open your web browser and navigate to `http://localhost:8080`.

### Kubernetes Deployment (Optional)

If you intend to deploy to a Kubernetes cluster:

1.  **Build your Docker image**:
    You'll need to build your frontend Docker image and push it to a container registry (e.g., Docker Hub, Google Container Registry).
    ```bash
    # Assuming you have a Dockerfile for your frontend
    docker build -t your-dockerhub-username/digilocker-frontend:latest .
    docker push your-dockerhub-username/digilocker-frontend:latest
    ```
    *(Note: Replace `your-dockerhub-username` with your actual Docker Hub username or registry path.)*

2.  **Update `k8s-deployment.yaml`**:
    Edit `k8s-deployment.yaml` and replace `your-dockerhub-username/digilocker-frontend:latest` with the actual path to your image in line 27.

3.  **Apply Kubernetes manifests**:
    ```bash
    kubectl apply -f k8s-deployment.yaml
    ```
    This will create a Deployment and a LoadBalancer Service for your frontend application. The service will expose your application on port 80.

4.  **Access the application**:
    Once the LoadBalancer provisions an external IP, you can access the application using that IP. You can check the service status with:
    ```bash
    kubectl get service digilocker-frontend-service
    ```

## Project Structure (Inferred)

* `index.html`: Main entry point for the web application.
* `style.css`: Global styles for the application.
* `auth.js`: Handles user authentication logic.
* `documents.js`: Manages document operations.
* `ui.js`: Manages the user interface and interactions.
* `storage.js` (inferred): Likely responsible for local data storage.
* `main.js` (inferred from `index.html`): Likely the main script to initialize the application.
* `nginx.conf`: Nginx configuration for serving the application.
* `docker-compose.yml`: Docker Compose configuration for local development.
* `k8s-deployment.yaml`: Kubernetes deployment and service definitions.
* `.gitignore`: Specifies intentionally untracked files to ignore.
* `counter.js`: (Possibly a test/example file)

## Contributing
Contributions are welcome! Please feel free to fork the repository, make your changes, and submit a pull request.

## License
[Specify your license here, e.g., MIT, Apache 2.0, etc.]

## Contact
For questions or support, please open an issue in this repository.
