// buttonFunctions.js
export const buttonActions = {
    handleGoBack: () => {
      window.history.back();
    },
    
    handleGoHome: (navigate) => {
      navigate('/');
    },
    
    // Add any additional button functions here
    handleRefresh: () => {
      window.location.reload();
    }
  };
  