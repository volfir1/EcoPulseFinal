import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '@shared/context/AuthContext';
import ticketService from '../../../services/ticketService';
import { useSnackbar } from '@components/toast-notif/ToastNotification';
import { useLoader } from '@components/loaders/useLoader';
export const useTicketDetail = (id) => {
    const navigate = useNavigate();
    const { user, isAuthenticated } = useContext(AuthContext);
    const toast = useSnackbar();
    const loader = useLoader();

    const [ticket, setTicket] = useState(null);
    const [loading, setLoading] = useState(true);
    const [replyContent, setReplyContent] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [newStatus, setNewStatus] = useState('');
    const [admins, setAdmins] = useState([]);
    const [selectedAdmin, setSelectedAdmin] = useState('');

    // Check if user is admin
    useEffect(() => {
        if (isAuthenticated && user?.role !== 'admin') {
            toast.error('You do not have access to this page');
            navigate('/');
        }
    }, [isAuthenticated, user, navigate, toast]);

    // Fetch ticket data
    useEffect(() => {
        const fetchTicket = async () => {
            setLoading(true);
            // Show global loader - check if loader.showLoader exists before calling
            if (loader && typeof loader.showLoader === 'function') {
                loader.showLoader();
            }
            try {
                const response = await ticketService.getTicket(id);
                setTicket(response.data.data || response.data);
                setNewStatus(response.data.status || 'open');
            } catch (error) {
                console.error('Error fetching ticket:', error);
                toast.error(error.message || 'Failed to fetch ticket');
                navigate('/admin/tickets');
            } finally {
                setLoading(false);
                // Hide global loader - check if loader.hideLoader exists before calling
                if (loader && typeof loader.hideLoader === 'function') {
                    loader.hideLoader();
                }
            }
        };

        // Fetch admin list for assignment
        const fetchAdmins = async () => {
            try {
                const response = await ticketService.getAdmins();
                setAdmins(response.data);
            } catch (error) {
                console.error('Error fetching admins:', error);
            }
        };

        if (id) {
            fetchTicket();
            fetchAdmins();
        }
    }, [id, navigate, toast, loader]);

    // Handle reply to ticket
    const handleReply = async (e) => {
        e.preventDefault();

        if (!replyContent.trim()) {
            toast.warning('Please enter a reply');
            return;
        }

        setSubmitting(true);
        // Show global loader
        if (loader && typeof loader.showLoader === 'function') {
            loader.showLoader();
        }
        try {
            const response = await ticketService.replyToTicket(id, replyContent);
            setTicket(response.data);
            setReplyContent('');
            toast.success('Reply sent successfully');
        } catch (error) {
            console.error('Error replying to ticket:', error);
            toast.error(error.message || 'Failed to send reply');
        } finally {
            setSubmitting(false);
            // Hide global loader
            if (loader && typeof loader.hideLoader === 'function') {
                loader.hideLoader();
            }
        }
    };

    // Handle status change
    const handleStatusChange = async (e) => {
        const status = e.target.value;
        setNewStatus(status);
        
        // Show global loader
        if (loader && typeof loader.showLoader === 'function') {
            loader.showLoader();
        }
        try {
            const response = await ticketService.updateTicketStatus(id, status);
            setTicket(response.data);
            toast.success(`Ticket status updated to ${status}`);
        } catch (error) {
            console.error('Error updating ticket status:', error);
            toast.error(error.message || 'Failed to update ticket status');
            // Revert to previous status on error
            setNewStatus(ticket.status);
        } finally {
            // Hide global loader
            if (loader && typeof loader.hideLoader === 'function') {
                loader.hideLoader();
            }
        }
    };

    // Handle admin assignment
    const handleAssignTicket = async () => {
        if (!selectedAdmin) {
            toast.warning('Please select an admin to assign');
            return;
        }

        // Show global loader
        if (loader && typeof loader.showLoader === 'function') {
            loader.showLoader();
        }
        try {
            const response = await ticketService.assignTicket(id, selectedAdmin);
            setTicket(response.data);
            toast.success('Ticket assigned successfully');
        } catch (error) {
            console.error('Error assigning ticket:', error);
            toast.error(error.message || 'Failed to assign ticket');
        } finally {
            // Hide global loader
            if (loader && typeof loader.hideLoader === 'function') {
                loader.hideLoader();
            }
        }
    };

    return {
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
    };
};