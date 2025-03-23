import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Card from '@components/cards/cards';
import { TextArea } from '@components/inputs/inputs';
import Button from '@components/buttons/buttons';
import { Loader } from '@shared/index';
import {
    Typography,
    Box,
    Avatar,
    Chip,
    Divider,
    MenuItem,
    Select,
    FormControl,
    IconButton
} from '@mui/material';
import {
    ArrowLeft,
    Clock,
    User,
    Tag,
    AlertTriangle,
    CheckCircle
} from 'lucide-react';

// Import custom hooks and utils
import { useTicketDetail } from './hook';
import { formatDate, getStatusColor, getPriorityColor } from './util';

const AdminTicketDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    
    // Use the custom hook to get all the ticket data and handlers
    const {
        ticket,
        loading,
        replyContent,
        setReplyContent,
        submitting,
        newStatus,
        admins,
        selectedAdmin,
        setSelectedAdmin,
        handleReply,
        handleStatusChange,
        handleAssignTicket
    } = useTicketDetail(id);

    if (!ticket) {
        return (
            <div className="container mx-auto px-4 py-6">
                <Card.Error>
                    <Box sx={{ p: 4, textAlign: 'center' }}>
                        <Typography variant="h5" fontWeight="bold" gutterBottom>
                            Ticket Not Found
                        </Typography>
                        <Typography variant="body1" paragraph>
                            The ticket you're looking for doesn't exist or you don't have permission to view it.
                        </Typography>
                        <Button
                            onClick={() => navigate('/admin/tickets')}
                            startIcon={<ArrowLeft size={18} />}
                        >
                            Back to Tickets
                        </Button>
                    </Box>
                </Card.Error>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-6">
            {/* Header with back button */}
            <div className="flex items-center mb-6">
                <IconButton
                    onClick={() => navigate('/admin/tickets')}
                    sx={{ mr: 2 }}
                >
                    <ArrowLeft size={20} />
                </IconButton>
                <div>
                    <Typography variant="h5" fontWeight="bold" color="text.primary">
                        Ticket #{ticket.ticketNumber}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        {ticket.subject}
                    </Typography>
                </div>
            </div>

            {/* Three cards in a row at the top - with equal heights */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                {/* Card 1: Ticket Details */}
                <div className="h-full">
                    <Card.Base sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                        <Box sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
                            <Typography variant="h6" fontWeight="bold" gutterBottom>
                                Ticket Details
                            </Typography>
                            <Divider sx={{ my: 2 }} />

                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', width: 100 }}>
                                        <User size={16} className="mr-2" />
                                        <Typography variant="body2" color="text.secondary">
                                            Customer:
                                        </Typography>
                                    </Box>
                                    <Typography variant="body2" fontWeight="medium">
                                        {ticket.user?.firstName && ticket.user?.lastName
                                            ? `${ticket.user.firstName} ${ticket.user.lastName}`
                                            : ticket.user?.email}
                                    </Typography>
                                </Box>

                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', width: 100 }}>
                                        <Tag size={16} className="mr-2" />
                                        <Typography variant="body2" color="text.secondary">
                                            Category:
                                        </Typography>
                                    </Box>
                                    <Typography variant="body2" fontWeight="medium" sx={{ textTransform: 'capitalize' }}>
                                        {ticket.category}
                                    </Typography>
                                </Box>

                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', width: 100 }}>
                                        <AlertTriangle size={16} className="mr-2" />
                                        <Typography variant="body2" color="text.secondary">
                                            Priority:
                                        </Typography>
                                    </Box>
                                    <Chip
                                        label={ticket.priority}
                                        size="small"
                                        sx={{
                                            ...getPriorityColor(ticket.priority),
                                            textTransform: 'capitalize',
                                            fontWeight: 'medium',
                                            fontSize: '0.75rem'
                                        }}
                                    />
                                </Box>

                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', width: 100 }}>
                                        <CheckCircle size={16} className="mr-2" />
                                        <Typography variant="body2" color="text.secondary">
                                            Status:
                                        </Typography>
                                    </Box>
                                    <Chip
                                        label={(ticket.status || 'unknown').replace('-', ' ')}
                                        size="small"
                                        sx={{
                                            ...getStatusColor(ticket.status || 'unknown'),
                                            textTransform: 'capitalize',
                                            fontWeight: 'medium',
                                            fontSize: '0.75rem'
                                        }}
                                    />
                                </Box>

                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', width: 100 }}>
                                        <Clock size={16} className="mr-2" />
                                        <Typography variant="body2" color="text.secondary">
                                            Created:
                                        </Typography>
                                    </Box>
                                    <Typography variant="body2">
                                        {formatDate(ticket.createdAt)}
                                    </Typography>
                                </Box>

                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', width: 100 }}>
                                        <Clock size={16} className="mr-2" />
                                        <Typography variant="body2" color="text.secondary">
                                            Updated:
                                        </Typography>
                                    </Box>
                                    <Typography variant="body2">
                                        {formatDate(ticket.updatedAt)}
                                    </Typography>
                                </Box>
                            </Box>
                        </Box>
                    </Card.Base>
                </div>

                {/* Card 2: Ticket Actions */}
                <div className="h-full">
                    <Card.Base sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                        <Box sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
                            <Typography variant="h6" fontWeight="bold" gutterBottom>
                                Ticket Actions
                            </Typography>
                            <Divider sx={{ my: 2 }} />

                            {/* Update Status */}
                            <Box sx={{ mb: 3 }}>
                                <Typography variant="subtitle2" gutterBottom>
                                    Update Status
                                </Typography>
                                <FormControl fullWidth size="small">
                                    <Select
                                        value={newStatus}
                                        onChange={handleStatusChange}
                                        displayEmpty
                                    >
                                        <MenuItem value="open">Open</MenuItem>
                                        <MenuItem value="in-progress">In Progress</MenuItem>
                                        <MenuItem value="resolved">Resolved</MenuItem>
                                        <MenuItem value="closed">Closed</MenuItem>
                                    </Select>
                                </FormControl>
                            </Box>

                            {/* Assign Ticket */}
                            <Box>
                                <Typography variant="subtitle2" gutterBottom>
                                    Assign Ticket
                                </Typography>
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                    <FormControl fullWidth size="small">
                                        <Select
                                            value={selectedAdmin}
                                            onChange={(e) => setSelectedAdmin(e.target.value)}
                                            displayEmpty
                                        >
                                            <MenuItem value="" disabled>
                                                {ticket.assignedTo
                                                    ? `Currently: ${ticket.assignedTo.firstName} ${ticket.assignedTo.lastName}`
                                                    : 'Select Admin'}
                                            </MenuItem>
                                            {admins.map((admin) => (
                                                <MenuItem key={admin._id} value={admin._id}>
                                                    {admin.firstName} {admin.lastName}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                    <Button
                                        onClick={handleAssignTicket}
                                        disabled={!selectedAdmin}
                                        variant="outlined"
                                    >
                                        Assign
                                    </Button>
                                </Box>
                            </Box>
                        </Box>
                    </Card.Base>
                </div>

                {/* Card 3: Customer Information */}
                <div className="h-full">
                    <Card.Base sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                        <Box sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
                            <Typography variant="h6" fontWeight="bold" gutterBottom>
                                Customer Information
                            </Typography>
                            <Divider sx={{ my: 2 }} />

                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                <Avatar
                                    src={ticket.user?.profilePicture}
                                    sx={{ width: 64, height: 64, mr: 2 }}
                                >
                                    {ticket.user?.firstName?.charAt(0) || ticket.user?.email?.charAt(0)}
                                </Avatar>
                                <Box>
                                    <Typography variant="subtitle1" fontWeight="medium">
                                        {ticket.user?.firstName && ticket.user?.lastName
                                            ? `${ticket.user.firstName} ${ticket.user.lastName}`
                                            : ticket.user?.email}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {ticket.user?.email}
                                    </Typography>
                                </Box>
                            </Box>

                            {ticket.user?.phone && (
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                    <Typography variant="body2" color="text.secondary" sx={{ width: 100 }}>
                                        Phone:
                                    </Typography>
                                    <Typography variant="body2">
                                        {ticket.user.phone}
                                    </Typography>
                                </Box>
                            )}

                           
                        </Box>
                    </Card.Base>
                </div>
            </div>

            {/* Messages/Conversation section below */}
            <div>
                <Card.Base>
                    {/* First message / ticket description */}
                    <Box sx={{ p: 3 }}>
                        <Box 
                            sx={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                mb: 2,
                                py: 1,
                                px: 1,
                                gap: 1.5,
                                borderRadius: 1
                            }}
                        >
                            <Avatar
                                src={ticket.user?.avatar || ticket.user?.profilePicture}
                            >
                                {ticket.user?.firstName?.charAt(0) || ticket.user?.email?.charAt(0)}
                            </Avatar>
                            <Box>
                                <Typography variant="subtitle1" fontWeight="medium">
                                    {ticket.user?.firstName && ticket.user?.lastName
                                        ? `${ticket.user.firstName} ${ticket.user.lastName}`
                                        : ticket.user?.email}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    {formatDate(ticket.createdAt)}
                                </Typography>
                            </Box>
                        </Box>
                        <Typography variant="body1" sx={{ mt: 2, whiteSpace: 'pre-wrap' }}>
                            {ticket.messages?.[0]?.content || 'No description provided'}
                        </Typography>
                    </Box>

                    <Divider />

                    {/* Message thread */}
                    <Box sx={{ maxHeight: '500px', overflow: 'auto', p: 3 }}>
                        {ticket.messages && ticket.messages.length > 1 ? (
                            ticket.messages.slice(1).map((message, index) => (
                                <Box
                                    key={index}
                                    sx={{
                                        mb: 3,
                                        p: 2,
                                        borderRadius: 2,
                                        backgroundColor: message.isAdmin ? '#F0FDF4' : '#F8F9FA'
                                    }}
                                >
                                    <Box 
                                        sx={{ 
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            mb: 1,
                                            py: 0.5,
                                            px: 0.5,
                                            gap: 1.5
                                        }}
                                    >
                                        <Avatar
                                            sx={{
                                                bgcolor: message.isAdmin ? '#16A34A' : '#6B7280'
                                            }}
                                        >
                                            {message.isAdmin ? 'A' : 'U'}
                                        </Avatar>
                                        <Box>
                                            <Typography variant="subtitle2" fontWeight="medium">
                                                {message.isAdmin ? 'Support Agent' : 'Customer'}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                {formatDate(message.createdAt)}
                                            </Typography>
                                        </Box>
                                    </Box>
                                    <Typography variant="body2" sx={{ mt: 1, whiteSpace: 'pre-wrap' }}>
                                        {message.content}
                                    </Typography>
                                </Box>
                            ))
                        ) : (
                            <Typography variant="body2" color="text.secondary" align="center">
                                No replies yet
                            </Typography>
                        )}
                    </Box>

                    <Divider />

                    {/* Reply form */}
                    <Box sx={{ p: 3 }}>
                        <form onSubmit={handleReply}>
                            <TextArea
                                name="replyContent"
                                value={replyContent}
                                onChange={(e) => setReplyContent(e.target.value)}
                                placeholder="Type your reply here..."
                                rows={4}
                                required
                            />
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                                <Button
                                    type="submit"
                                    loading={submitting}
                                    disabled={submitting || !replyContent.trim()}
                                >
                                    Send Reply
                                </Button>
                            </Box>
                        </form>
                    </Box>
                </Card.Base>
            </div>
        </div>
    );
};

export default AdminTicketDetail;