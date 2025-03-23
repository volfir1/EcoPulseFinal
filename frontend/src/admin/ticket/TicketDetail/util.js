// Format date helper function
export const formatDate = (dateString) => {
    if (!dateString) return 'N/A';

    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
            console.warn('Invalid date:', dateString);
            return 'Invalid Date';
        }

        return new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    } catch (error) {
        console.error('Date formatting error:', error);
        return 'Invalid Date';
    }
};

// Get status chip color
export const getStatusColor = (status) => {
    switch (status) {
        case 'open':
            return { bg: '#EEF7FF', color: '#1A73E8' };
        case 'in-progress':
            return { bg: '#FFF7E0', color: '#F29D41' };
        case 'resolved':
            return { bg: '#E7F7ED', color: '#34A853' };
        case 'closed':
            return { bg: '#F2F2F2', color: '#5F6368' };
        default:
            return { bg: '#F2F2F2', color: '#5F6368' };
    }
};

// Get priority chip color
export const getPriorityColor = (priority) => {
    switch (priority) {
        case 'low':
            return { bg: '#E7F7ED', color: '#34A853' };
        case 'medium':
            return { bg: '#FFF7E0', color: '#F29D41' };
        case 'high':
            return { bg: '#FFEBEE', color: '#E53935' };
        case 'urgent':
            return { bg: '#7F1D1D', color: '#FFFFFF' };
        default:
            return { bg: '#F2F2F2', color: '#5F6368' };
    }
};