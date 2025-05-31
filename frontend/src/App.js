import React, { useState, useEffect } from 'react';
import axios from 'axios';

const styles = {
  container: { padding: '20px', fontFamily: 'Arial, sans-serif', maxWidth: '800px', margin: '0 auto' },
  header: { textAlign: 'center', marginBottom: '30px' },
  form: { display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '30px', padding: '20px', border: '1px solid #ddd', borderRadius: '8px', backgroundColor: '#f9f9f9' },
  inputRow: { display: 'flex', gap: '10px', alignItems: 'center' },
  inputGroup: { display: 'flex', flexDirection: 'column', flex: 1 },
  label: { marginBottom: '5px', fontWeight: 'bold' },
  input: { padding: '10px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '16px' },
  select: { padding: '10px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '16px', flex: 1 },
  button: { padding: '12px 20px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', fontSize: '16px', cursor: 'pointer', marginTop: '10px' },
  resultsContainer: { marginTop: '20px' },
  flightOffer: { border: '1px solid #eee', padding: '15px', marginBottom: '15px', borderRadius: '8px', backgroundColor: '#fff' },
  price: { fontSize: '1.2em', fontWeight: 'bold', color: '#28a745' },
  segment: { borderTop: '1px dashed #eee', marginTop: '10px', paddingTop: '10px' },
  error: { color: 'red', marginTop: '10px', padding: '10px', backgroundColor: '#f8d7da', border: '1px solid #f5c6cb', borderRadius: '4px'},
  loading: { textAlign: 'center', fontSize: '1.2em', color: '#555' },
  backendStatus: { padding: '10px', margin: '20px 0', borderRadius: '8px', textAlign: 'center' }
};

const CURRENCIES = ['EUR', 'USD', 'GBP', 'THB', 'JPY', 'CAD', 'AUD']; // Example currencies

function App() {
  const [backendMessage, setBackendMessage] = useState('Checking backend connection...');
  const [isBackendConnected, setIsBackendConnected] = useState(false);

  // Flight Search State
  const [tripType, setTripType] = useState('oneWay'); // 'oneWay' or 'roundTrip'
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [departureDate, setDepartureDate] = useState('');
  const [returnDate, setReturnDate] = useState(''); // New for round trip
  const [adults, setAdults] = useState(1);
  const [currency, setCurrency] = useState('EUR'); // New for currency
  const [flightOffers, setFlightOffers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios.get('http://localhost:5000/api/health')
      .then(response => {
        setBackendMessage(`Backend Status: ${response.data.status} - ${response.data.message} ✅`);
        setIsBackendConnected(true);
      })
      .catch(err => {
        console.error('Backend connection error:', err);
        setBackendMessage('Backend connection failed ❌ - Check console and ensure backend is running.');
        setIsBackendConnected(false);
      });
  }, []);

  const handleFlightSearch = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setFlightOffers([]);

    const searchPayload = {
      originLocationCode: origin.toUpperCase(),
      destinationLocationCode: destination.toUpperCase(),
      departureDate,
      adults,
      currencyCode: currency, // Send selected currency
    };

    if (tripType === 'roundTrip' && returnDate) {
      searchPayload.returnDate = returnDate; // Send return date for round trips
    } else if (tripType === 'roundTrip' && !returnDate) {
      setError('Please select a return date for round trips.');
      setIsLoading(false);
      return;
    }


    try {
      const response = await axios.post('http://localhost:5000/api/flights/search', searchPayload);
      setFlightOffers(response.data);
    } catch (err) {
      console.error('Flight search error:', err.response ? err.response.data : err.message);
      let displayError = 'Failed to fetch flight offers. Please check inputs and try again.';
      if (err.response && err.response.data) {
        if (err.response.data.details) {
            // Check if details is an array of Amadeus error objects or a string
            if (Array.isArray(err.response.data.details)) {
                 displayError = `Error: ${err.response.data.details.map(d => `${d.title || ''}: ${d.detail || ''} (status ${d.status || ''})`).join(', ')}`;
            } else if (typeof err.response.data.details === 'string') {
                displayError = `Error: ${err.response.data.details}`;
            }
        } else if (err.response.data.error) {
            displayError = `Error: ${err.response.data.error}`;
        }
      }
      setError(displayError);
    }
    setIsLoading(false);
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1>✈️ Tour Operator System</h1>
      </header>

      <div style={{...styles.backendStatus, backgroundColor: isBackendConnected ? '#d4edda' : '#f8d7da', border: `1px solid ${isBackendConnected ? '#c3e6cb' : '#f5c6cb'}`}}>
        <p style={{margin: 0}}>{backendMessage}</p>
      </div>

      {isBackendConnected && (
        <>
          <h2>Search Flights</h2>
          <form onSubmit={handleFlightSearch} style={styles.form}>
            <div style={styles.inputRow}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Trip Type</label>
                <select value={tripType} onChange={e => setTripType(e.target.value)} style={styles.select}>
                  <option value="oneWay">One-Way</option>
                  <option value="roundTrip">Round Trip</option>
                </select>
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Currency</label>
                <select value={currency} onChange={e => setCurrency(e.target.value)} style={styles.select}>
                  {CURRENCIES.map(curr => <option key={curr} value={curr}>{curr}</option>)}
                </select>
              </div>
            </div>

            <div style={styles.inputRow}>
                <div style={styles.inputGroup}>
                <label htmlFor="origin" style={styles.label}>Origin (IATA Code)</label>
                <input type="text" id="origin" value={origin} onChange={e => setOrigin(e.target.value)} placeholder="e.g., MAD" required style={styles.input} />
                </div>
                <div style={styles.inputGroup}>
                <label htmlFor="destination" style={styles.label}>Destination (IATA Code)</label>
                <input type="text" id="destination" value={destination} onChange={e => setDestination(e.target.value)} placeholder="e.g., BCN" required style={styles.input} />
                </div>
            </div>

            <div style={styles.inputRow}>
                <div style={styles.inputGroup}>
                <label htmlFor="departureDate" style={styles.label}>Departure Date</label>
                <input type="date" id="departureDate" value={departureDate} onChange={e => setDepartureDate(e.target.value)} required style={styles.input} />
                </div>
                {tripType === 'roundTrip' && (
                <div style={styles.inputGroup}>
                    <label htmlFor="returnDate" style={styles.label}>Return Date</label>
                    <input type="date" id="returnDate" value={returnDate} onChange={e => setReturnDate(e.target.value)} required={tripType === 'roundTrip'} style={styles.input} />
                </div>
                )}
            </div>
            
            <div style={styles.inputGroup}>
              <label htmlFor="adults" style={styles.label}>Adults</label>
              <input type="number" id="adults" value={adults} onChange={e => setAdults(parseInt(e.target.value, 10))} min="1" required style={{...styles.input, width: '100px'}} />
            </div>

            <button type="submit" disabled={isLoading} style={styles.button}>
              {isLoading ? 'Searching...' : 'Search Flights'}
            </button>
          </form>

          {error && <div style={styles.error}>{error}</div>}
          {isLoading && <div style={styles.loading}>Loading flight offers...</div>}

          <div style={styles.resultsContainer}>
            {flightOffers.length > 0 && <h3>Flight Results ({flightOffers.length} offers found)</h3>}
            {flightOffers.map((offer, index) => (
              <div key={offer.id || index} style={styles.flightOffer}>
                <h4>Offer {index + 1} - Price: <span style={styles.price}>{offer.price.total} {offer.price.currency}</span></h4>
                {offer.itineraries.map((itinerary, itinIndex) => (
                  <div key={itinIndex}>
                    <h5>Itinerary {itinIndex + 1} (Duration: {itinerary.duration.replace('PT', '').replace('H', 'h ').replace('M', 'm')})</h5>
                    {itinerary.segments.map((segment, segIndex) => (
                      <div key={segIndex} style={styles.segment}>
                        <p>
                          <strong>{segment.departure.iataCode}</strong> ({new Date(segment.departure.at).toLocaleString()}) → <strong>{segment.arrival.iataCode}</strong> ({new Date(segment.arrival.at).toLocaleString()})
                        </p>
                        <p>Airline: {segment.carrierCode} {segment.number}, Duration: {segment.duration ? segment.duration.replace('PT', '').replace('H', 'h ').replace('M', 'm') : 'N/A'}</p>
                        {segment.numberOfStops > 0 && <p>Stops: {segment.numberOfStops}</p>}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default App;