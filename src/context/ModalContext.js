import React, { createContext, useContext, useState } from 'react';

const ModalContext = createContext();

export function ModalProvider({ children }) {
  const [authModal, setAuthModal] = useState({
    isOpen: false,
    mode: 'signin' // 'signin', 'signup', or 'forgot-password'
  });


  const openAuthModal = (mode = 'signin') => {
    console.log('ModalContext: Opening auth modal with mode:', mode);
    setAuthModal({
      isOpen: true,
      mode
    });
  };

  const closeAuthModal = () => {
    setAuthModal({
      isOpen: false,
      mode: 'signin'
    });
  };

  const switchAuthModalMode = (mode) => {
    setAuthModal(prev => ({
      ...prev,
      mode
    }));
  };


  return (
    <ModalContext.Provider
      value={{
        authModal,
        openAuthModal,
        closeAuthModal,
        switchAuthModalMode,
      }}
    >
      {children}
    </ModalContext.Provider>
  );
}

export function useModal() {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
}
