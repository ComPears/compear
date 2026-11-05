import { Box, Typography } from '@mui/material';
import { useLanguage } from '../context/LanguageContext';

export function ShoppingPrinciples() {
  const { t } = useLanguage();
  return <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }, gap: 2, my: 3 }}>
    {['compare', 'units', 'evidence'].map((key, index) => <Box key={key} sx={{ p: 2.5, bgcolor: index === 1 ? 'primary.dark' : '#f1f3e9', color: index === 1 ? 'white' : 'text.primary', borderRadius: 3, textAlign: 'left' }}>
      <Typography variant="overline" sx={{ opacity: 0.75, letterSpacing: '0.12em' }}>0{index + 1}</Typography>
      <Typography component="h2" variant="h6" sx={{ my: 0.5 }}>{t(`discovery.${key}`)}</Typography>
      <Typography variant="body2" sx={{ opacity: 0.85 }}>{t(`discovery.${key}Hint`)}</Typography>
    </Box>)}
  </Box>;
}
