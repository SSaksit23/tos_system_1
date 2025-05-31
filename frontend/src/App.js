import React, { useState, useEffect } from 'react';
import axios from 'axios';
import GoogleMapComponent from './GoogleMapComponent'; // Your Google Maps component

// Import react-bootstrap components
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import Alert from 'react-bootstrap/Alert';
import Spinner from 'react-bootstrap/Spinner';
import Badge from 'react-bootstrap/Badge';

// Note: Bootstrap CSS should be imported once globally, e.g., in src/index.js
// import 'bootstrap/dist/css/bootstrap.min.css'; 

const CURRENCIES = ['EUR', 'USD', 'GBP', 'THB', 'JPY', 'CAD', 'AUD'];

// --- This is the SINGLE, COMPLETE App function definition ---
function App() {
  // State variables
  const [backendMessage, setBackendMessage] = useState('Checking backend connection...');
  const [isBackendConnected, setIsBackendConnected] = useState(false);

  const [tripType, setTripType] = useState('oneWay');
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [departureDate, setDepartureDate] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [adults, setAdults] = useState(1);
  const [currency, setCurrency] = useState('THB');
  
  const [flightOffers, setFlightOffers] = useState([]);
  const [dictionaries, setDictionaries] = useState(null); 
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Health check for backend
  useEffect(() => {
    axios.get('http://localhost:5000/api/health')
      .then(response => {
        setBackendMessage(`Backend: ${response.data.message} ✅`);
        setIsBackendConnected(true);
      })
      .catch(err => {
        console.error('Backend connection error:', err);
        setBackendMessage('Backend connection failed ❌ - Check console and ensure backend is running.');
        setIsBackendConnected(false);
      });
  }, []);

  // Flight search handler
  const handleFlightSearch = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setFlightOffers([]);
    setDictionaries(null);

    const searchPayload = {
      originLocationCode: origin.toUpperCase(),
      destinationLocationCode: destination.toUpperCase(),
      departureDate,
      adults: parseInt(adults, 10),
      currencyCode: currency,
    };

    if (tripType === 'roundTrip' && returnDate) {
      searchPayload.returnDate = returnDate;
    } else if (tripType === 'roundTrip' && !returnDate) {
      setError('Please select a return date for round trip flights.');
      setIsLoading(false); return;
    }

    try {
      const response = await axios.post('http://localhost:5000/api/flights/search', searchPayload);
      if (response.data && response.data.data) {
        setFlightOffers(response.data.data);
        setDictionaries(response.data.dictionaries || {});
         if (response.data.data.length === 0) {
            setError("No flight offers found for the selected criteria.");
        }
      } else {
        setFlightOffers([]);
        setDictionaries({});
        setError("No flight data in response or unexpected structure.");
        console.warn("No flight data in response or unexpected structure:", response.data);
      }
    } catch (err) {
      console.error('Flight search error:', err.response ? err.response.data : err.message);
      let displayError = 'Failed to fetch flight offers. Please check inputs and try again.';
      if (err.response && err.response.data) {
        if (err.response.data.details && Array.isArray(err.response.data.details)) {
            displayError = `Error: ${err.response.data.details.map(d => `${d.title || ''}${d.detail ? (': ' + d.detail) : ''} (status ${d.status || ''})`).join('; ')}`;
        } else if (err.response.data.errors && Array.isArray(err.response.data.errors)){
             displayError = `Error: ${err.response.data.errors.map(d => `${d.title || ''}${d.detail ? (': ' + d.detail) : ''} (status ${d.status || ''})`).join('; ')}`;
        } else if (typeof err.response.data.details === 'string') {
            displayError = `Error: ${err.response.data.details}`;
        } else if (err.response.data.error) {
            displayError = `Error: ${err.response.data.error}`;
        }
      }
      setError(displayError);
    }
    setIsLoading(false);
  };
  
  const formatDuration = (isoDuration) => {
    if (!isoDuration) return 'N/A';
    return isoDuration.replace('PT', '').replace('H', 'h ').replace('M', 'm');
  };

  const airlineLogoStyle = { 
    width: '96px', 
    height: '96px', 
    marginRight: '10px', 
    objectFit: 'contain', 
    verticalAlign: 'middle',
    border: '1px solid #eee',
    borderRadius: '3px'
  };

  return (
    <Container className="py-3 py-md-4">
      <header className="text-center mb-4"><h1>✈️ Tour Operator System</h1></header>
      <Alert variant={isBackendConnected ? 'success' : 'danger'} className="text-center shadow-sm">
        {backendMessage}
      </Alert>

      {isBackendConnected && (
        <Row className="justify-content-center"> 
          <Col md={10} lg={8} xl={7}>
            <Card className="mb-4 p-3 p-md-4 shadow">
              <Card.Body>
                <Card.Title as="h2" className="mb-3 text-primary">Search Flights</Card.Title>
                <Form onSubmit={handleFlightSearch}>
                  <Row className="mb-3">
                    <Col md={6} className="mb-3 mb-md-0">
                      <Form.Group controlId="tripType">
                        <Form.Label>Trip Type</Form.Label>
                        <Form.Select value={tripType} onChange={e => setTripType(e.target.value)}>
                          <option value="oneWay">One-Way</option>
                          <option value="roundTrip">Round Trip</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group controlId="currency">
                        <Form.Label>Currency</Form.Label>
                        <Form.Select value={currency} onChange={e => setCurrency(e.target.value)}>
                          {CURRENCIES.map(curr => <option key={curr} value={curr}>{curr}</option>)}
                        </Form.Select>
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row className="mb-3">
                    <Col md={6} className="mb-3 mb-md-0">
                      <Form.Group controlId="origin">
                        <Form.Label>Origin (IATA Code)</Form.Label>
                        <Form.Control type="text" value={origin} onChange={e => setOrigin(e.target.value)} placeholder="e.g., BKK" required />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group controlId="destination">
                        <Form.Label>Destination (IATA Code)</Form.Label>
                        <Form.Control type="text" value={destination} onChange={e => setDestination(e.target.value)} placeholder="e.g., PEK" required />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row className="mb-3">
                    <Col md={tripType === 'roundTrip' ? 6 : 12} className="mb-3 mb-md-0">
                      <Form.Group controlId="departureDate">
                        <Form.Label>Departure Date</Form.Label>
                        <Form.Control type="date" value={departureDate} onChange={e => setDepartureDate(e.target.value)} required />
                      </Form.Group>
                    </Col>
                    {tripType === 'roundTrip' && (
                      <Col md={6}>
                        <Form.Group controlId="returnDate">
                          <Form.Label>Return Date</Form.Label>
                          <Form.Control type="date" value={returnDate} onChange={e => setReturnDate(e.target.value)} required={tripType === 'roundTrip'} />
                        </Form.Group>
                      </Col>
                    )}
                  </Row>
                  
                  <Row className="mb-3">
                    <Col md={4} sm={6} xs={8}>
                      <Form.Group controlId="adults">
                        <Form.Label>Adults</Form.Label>
                        <Form.Control type="number" value={adults} onChange={e => setAdults(parseInt(e.target.value, 10))} min="1" required />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Button variant="primary" type="submit" disabled={isLoading} size="lg" className="w-100 mt-2">
                    {isLoading ? <><Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" /> Searching...</> : 'Search Flights'}
                  </Button>
                </Form>
              </Card.Body>
            </Card>

            {error && <Alert variant="danger" className="mt-4 shadow-sm">{error}</Alert>}
            
            {isLoading && !error && (
              <div className="text-center mt-4">
                <Spinner animation="border" variant="primary" style={{ width: '3rem', height: '3rem' }}/>
                <p className="mt-2 lead">Loading flight offers...</p>
              </div>
            )}

            <div className="results-container mt-4">
              {flightOffers.length > 0 && !isLoading && 
                  <h3 className="mb-3">Flight Results <Badge bg="secondary">{flightOffers.length} {flightOffers.length === 1 ? 'offer' : 'offers'}</Badge></h3>
              }
              {flightOffers.map((offer) => {
                let mapOriginCoords = null, mapDestCoords = null;
                let mapOriginName = '', mapDestName = '';

                if (dictionaries && dictionaries.locations && offer.itineraries && offer.itineraries[0]?.segments?.[0]) {
                  const firstItinerary = offer.itineraries[0];
                  const firstSegment = firstItinerary.segments[0];
                  const lastSegment = firstItinerary.segments[firstItinerary.segments.length - 1];
                  
                  const originLocationData = dictionaries.locations[firstSegment.departure.iataCode];
                  const destLocationData = dictionaries.locations[lastSegment.arrival.iataCode];

                  if (originLocationData?.geoCode) {
                    mapOriginCoords = originLocationData.geoCode;
                    mapOriginName = `${originLocationData.detailedName || firstSegment.departure.iataCode} (${firstSegment.departure.iataCode})`;
                  }
                  if (destLocationData?.geoCode) {
                    mapDestCoords = destLocationData.geoCode;
                    mapDestName = `${destLocationData.detailedName || lastSegment.arrival.iataCode} (${lastSegment.arrival.iataCode})`;
                  }
                }

                return (
                  <Card key={offer.id} className="mb-3 shadow-sm">
                    <Card.Header as="h5" className="bg-light text-success">
                      Total Price: {offer.price.total} {offer.price.currency}
                    </Card.Header>
                    <Card.Body>
                      {mapOriginCoords && mapDestCoords ? (
                        <GoogleMapComponent 
                          originCoords={mapOriginCoords} 
                          destinationCoords={mapDestCoords}
                          originName={mapOriginName}
                          destinationName={mapDestName} 
                        />
                      ) : (
                        <p className="text-muted small text-center my-3">Map data not available (dictionaries not loaded).</p>
                      )}

                      {offer.itineraries.map((itinerary, itinIndex) => (
                        <div key={itinIndex} className="mt-3">
                          <h6 className="text-muted border-bottom pb-2 mb-2">
                            Itinerary {itinIndex + 1} (Total Duration: {formatDuration(itinerary.duration)})
                          </h6>
                          {itinerary.segments.map((segment, segIndex) => {
                            const airlineCode = segment.carrierCode;
                            const airlineName = (dictionaries && dictionaries.carriers && dictionaries.carriers[airlineCode]) 
                                                ? dictionaries.carriers[airlineCode] 
                                                : airlineCode; 
                            const aircraftName = (dictionaries && dictionaries.aircraft && segment.aircraft && dictionaries.aircraft[segment.aircraft.code]) 
                                                 ? dictionaries.aircraft[segment.aircraft.code] 
                                                 : (segment.aircraft?.code || 'N/A');
                            const logoPath = `/images/airlines/${airlineCode.toUpperCase()}.png`; 

                            return (
                              <div key={segIndex} className={`segment-detail mb-2 ${segIndex > 0 ? 'pt-2 border-top' : ''}`}>
                                <p className="mb-1 small">
                                  <strong>{segment.departure.iataCode}</strong> ({new Date(segment.departure.at).toLocaleString()}) → <strong>{segment.arrival.iataCode}</strong> ({new Date(segment.arrival.at).toLocaleString()})
                                </p>
                                <div className="d-flex align-items-center mb-1 small">
                                  <img 
                                    src={logoPath} 
                                    alt="" 
                                    style={airlineLogoStyle}
                                    onError={(e) => { e.target.style.display = 'none'; }} 
                                  />
                                  <span>Airline: {airlineName} (Flight {airlineCode} {segment.number})</span>
                                </div>
                                <p className="mb-1 ms-1 small">Aircraft: {aircraftName}</p>
                                <p className="mb-0 ms-1 small">Duration: {formatDuration(segment.duration)}</p>
                                {segment.numberOfStops > 0 && <p className="mb-0 ms-1 small">Stops: {segment.numberOfStops}</p>}
                              </div>
                            );
                          })}
                        </div>
                      ))}
                    </Card.Body>
                  </Card>
                );
              })}
            </div>
          </Col>
        </Row>
      )}
      <footer className="text-center text-muted mt-5 py-3 border-top">
        <small>Tour Operator System &copy; {new Date().getFullYear()}</small>
      </footer>
    </Container>
  );
} // --- End of the single App function ---

export default App; // --- This is the single, correct export statement ---
