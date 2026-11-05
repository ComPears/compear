import { Container } from '@mui/material';
import AppNavBar from '../components/AppNavBar';
import Footer from '../components/Footer';
import { GuideShelf } from '../components/GuideShelf';
import { Seo } from '../components/Seo';
import { useCountry } from '../context/CountryContext';
import { useLanguage } from '../context/LanguageContext';

export function GuidesPage() {
  const { country } = useCountry(), { t } = useLanguage();
  return <><Seo title={`${t('guides.nav')} | ComPear`} description={t('guides.subtitle')} path={`/${country.code}/guides`} country={country.code} /><AppNavBar /><Container component="main" maxWidth="lg"><GuideShelf full /></Container><Footer /></>;
}
