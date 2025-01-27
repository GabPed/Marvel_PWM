import React from 'react';

const FloatingInput = ({ id, label, type, value, onChange, error }) => {
  return (
    <div className="form-floating mb-3 mx-auto">
      <input
        type={type}
        className={`form-control ${error ? 'is-invalid' : ''}`}
        id={id}
        placeholder={label}
        value={value}
        onChange={onChange}
      />
      <label htmlFor={id}>{label}</label>
      {error && <div className="invalid-feedback">{error}</div>}
    </div>
  );
};

export default FloatingInput;
