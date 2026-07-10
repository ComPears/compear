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
import { useLanguage } from '../context/LanguageContext';

interface SuggestionDialogProps {
  open: boolean;
  onClose: () => void;
}

const SuggestionDialog: React.FC<SuggestionDialogProps> = ({ open, onClose }) => {
  const { t } = useLanguage();
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
      aria-labelledby="suggestion-dialog-title"
      PaperProps={{
        sx: { borderRadius: 2 }
      }}
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
        <Typography id="suggestion-dialog-title" variant="h6" component="div">
          💡 {t('suggestion.title')}
        </Typography>
        <IconButton 
          onClick={handleClose} 
          disabled={isSubmitting}
          size="small"
          aria-label={t('dialog.close')}
          sx={{ minWidth: 44, minHeight: 44 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" paragraph>
            {t('suggestion.description')}
          </Typography>

          {submitStatus === 'success' && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {t('suggestion.success')}
            </Alert>
          )}

          {submitStatus === 'error' && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {t('suggestion.error')}
            </Alert>
          )}

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label={t('suggestion.name')}
              variant="outlined"
              fullWidth
              value={formData.name}
              onChange={handleInputChange('name')}
              disabled={isSubmitting}
              placeholder={t('suggestion.namePlaceholder')}
            />

            <TextField
              label={t('suggestion.email')}
              type="email"
              variant="outlined"
              fullWidth
              value={formData.email}
              onChange={handleInputChange('email')}
              disabled={isSubmitting}
              placeholder={t('suggestion.emailPlaceholder')}
              helperText={t('suggestion.emailHint')}
            />

            <TextField
              label={t('suggestion.message')}
              variant="outlined"
              fullWidth
              multiline
              rows={4}
              value={formData.suggestion}
              onChange={handleInputChange('suggestion')}
              disabled={isSubmitting}
              placeholder={t('suggestion.messagePlaceholder')}
              required
              error={!formData.suggestion.trim() && submitStatus === 'error'}
              helperText={!formData.suggestion.trim() && submitStatus === 'error' ? t('suggestion.required') : ''}
            />
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button 
            onClick={handleClose} 
            disabled={isSubmitting}
            color="inherit"
          >
            {t('search.cancel')}
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={!formData.suggestion.trim() || isSubmitting}
            startIcon={isSubmitting ? <CircularProgress size={20} /> : <SendIcon />}
          >
            {isSubmitting ? t('suggestion.sending') : t('suggestion.send')}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default SuggestionDialog; 