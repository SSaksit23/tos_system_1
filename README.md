Tour Operator System
A web application for searching flight offers, designed for tour operators or travel enthusiasts. This system integrates with the Amadeus Self-Service Travel APIs to provide real-time flight data and allows users to search for one-way or round-trip flights with currency selection. The entire application is containerized using Docker for easy setup and deployment.

Features
Flight Search:
Search for one-way and round-trip flights.
Specify origin and destination (using IATA codes).
Select departure and return dates.
Specify the number of adult passengers.
Currency Selection: Choose the currency for displaying flight prices (e.g., EUR, USD, GBP, THB).
Amadeus API Integration: Fetches live flight data from the Amadeus Self-Service API.
Dockerized: Frontend and Backend applications are containerized for consistent environments and easy deployment.
API Backend: Built with Node.js and Express.
React Frontend: Interactive user interface built with React.
Tech Stack
Frontend: React, Axios
Backend: Node.js, Express.js
API: Amadeus Self-Service Travel APIs
Containerization: Docker, Docker Compose
Environment Management: dotenv
Prerequisites
Before you begin, ensure you have the following installed:

Docker
Docker Compose (usually included with Docker Desktop)
Git (for cloning the repository)
An Amadeus for Developers Account to get your API Key and Secret.
Project Setup
Clone the Repository:

git clone [https://github.com/your-username/your-repository-name.git](https://github.com/your-username/your-repository-name.git)
cd your-repository-name
(Replace your-username/your-repository-name with your actual GitHub repository details)

Amadeus API Keys Configuration: This project requires API keys from Amadeus for Developers.

Navigate to the backend directory:
cd backend
Create a .env file by copying the example (or creating it new):
# If you have a .env.example file, you can copy it:
# cp .env.example .env
# Otherwise, create a new .env file:
touch .env
Open the backend/.env file and add your Amadeus API credentials:
# backend/.env

AMADEUS_CLIENT_ID=YOUR_AMADEUS_API_KEY
AMADEUS_CLIENT_SECRET=YOUR_AMADEUS_API_SECRET
PORT=5000
Replace YOUR_AMADEUS_API_KEY and YOUR_AMADEUS_API_SECRET with your actual keys obtained from the Amadeus developer portal.
Return to the project root directory:
cd ..
Build and Run with Docker: From the project root directory (where docker-compose.yml is located), run the following commands:

To build the Docker images and start the containers in detached mode:
docker-compose up --build -d
To stop the containers:
docker-compose down
To view logs for a specific service (e.g., backend):
docker-compose logs -f backend
Or for the frontend:
docker-compose logs -f frontend
Usage
Once the Docker containers are up and running (after docker-compose up --build -d):

Open your web browser and navigate to http://localhost:3000 to access the frontend application.
The backend API will be accessible at http://localhost:5000.
Searching for Flights:

The application will first check the backend connection status.
Select the Trip Type (One-Way or Round Trip).
Choose your preferred Currency.
Enter the Origin and Destination IATA codes (e.g., MAD for Madrid, LHR for London).
Select the Departure Date.
If "Round Trip" is selected, also select the Return Date.
Specify the number of Adults.
Click the "Search Flights" button.
Flight offers will be displayed below the form, or an error message if the search fails.
Project Directory Structure
