import Header from '@/components/header';
import Footer from '@/components/footer';
import ContactClient from './contact-client';

export const metadata = { title: 'Contact' };

export default function ContactPage() {
  return (<><Header /><main className="pt-20"><ContactClient /></main><Footer /></>);
}
