import { useCallback, useState } from 'react';
import LandingPage from './pages/LandingPage';
import LoginModal from './components/LoginModal';
import SignupModal from './components/SignupModal';

export default function App() {
  const [activeModal, setActiveModal] = useState(null); // null | 'login' | 'signup'

  const openLoginModal = useCallback(() => {
    setActiveModal('login');
  }, []);

  const openSignupModal = useCallback(() => {
    setActiveModal('signup');
  }, []);

  const closeModal = useCallback(() => {
    setActiveModal(null);
  }, []);

  return (
    <>
      <LandingPage onOpenLogin={openLoginModal} />

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
