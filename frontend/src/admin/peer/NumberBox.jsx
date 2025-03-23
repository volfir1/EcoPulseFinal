import React from 'react';

/**
 * NumberBox component for input fields with validation
 * 
 * @param {Object} props - Component props
 * @param {String} props.label - Input label
 * @param {String|Number} props.value - Input value
 * @param {Function} props.onChange - Change handler
 * @param {String} props.placeholder - Input placeholder
 * @param {Boolean} props.disabled - Is input disabled
 * @param {Boolean} props.error - Is there an error
 * @param {String} props.helperText - Error message
 * @returns {JSX.Element}
 */
export const NumberBox = ({ 
  label, 
  value, 
  onChange, 
  placeholder, 
  disabled, 
  error, 
  helperText 
}) => (
  <div className="mb-4">
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label}
    </label>
    <input
      type="number"
      className={`border rounded-md p-2 w-full ${disabled ? 'bg-gray-100' : ''} ${error ? 'border-red-500' : ''}`}
      placeholder={placeholder}
      value={value || ''}
      onChange={onChange}
      disabled={disabled}
      readOnly={disabled}
    />
    {error && helperText && (
      <p className="text-xs text-red-500 mt-1">{helperText}</p>
    )}
  </div>
);

export default NumberBox;