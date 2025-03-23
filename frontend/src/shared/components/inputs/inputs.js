import React, { forwardRef, useState } from 'react';
import { AppIcon, theme } from '@shared/index';

// Input size variations
const inputSizes = {
  small: {
    padding: 'px-3 py-1.5',
    text: 'text-sm',
    icon: 'pl-8',
    iconSize: 16,
    height: 'h-8'
  },
  medium: {
    padding: 'px-3 py-2',
    text: 'text-base',
    icon: 'pl-10',
    iconSize: 20,
    height: 'h-10'
  },
  large: {
    padding: 'px-4 py-2.5',
    text: 'text-lg',
    icon: 'pl-11',
    iconSize: 24,
    height: 'h-12'
  }
};

// Input style variants
const inputVariants = {
  default: {
    base: 'border border-gray-300',
    focus: 'focus:ring-2 focus:border-primary-400',
    error: 'border-red-500 focus:ring-red-200',
    disabled: 'bg-gray-100 text-gray-500 cursor-not-allowed'
  },
  filled: {
    base: 'border-0 bg-gray-100',
    focus: 'focus:ring-2 focus:bg-white',
    error: 'bg-red-50 focus:ring-red-200',
    disabled: 'bg-gray-200 text-gray-500 cursor-not-allowed'
  },
  outlined: {
    base: 'border-2 border-gray-300 bg-transparent',
    focus: 'focus:ring-0 focus:border-primary-400',
    error: 'border-red-500',
    disabled: 'bg-gray-50 text-gray-500 cursor-not-allowed'
  }
};

const InputBox = forwardRef(({
  // Base props
  type = 'text',
  name,
  value,
  onChange,
  onBlur,
  placeholder,
  disabled = false,
  readOnly = false,
  required = false,
  
  // Styling props
  size = 'medium',
  variant = 'default',
  fullWidth = false,
  className = '',
  
  // Icon props
  icon,
  iconType = 'icon',
  iconPosition = 'left',
  
  // State props
  error = false,
  helperText,
  label,
  
  // Password props
  showPasswordToggle = false,
  
  // Additional props
  ...props
}, ref) => {
  const [showPassword, setShowPassword] = useState(false);
  const { primary, text, error: errorColor } = theme.palette;
  
  const sizeStyles = inputSizes[size];
  const variantStyles = inputVariants[variant];
  
  const inputClasses = [
    'rounded-lg',
    'w-full',
    'transition-colors',
    'focus:outline-none',
    sizeStyles.text,
    sizeStyles.padding,
    variantStyles.base,
    variantStyles.focus,
    icon && iconPosition === 'left' && sizeStyles.icon,
    error && variantStyles.error,
    disabled && variantStyles.disabled,
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={`${fullWidth ? 'w-full' : ''}`}>
      {/* Label */}
      {label && (
        <label 
          htmlFor={name}
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      {/* Input Container */}
      <div className="relative">
        {/* Left Icon */}
        {icon && iconPosition === 'left' && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <AppIcon 
              name={icon}
              type={iconType}
              size={sizeStyles.iconSize}
              className="text-gray-400"
            />
          </div>
        )}

        {/* Input Element */}
        <input
          ref={ref}
          type={showPassword ? 'text' : type}
          name={name}
          id={name}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          disabled={disabled}
          readOnly={readOnly}
          required={required}
          placeholder={placeholder}
          className={inputClasses}
          style={{
            '--tw-ring-color': `${primary.main}40`,
            '--tw-ring-opacity': 0.2
          }}
          {...props}
        />

        {/* Right Icon or Password Toggle */}
        {(icon && iconPosition === 'right' || (type === 'password' && showPasswordToggle)) && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            {type === 'password' && showPasswordToggle ? (
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-gray-400 hover:text-gray-500 focus:outline-none"
              >
                <AppIcon 
                  name={showPassword ? 'eye-off' : 'eye'} 
                  size={sizeStyles.iconSize}
                />
              </button>
            ) : (
              <AppIcon 
                name={icon}
                type={iconType}
                size={sizeStyles.iconSize}
                className="text-gray-400"
              />
            )}
          </div>
        )}
      </div>

      {/* Helper Text */}
      {helperText && (
        <p 
          className="mt-1 text-sm"
          style={{ color: error ? errorColor.main : text.secondary }}
        >
          {helperText}
        </p>
      )}
    </div>
  );
});

// Text Area variant
export const TextArea = forwardRef(({
  rows = 4,
  ...props
}, ref) => (
  <InputBox
    ref={ref}
    as="textarea"
    rows={rows}
    {...props}
  />
));

// Search Input variant
export const SearchBox = forwardRef((props, ref) => (
  <InputBox
    ref={ref}
    type="search"
    icon="search"
    iconType="tool"
    {...props}
  />
));

// Number Input variant
export const NumberBox = forwardRef(({
  min,
  max,
  step,
  ...props
}, ref) => (
  <InputBox
    ref={ref}
    type="number"
    min={min}
    max={max}
    step={step}
    {...props}
  />
));

// Example usage of date input
export const DateBox = forwardRef((props, ref) => (
  <InputBox
    ref={ref}
    type="date"
    icon="calendar"
    {...props}
  />
));

// Add display names
InputBox.displayName = 'InputBox';
TextArea.displayName = 'TextArea';
SearchBox.displayName = 'SearchBox';
NumberBox.displayName = 'NumberBox';
DateBox.displayName = 'DateBox';

export default InputBox;