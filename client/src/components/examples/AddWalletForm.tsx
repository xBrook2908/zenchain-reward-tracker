import AddWalletForm from '../AddWalletForm';
import { useState } from 'react';

export default function AddWalletFormExample() {
  // todo: remove mock functionality
  const [isVisible, setIsVisible] = useState(true);

  const handleSubmit = (wallet: { address: string; label: string; type: string }) => {
    console.log('Add new wallet:', wallet);
    setIsVisible(false);
  };

  const handleCancel = () => {
    console.log('Cancel add wallet');
    setIsVisible(false);
  };

  return (
    <div className="space-y-4">
      {!isVisible && (
        <button 
          onClick={() => setIsVisible(true)}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
        >
          Show Add Wallet Form
        </button>
      )}
      <AddWalletForm
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isVisible={isVisible}
      />
    </div>
  );
}
