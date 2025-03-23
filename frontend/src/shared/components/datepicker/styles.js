export const getPickerStyles = (error) => ({
    '& .MuiInputBase-root': {
      height: '42px',
      width: '150px',
      borderRadius: '100px',
      backgroundColor: 'white',
      fontSize: '1rem',
      border: error ? '1px solid #ef4444' : '1px solid #e2e8f0',
      '&:hover': {
        border: error ? '1px solid #ef4444' : '1px solid #e2e8f0',
      },
      '&.Mui-focused': {
        border: error ? '1px solid #ef4444' : '1px solid #e2e8f0',
        boxShadow: 'none',
      }
    },
    '& .MuiInputBase-input': {
      padding: '8px 14px',
      fontWeight: 500,
    },
    '& .MuiOutlinedInput-notchedOutline': {
      border: 'none'
    },
    '& .MuiIconButton-root': {
      padding: '8px',
      color: '#94a3b8',
    }
  });

  export default getPickerStyles