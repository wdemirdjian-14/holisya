import Header from '@/components/header';
import Footer from '@/components/footer';
import AboutClient from './about-client';
import { getSiteContentMap } from '@/lib/site-content';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'À Propos' };

export default async function AboutPage() {
  const content = await getSiteContentMap([
    'about.overline', 'about.title', 'about.signature', 'about.founder_heading',
    'about.founder_paragraph_1', 'about.founder_paragraph_2', 'about.founder_paragraph_3',
    'about.values_title', 'about.value_1_title', 'about.value_1_desc', 'about.value_2_title', 'about.value_2_desc',
    'about.value_3_title', 'about.value_3_desc', 'about.value_4_title', 'about.value_4_desc',
  ]);
  return (<><Header /><main className="pt-20"><AboutClient content={content} /></main><Footer /></>);
}
