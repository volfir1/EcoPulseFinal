
/**
 * Calculate password strength and provide feedback
 * @param {string} password - The password to evaluate
 * @return {Object} Strength details including score, label, color, and feedback
 */
export const calculatePasswordStrength = (password) => {
    if (!password) return { 
      score: 0, 
      label: 'empty', 
      color: 'gray-300',
      feedback: 'Enter a password' 
    };
  
    let score = 0;
    let feedback = [];
  
    // Length check
    if (password.length < 8) {
      feedback.push('Password should be at least 8 characters');
    } else {
      score += password.length > 12 ? 2 : 1;
    }
  
    // Complexity checks
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumbers = /[0-9]/.test(password);
    const hasSpecialChars = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password);
  
    if (hasUppercase) score += 1;
    if (hasLowercase) score += 1;
    if (hasNumbers) score += 1;
    if (hasSpecialChars) score += 1;
  
    // Build feedback
    if (!hasUppercase) feedback.push('Add uppercase letters');
    if (!hasLowercase) feedback.push('Add lowercase letters');
    if (!hasNumbers) feedback.push('Add numbers');
    if (!hasSpecialChars) feedback.push('Add special characters');
  
    // Score interpretation
    let label = 'weak';
    let color = 'red-500';
    
    if (score >= 6) {
      label = 'strong';
      color = 'green-500';
    } else if (score >= 4) {
      label = 'moderate';
      color = 'yellow-500';
    }
  
    return {
      score,
      label,
      color,
      feedback: feedback.length > 0 ? feedback.join(', ') : 'Strong password'
    };
  };
  
  /**
   * Password input field component with toggle visibility
   * Takes Formik field props and adds show/hide functionality
   * @param {Object} props - Component props
   * @return {Function} React component for password field
   */
  export const usePasswordField = () => {
    const [passwordVisible, setPasswordVisible] = useState(false);
    
    const togglePasswordVisibility = () => {
      setPasswordVisible(prev => !prev);
    };
    
    return {
      passwordVisible,
      togglePasswordVisibility
    };
  };