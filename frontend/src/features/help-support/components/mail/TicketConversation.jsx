// src/components/tickets/TicketConversation.jsx
import React, { useContext } from 'react';
import { useParams } from 'react-router-dom';
import { 
  Card,
  Button,
  InputBox, 
  TextArea,
  AppIcon,
  Loader
} from '@shared/index';
import { 
  Box, 
  Typography, 
  Avatar, 
  Chip, 
  Divider,
  Paper,
  IconButton
} from '@mui/material';
import { styled } from '@mui/material/styles';
import useTicketConversation from './useTicketConversation';
import { 
  formatDate, 
  getStatusColor, 
  getStatusIcon, 
  getPriorityInfo,
  formatTicketNumber,
  isCurrentUserSender,
  getInitials,
  formatMessageContent
} from './userTicketUtils';
import AuthContext from '@shared/context/AuthContext';

// Styled Components
const MessageBubble = styled(Paper)(({ theme, isCurrentUser, isAdmin }) => ({
  padding: theme.spacing(2),
  marginBottom: theme.spacing(2),
  maxWidth: '80%',
  borderRadius: theme.spacing(1.5),
  position: 'relative',
  ...(isCurrentUser ? {
    backgroundColor: theme.palette.primary.light,
    color: theme.palette.primary.contrastText,
    alignSelf: 'flex-end',
  } : isAdmin ? {
    backgroundColor: theme.palette.secondary.light,
    color: theme.palette.secondary.contrastText,
    alignSelf: 'flex-start',
  } : {
    backgroundColor: theme.palette.background.default,
    alignSelf: 'flex-start',
  }),
}));

const MessageContainer = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
  marginBottom: '16px',
});

const ReplyContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2),
  padding: theme.spacing(2),
  borderTop: `1px solid ${theme.palette.divider}`,
}));

const TicketConversation = () => {
  const { ticketId } = useParams();
  const { user } = useContext(AuthContext);
  const { 
    ticket, 
    loading, 
    error, 
    replyContent, 
    setReplyContent, 
    sendReply, 
    markAsResolved,
    updateTicketStatus
  } = useTicketConversation(ticketId);

  // Early return for loading and error states
  if (loading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 'calc(100vh - 200px)' }}>
      <Loader />
    </Box>
  );
  
  if (error) return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: 'calc(100vh - 200px)',
      gap: 2
    }}>
      <AppIcon name="alert-triangle" size={40} color="error" />
      <Typography color="error" variant="h6">{error}</Typography>
      <Button 
        variant="outlined"
        onClick={() => window.history.back()}
        startIcon={<AppIcon name="arrow-left" />}
      >
        Go Back
      </Button>
    </Box>
  );
  
  if (!ticket) return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: 'calc(100vh - 200px)',
      gap: 2
    }}>
      <AppIcon name="file-question" size={40} />
      <Typography variant="h6">Ticket not found</Typography>
      <Button 
        variant="outlined"
        onClick={() => window.history.back()}
        startIcon={<AppIcon name="arrow-left" />}
      >
        Go Back
      </Button>
    </Box>
  );

  const isAdmin = user?.role === 'admin';
  const statusColor = getStatusColor(ticket.status);
  const statusIcon = getStatusIcon(ticket.status);
  const { color: priorityColor } = getPriorityInfo(ticket.priority || 'medium');
  const formattedTicketNumber = formatTicketNumber(ticket.ticketNumber);
  
  const canResolve = 
    user && 
    !isAdmin && 
    ticket.status === 'in-progress';
  
  const canReply = 
    user && 
    ['open', 'in-progress'].includes(ticket.status);

  return (
    <Box sx={{ width: '100%', maxWidth: 900, mx: 'auto', py: 3, px: 2 }}>
      {/* Ticket Header */}
      <Card.Base 
        variant={statusColor}
        elevation={3}
        sx={{ mb: 3 }}
      >
        <Box sx={{ p: 2 }}>
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={2} flexWrap="wrap" gap={1}>
            <Box display="flex" alignItems="center" gap={1}>
              <AppIcon name='ticket' size={20} />
              <Typography variant="h6" fontWeight="bold">
                {formattedTicketNumber}: {ticket.subject}
              </Typography>
            </Box>
            <Chip 
              label={ticket.status.toUpperCase()} 
              color={statusColor}
              size="small"
            />
          </Box>
          
          <Divider sx={{ my: 2 }} />
          
          <Box display="flex" flexWrap="wrap" gap={3} justifyContent="space-between">
            <Box minWidth="120px">
              <Typography variant="body2" color="text.secondary">Category</Typography>
              <Typography variant="body1">{ticket.category || 'General'}</Typography>
            </Box>
            <Box minWidth="120px">
              <Typography variant="body2" color="text.secondary">Priority</Typography>
              <Chip 
                label={(ticket.priority || 'Medium').toUpperCase()}
                color={priorityColor}
                size="small"
              />
            </Box>
            <Box minWidth="150px">
              <Typography variant="body2" color="text.secondary">Created</Typography>
              <Typography variant="body1">{formatDate(ticket.createdAt)}</Typography>
            </Box>
            <Box minWidth="150px">
              <Typography variant="body2" color="text.secondary">Last Updated</Typography>
              <Typography variant="body1">{formatDate(ticket.updatedAt)}</Typography>
            </Box>
          </Box>
          
          {isAdmin && ticket.assignedTo && (
            <Box mt={2}>
              <Typography variant="body2" color="text.secondary">Assigned To</Typography>
              <Box display="flex" alignItems="center" gap={1}>
                <Avatar sx={{ width: 24, height: 24 }}>
                  {getInitials(
                    `${ticket.assignedTo.firstName || ''} ${ticket.assignedTo.lastName || ''}`
                  )}
                </Avatar>
                <Typography>
                  {ticket.assignedTo.firstName} {ticket.assignedTo.lastName}
                </Typography>
              </Box>
            </Box>
          )}
        </Box>
      </Card.Base>

      {/* Conversation Timeline */}
      <Card.Base elevation={2} sx={{ mb: 3 }}>
        <Box sx={{ p: 2 }}>
          <Typography variant="h6" mb={2}>Conversation</Typography>
          
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: 3, 
            height: '400px',
            maxHeight: '50vh', 
            overflowY: 'auto',
            p: 1
          }}>
            {ticket.messages && ticket.messages.length > 0 ? (
              ticket.messages.map((message, index) => {
                const senderIsCurrentUser = isCurrentUserSender(message, user?._id);
                let senderName = 'Unknown User';
                
                if (senderIsCurrentUser) {
                  senderName = `${user.firstName} ${user.lastName}`;
                } else if (message.isAdmin) {
                  senderName = 'Support Agent';
                } else if (ticket.user) {
                  senderName = `${ticket.user.firstName || ''} ${ticket.user.lastName || ''}`.trim() || 'User';
                }
                
                return (
                  <MessageContainer key={index}>
                    <Box 
                      display="flex" 
                      alignItems="center"
                      justifyContent={senderIsCurrentUser ? 'flex-end' : 'flex-start'}
                      gap={1}
                      mb={1}
                    >
                      {!senderIsCurrentUser && (
                        <Avatar sx={{ width: 32, height: 32 }}>
                          {getInitials(senderName)}
                        </Avatar>
                      )}
                      <Typography variant="body2" color="text.secondary">
                        {senderName} • {formatDate(message.createdAt)}
                      </Typography>
                      {message.isAdmin && <Chip label="Staff" size="small" color="secondary" />}
                      {senderIsCurrentUser && (
                        <Avatar sx={{ width: 32, height: 32 }}>
                          {getInitials(senderName)}
                        </Avatar>
                      )}
                    </Box>
                    
                    <MessageBubble 
                      isCurrentUser={senderIsCurrentUser}
                      isAdmin={message.isAdmin}
                      elevation={1}
                    >
                      <Typography 
                        variant="body1"
                        dangerouslySetInnerHTML={{ 
                          __html: formatMessageContent(message.content) 
                        }}
                      />
                    </MessageBubble>
                  </MessageContainer>
                );
              })
            ) : (
              <Box 
                sx={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  height: '100%',
                  opacity: 0.7
                }}
              >
                <AppIcon name="message-square" size={40} />
                <Typography variant="body1" mt={1}>No messages yet</Typography>
              </Box>
            )}
          </Box>
          
          {/* Reply Form */}
          {canReply && (
            <ReplyContainer>
              <TextArea
                rows={4}
                placeholder="Type your reply here..."
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                fullWidth
                variant="outlined"
              />
              
              <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
                {/* {canResolve && (
                  <Button 
                    variant="outlined"
                    color="success"
                    startIcon={<AppIcon name="check" />}
                    onClick={markAsResolved}
                  >
                    Mark as Resolved
                  </Button>
                )}
                 */}
                <Box ml="auto">
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<AppIcon name="send" />}
                    onClick={sendReply}
                    disabled={!replyContent.trim()}
                  >
                    Send Reply
                  </Button>
                </Box>
              </Box>
            </ReplyContainer>
          )}
          
          {/* Closed/Resolved Message */}
          {!canReply && (
            <Box 
              textAlign="center" 
              p={3} 
              bgcolor="background.paper" 
              borderRadius={1}
              border={1}
              borderColor="divider"
            >
              
              <Typography variant="h6" color="text.secondary" mt={1}>
                This ticket is {ticket.status === 'closed' ? 'closed' : 'resolved'}
              </Typography>
              {ticket.status === 'resolved' && isAdmin && (
                <Button
                  variant="outlined"
                  color="primary"
                  size="small"
                  startIcon={<AppIcon name="lock" />}
                  onClick={() => updateTicketStatus('closed')}
                  sx={{ mt: 2 }}
                >
                  Close Ticket
                </Button>
              )}
            </Box>
          )}
        </Box>
      </Card.Base>
    </Box>
  );
};

export default TicketConversation;