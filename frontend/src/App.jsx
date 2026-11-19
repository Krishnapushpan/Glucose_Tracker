import { useCallback, useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import DashboardPage from './pages/DashboardPage';
import LoginModal from './components/LoginModal';
import SignupModal from './components/SignupModal';
import { useAuth } from './context/AuthContext';

function ProtectedRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/" replace />;
}

export default function App() {
  const [activeModal, setActiveModal] = useState(null); // null | 'login' | 'signup'

  const openLoginModal = useCallback(() => setActiveModal('login'), []);
  const openSignupModal = useCallback(() => setActiveModal('signup'), []);
  const closeModal = useCallback(() => setActiveModal(null), []);

  return (
    <>
      <Routes>
        <Route path="/" element={<LandingPage onOpenLogin={openLoginModal} />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
      </Routes>

      <LoginModal
        isOpen={activeModal === 'login'}
        onClose={closeModal}
        onSwitchToSignup={openSignupModal}
      />

      <SignupModal
        isOpen={activeModal === 'signup'}
        onClose={closeModal}
        onSwitchToLogin={openLoginModal}
      />
    </>
  );
}