import { useState } from 'react';
import './SearchBar.css';

function SearchBar({ hint = "Search...", action }) {
  const [inputValue, setValue] = useState('');

  // Funzione per gestire il cambiamento dell'input
  const handleInputChange = (event) => {
    setValue(event.target.value);
  };

  // Funzione per gestire l'invio del form
  const handleSubmit = (event) => {
    event.preventDefault(); 
    if(inputValue.trim() === '' && inputValue.trim().length < 3) return;
    action(inputValue.trim()); 
    setValue('');
  };

  return (
    <form
      className="m-0 d-flex align-items-center justify-content-center rounded-5 shadow-sm border-0 searchbar"
      onSubmit={handleSubmit}
    >
      <input
        className="border-0 w-0 p-0 search_input" 
        type="text"
        placeholder={hint}
        onChange={handleInputChange}
        value={inputValue}
      />
      <button 
        className="border-0 d-flex align-items-center justify-content-center rounded-5 text-decoration-none search_icon "  
        disabled={inputValue.trim().length < 3} 
        type="submit"
      >
          <i className="bi bi-search"></i>
      </button>
    </form>
  );
}

export default SearchBar;



