import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import LoginModal from './components/LoginModal';
import Home from './pages/Home';
import History from './pages/History';
import OAuth2Redirect from './pages/OAuth2Redirect';

function App() {
  const [showLoginModal, setShowLoginModal] = useState(false);

  return (
    <Router>
      <div className="min-h-screen">
        <Header onLoginClick={() => setShowLoginModal(true)} />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/history" element={<History />} />
          <Route path="/oauth2/redirect" element={<OAuth2Redirect />} />
        </Routes>
        <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
      </div>
    </Router>
  );
}

export default App;