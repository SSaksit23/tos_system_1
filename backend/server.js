const express = require('express');
const cors = require('cors');
const Amadeus = require('amadeus');
require('dotenv').config(); // Make sure this is at the very top

const app = express();
const port = process.env.PORT || 5000;

// Initialize Amadeus client from .env variables or fallbacks
const amadeus = new Amadeus({
  clientId: process.env.AMADEUS_CLIENT_ID || 'Bd76Zxmr3DtsAgSCNVhRlgCzzFDROM07',
  clientSecret: process.env.AMADEUS_CLIENT_SECRET || 'Onw33473vAI1CTHS',
  hostname: process.env.AMADEUS_HOSTNAME || 'test' // Default to 'test' if not in .env
});

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'], // Your frontend URL
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json()); // To parse JSON request bodies

// Request logger
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  console.log('✅ Health check requested');
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    message: 'Tour Operator Backend is running!',
    amadeus_status: 'Client Initialized'
  });
});

// Location Search Endpoint (for airport/city autocomplete)
app.get('/api/locations/search', async (req, res) => {
  const { keyword } = req.query;
  if (!keyword || keyword.length < 2) {
    return res.status(400).json({ error: 'Keyword must be at least 2 characters long.' });
  }
  try {
    const response = await amadeus.referenceData.locations.get({
      keyword: keyword,
      subType: Amadeus.location.any // Gets City and Airport
    });
    res.json(response.data);
  } catch (error) {
    console.error('Amadeus Location Search Error (raw):', error);
    let errorDetails = "Failed to fetch locations from Amadeus.";
    let statusCode = 500;
    if (error.response) {
        statusCode = error.response.statusCode || 500;
        errorDetails = error.description || (error.response.result?.errors?.[0]?.detail || "Unknown Amadeus error");
    } else if (error.message) {
        errorDetails = error.message;
    }
    console.error('Formatted Amadeus Location Search Error Details:', errorDetails);
    res.status(statusCode).json({
      error: 'Failed to fetch locations from Amadeus',
      details: errorDetails
    });
  }
});

// Flight Offers Search Endpoint
app.post('/api/flights/search', async (req, res) => {
  const {
    originLocationCode,
    destinationLocationCode,
    departureDate,
    adults = 1,
    returnDate,
    currencyCode,
    travelClass
  } = req.body;

  if (!originLocationCode || !destinationLocationCode || !departureDate) {
    return res.status(400).json({ error: 'Origin, Destination, and Departure Date are required.' });
  }

  let searchParams = {
    originLocationCode: originLocationCode.toUpperCase(),
    destinationLocationCode: destinationLocationCode.toUpperCase(),
    departureDate,
    adults: parseInt(adults, 10),
    max: 10, // Limit number of offers
    // ***** RE-ENABLING 'include' with standard values (array of strings) *****
    // include: [' μέρος'] 
    // These are common values. If Amadeus still rejects, we may need to test them one by one
    // or consult specific Amadeus documentation for Flight Offers Search 'include' options.
  };

  if (returnDate) {
    searchParams.returnDate = returnDate;
  }
  if (currencyCode) {
    searchParams.currencyCode = currencyCode;
  }
  if (travelClass && ['ECONOMY', 'PREMIUM_ECONOMY', 'BUSINESS', 'FIRST'].includes(travelClass.toUpperCase())) {
    searchParams.travelClass = travelClass.toUpperCase();
  }

  try {
    console.log('Amadeus Search Params (sending to SDK):', searchParams);
    const response = await amadeus.shopping.flightOffersSearch.get(searchParams);
    
    res.json(response.result); // Send the entire 'result' object

  } catch (error) {
    console.error('Amadeus Flight Search Error (raw):', error); 
    let errorDetails = "An unexpected error occurred with the Amadeus API.";
    let statusCode = 500;

    if (error.response) { 
        statusCode = error.response.statusCode || 500;
        if (error.response.result && error.response.result.errors && Array.isArray(error.response.result.errors)) {
            errorDetails = error.response.result.errors.map(e => 
                `${e.title || 'Error'} (status ${e.status || statusCode})${e.detail ? ': ' + e.detail : ''}${e.source && e.source.parameter ? ' - Parameter: ' + e.source.parameter : ''}`
            ).join('; ');
        } else if (error.description) {
            errorDetails = error.description;
             if (typeof errorDetails !== 'string' && errorDetails.message) { 
                errorDetails = errorDetails.message;
            } else if (Array.isArray(errorDetails)) { 
                errorDetails = errorDetails.map(e => String(e.detail || e.title || 'Unknown sub-error')).join('; ');
            }
        } else if (error.code === 'DATE_FORMAT') { 
             errorDetails = `Invalid date format. Please use YYYY-MM-DD. Details: ${error.description || error.message}`;
             statusCode = 400;
        } else if (error.message) { 
            errorDetails = error.message;
        }
    } else if (error.message) { 
        errorDetails = error.message;
    }
    
    console.error('Formatted Amadeus Flight Search Error Details for Response:', errorDetails);
    res.status(statusCode).json({
      error: 'Failed to fetch flight offers from Amadeus.',
      details: String(errorDetails) 
    });
  }
});

// Start the server
app.listen(port, '0.0.0.0', () => {
  console.log(`🚀 Backend server running on port ${port}`);
  console.log(`✅ Health check available at http://localhost:${port}/api/health`);
});