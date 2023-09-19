import React, { useState } from 'react';

interface StringInputPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (inputValue: string) => void;
}

const StringInputPopup: React.FC<StringInputPopupProps> = ({ isOpen, onClose, onSubmit }) => {
  const [inputValue, setInputValue] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleSubmit = () => {
    onSubmit(inputValue);
    setInputValue(''); // Clear the input field
    onClose();
  };

  return (
    <div className={`popup ${isOpen ? 'open' : ''}`}>
      <div className="popup-input">
        <input type="text" value={inputValue} onChange={handleInputChange} />
        <button onClick={handleSubmit}>Rename</button>
      </div>
    </div>
  );
};

export default StringInputPopup;
