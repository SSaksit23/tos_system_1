// frontend/src/App.js
import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import FlightSearch from './components/FlightSearch';
import HotelSearch from './components/HotelSearch';
import AuthModal from './components/auth/AuthModal';
import { User, LogOut, Settings, Menu, X } from 'lucide-react';

const AppContent = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState('flights');
  const [flightData, setFlightData] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalForm, setAuthModalForm] = useState('login');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const handleOpenAuth = (formType = 'login') => {
    setAuthModalForm(formType);
    setShowAuthModal(true);
  };

  const handleLogout = async () => {
    await logout();
    setShowUserMenu(false);
    setFlightData(null); // Clear any stored flight data
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl font-bold text-gray-900">✈️ AdventureConnect</h1>
              <span className="hidden sm:block text-sm text-gray-600 bg-blue-100 px-2 py-1 rounded">
                Powered by Amadeus API
              </span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-4">
              {isAuthenticated ? (
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-gray-100 transition"
                  >
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-medium">
                        {user?.firstName?.[0]}{user?.lastName?.[0]}
                      </span>
                    </div>
                    <div className="text-left">
                      <div className="text-sm font-medium text-gray-900">
                        {user?.firstName} {user?.lastName}
                      </div>
                      <div className="text-xs text-gray-500 capitalize">
                        {user?.role?.replace('_', ' ')}
                      </div>
                    </div>
                  </button>

                  {/* User Dropdown Menu */}
                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border py-1 z-10">
                      <button className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100 flex items-center space-x-2">
                        <User className="h-4 w-4" />
                        <span>Profile</span>
                      </button>
                      <button className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100 flex items-center space-x-2">
                        <Settings className="h-4 w-4" />
                        <span>Settings</span>
                      </button>
                      <hr className="my-1" />
                      <button
                        onClick={handleLogout}
                        className="w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 flex items-center space-x-2"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleOpenAuth('login')}
                    className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => handleOpenAuth('register')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                  >
                    Sign Up
                  </button>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="p-2 rounded-lg hover:bg-gray-100"
              >
                {showMobileMenu ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {showMobileMenu && (
            <div className="md:hidden mt-4 pb-4 border-t">
              {isAuthenticated ? (
                <div className="pt-4 space-y-2">
                  <div className="px-4 py-2">
                    <div className="text-sm font-medium text-gray-900">
                      {user?.firstName} {user?.lastName}
                    </div>
                    <div className="text-xs text-gray-500 capitalize">
                      {user?.role?.replace('_', ' ')}
                    </div>
                  </div>
                  <button className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100 flex items-center space-x-2">
                    <User className="h-4 w-4" />
                    <span>Profile</span>
                  </button>
                  <button className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100 flex items-center space-x-2">
                    <Settings className="h-4 w-4" />
                    <span>Settings</span>
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 flex items-center space-x-2"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              ) : (
                <div className="pt-4 space-y-2">
                  <button
                    onClick={() => handleOpenAuth('login')}
                    className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => handleOpenAuth('register')}
                    className="w-full px-4 py-2 text-left bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Sign Up
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </header>

      {/* Auth Required Notice for Unauthenticated Users */}
      {!isAuthenticated && (
        <div className="bg-blue-50 border-b border-blue-200">
          <div className="max-w-7xl mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-blue-600">🎯</span>
                <span className="text-blue-800 text-sm">
                  Sign up to save your searches, create custom trips, and book with local providers!
                </span>
              </div>
              <button
                onClick={() => handleOpenAuth('register')}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                Get Started →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('flights')}
              className={`py-4 px-1 border-b-2 font-medium ${
                activeTab === 'flights'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              🛫 Flights
            </button>
            <button
              onClick={() => setActiveTab('hotels')}
              className={`py-4 px-1 border-b-2 font-medium ${
                activeTab === 'hotels'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              🏨 Hotels
            </button>
            {isAuthenticated && (
              <>
                <button
                  onClick={() => setActiveTab('trips')}
                  className={`py-4 px-1 border-b-2 font-medium ${
                    activeTab === 'trips'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  🎒 My Trips
                </button>
                <button
                  onClick={() => setActiveTab('customize')}
                  className={`py-4 px-1 border-b-2 font-medium ${
                    activeTab === 'customize'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  ✨ Customize Trip
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4">
        {activeTab === 'flights' && <FlightSearch onFlightSelect={setFlightData} />}
        {activeTab === 'hotels' && <HotelSearch flightData={flightData} />}
        {activeTab === 'trips' && isAuthenticated && <MyTripsComponent />}
        {activeTab === 'customize' && isAuthenticated && <TripCustomizationComponent />}
      </main>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        initialForm={authModalForm}
      />

      {/* Click outside to close dropdowns */}
      {(showUserMenu || showMobileMenu) && (
        <div
          className="fixed inset-0 z-10"
          onClick={() => {
            setShowUserMenu(false);
            setShowMobileMenu(false);
          }}
        />
      )}
    </div>
  );
};

// Placeholder components for authenticated features
const MyTripsComponent = () => (
  <div className="bg-white rounded-xl shadow-lg p-8 text-center">
    <h2 className="text-2xl font-bold text-gray-800 mb-4">My Trips</h2>
    <p className="text-gray-600 mb-6">
      Your saved trips and booking history will appear here.
    </p>
    <div className="text-6xl mb-4">🎒</div>
    <p className="text-sm text-gray-500">
      Feature coming soon in Phase 2 of development!
    </p>
  </div>
);

const TripCustomizationComponent = () => (
  <div className="bg-white rounded-xl shadow-lg p-8 text-center">
    <h2 className="text-2xl font-bold text-gray-800 mb-4">Custom Trip Builder</h2>
    <p className="text-gray-600 mb-6">
      Build your perfect trip with AI-powered recommendations and local experiences.
    </p>
    <div className="text-6xl mb-4">✨</div>
    <p className="text-sm text-gray-500">
      Core feature coming in Phase 3 - Trip Customization Engine!
    </p>
  </div>
);

// Main App Component with Auth Provider
const App = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;