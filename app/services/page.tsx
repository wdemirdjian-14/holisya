import Header from '@/components/header';
import Footer from '@/components/footer';
import ServicesClient from './services-client';

export const metadata = { title: 'Nos Soins' };

export default function ServicesPage() {
  return (<><Header /><main className="pt-20"><ServicesClient /></main><Footer /></>);
}
