import React from 'react';

const FloatingSelect = ({ id, label, options, value, onChange, error}) => {
  return (
    <div className="form-floating mb-3 mx-auto">
      <select
        className={`form-select ${error ? 'is-invalid' : ''}`}
        id={id}
        value={value}
        onChange={onChange}
        aria-label={label}
      >
        <option value="" disabled>
          {`Select a ${label}`}
        </option>
        {options.map((hero) => (
          <option key={hero._id} value={hero.id}>
            {hero.superhero}
          </option>
        ))}
      </select>
      <label htmlFor={id}>{label}</label>
      {error && <div className="invalid-feedback">{error}</div>}
    </div>
  );
};

export default FloatingSelect


