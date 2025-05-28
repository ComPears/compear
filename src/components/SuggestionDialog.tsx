import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  IconButton,
  Alert,
  CircularProgress
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';
import { sendSuggestion } from '../services/emailService';

interface SuggestionDialogProps {
  open: boolean;
  onClose: () => void;
}

const SuggestionDialog: React.FC<SuggestionDialogProps> = ({ open, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    suggestion: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'success' | 'error' | null>(null);

  const handleInputChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!formData.suggestion.trim()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      // Send the suggestion using the email service
      await sendSuggestion(formData);
      
      setSubmitStatus('success');
      
      // Reset form after successful submission
      setTimeout(() => {
        setFormData({ name: '', email: '', suggestion: '' });
        setSubmitStatus(null);
        onClose();
      }, 2000);
      
    } catch (error) {
      console.error('Error submitting suggestion:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setFormData({ name: '', email: '', suggestion: '' });
      setSubmitStatus(null);
      onClose();
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2 }
      }}
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
        <Typography variant="h6" component="div">
          💡 Share Your Suggestion
        </Typography>
        <IconButton 
          onClick={handleClose} 
          disabled={isSubmitting}
          size="small"
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" paragraph>
            Help us improve ComPear! Share your ideas, feature requests, or feedback.
          </Typography>

          {submitStatus === 'success' && (
            <Alert severity="success" sx={{ mb: 2 }}>
              Thank you! Your suggestion has been sent successfully. 🎉
            </Alert>
          )}

          {submitStatus === 'error' && (
            <Alert severity="error" sx={{ mb: 2 }}>
              Sorry, there was an error sending your suggestion. Please try again.
            </Alert>
          )}

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Your Name (Optional)"
              variant="outlined"
              fullWidth
              value={formData.name}
              onChange={handleInputChange('name')}
              disabled={isSubmitting}
              placeholder="e.g., John Doe"
            />

            <TextField
              label="Email (Optional)"
              type="email"
              variant="outlined"
              fullWidth
              value={formData.email}
              onChange={handleInputChange('email')}
              disabled={isSubmitting}
              placeholder="e.g., john@example.com"
              helperText="We'll only use this to follow up if needed"
            />

            <TextField
              label="Your Suggestion *"
              variant="outlined"
              fullWidth
              multiline
              rows={4}
              value={formData.suggestion}
              onChange={handleInputChange('suggestion')}
              disabled={isSubmitting}
              placeholder="Share your ideas, feature requests, bug reports, or general feedback..."
              required
              error={!formData.suggestion.trim() && submitStatus === 'error'}
              helperText={!formData.suggestion.trim() && submitStatus === 'error' ? 'Please enter your suggestion' : ''}
            />
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button 
            onClick={handleClose} 
            disabled={isSubmitting}
            color="inherit"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={!formData.suggestion.trim() || isSubmitting}
            startIcon={isSubmitting ? <CircularProgress size={20} /> : <SendIcon />}
          >
            {isSubmitting ? 'Sending...' : 'Send Suggestion'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default SuggestionDialog; 