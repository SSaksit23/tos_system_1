const express = require('express');
const cors = require('cors');
const Amadeus = require('amadeus');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

const amadeus = new Amadeus({
  clientId: 'Bd76Zxmr3DtsAgSCNVhRlgCzzFDROM07',
  clientSecret: 'Onw33473vAI1CTHS',
  hostname: 'test'
});

app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

app.get('/api/health', (req, res) => {
  console.log('✅ Health check requested');
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    message: 'Tour Operator Backend is running!',
    amadeus_status: 'Client Initialized'
  });
});

app.get('/api/locations/search', async (req, res) => {
  const { keyword } = req.query;
  if (!keyword || keyword.length < 2) {
    return res.status(400).json({ error: 'Keyword must be at least 2 characters long.' });
  }
  try {
    const response = await amadeus.referenceData.locations.get({
      keyword: keyword,
      subType: Amadeus.location.any
    });
    res.json(response.data);
  } catch (error) {
    console.error('Amadeus Location Search Error:', error.description || error);
    res.status(error.response ? error.response.statusCode : 500).json({
      error: 'Failed to fetch locations from Amadeus',
      details: error.description
    });
  }
});

// Updated Flight Offers Search Endpoint
app.post('/api/flights/search', async (req, res) => {
  const {
    originLocationCode,
    destinationLocationCode,
    departureDate,
    adults = 1,
    returnDate, // New: for round trips
    currencyCode, // New: for currency selection
    travelClass
  } = req.body;

  if (!originLocationCode || !destinationLocationCode || !departureDate) {
    return res.status(400).json({ error: 'Origin, Destination, and Departure Date are required.' });
  }

  let searchParams = {
    originLocationCode,
    destinationLocationCode,
    departureDate,
    adults: parseInt(adults, 10),
    max: 10
  };

  // Add returnDate if provided (for round trips)
  if (returnDate) {
    searchParams.returnDate = returnDate;
  }

  // Add currencyCode if provided
  if (currencyCode) {
    searchParams.currencyCode = currencyCode;
  }

  if (travelClass && ['ECONOMY', 'PREMIUM_ECONOMY', 'BUSINESS', 'FIRST'].includes(travelClass.toUpperCase())) {
    searchParams.travelClass = travelClass.toUpperCase();
  }

  try {
    console.log('Amadeus Search Params:', searchParams); // Log parameters sent to Amadeus
    const response = await amadeus.shopping.flightOffersSearch.get(searchParams);
    res.json(response.data);
  } catch (error) {
    console.error('Amadeus Flight Search Error:', error.description || error);
    // Attempt to parse Amadeus error object if available
    let errorDetails = error.description;
    if (error.response && error.response.result && error.response.result.errors) {
        errorDetails = error.response.result.errors.map(e => `${e.title} (status ${e.status}): ${e.detail}`).join(', ');
    }
    res.status(error.response ? error.response.statusCode : 500).json({
      error: 'Failed to fetch flight offers from Amadeus',
      details: errorDetails
    });
  }
});

app.listen(port, '0.0.0.0', () => {
  console.log(`🚀 Backend server running on port ${port}`);
  console.log(`✅ Health check available at http://localhost:${port}/api/health`);
  console.log(`✈️ Amadeus client initialized with your test keys.`);
});