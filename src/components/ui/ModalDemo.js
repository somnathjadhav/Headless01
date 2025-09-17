import React from 'react';
import { useModal } from '../../context/ModalContext';

/**
 * Demo component showing how to trigger auth modals programmatically
 * This can be used anywhere in the app to open sign-in or sign-up modals
 */
export default function ModalDemo() {
  const { openAuthModal } = useModal();

  return (
    <div className="p-6 bg-gray-50 rounded-lg">
      <h3 className="text-lg font-semibold mb-4">Auth Modal Demo</h3>
      <div className="space-x-4">
        <button
          onClick={() => openAuthModal('signin')}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Open Sign In Modal
        </button>
        <button
          onClick={() => openAuthModal('signup')}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          Open Sign Up Modal
        </button>
      </div>
      <p className="text-sm text-gray-600 mt-4">
        These buttons demonstrate how to trigger auth modals from anywhere in the app.
      </p>
    </div>
  );
}
