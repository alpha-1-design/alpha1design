import Head from 'next/head';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function FAQPage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Head><title>FAQ — Alpha-1 Design</title></Head>
      <Header />
      <main style={{ flex: 1, maxWidth: '860px', margin: '0 auto', padding: '48px 24px', width: '100%' }}>
        <div style={{ marginBottom: '40px' }}>
          <span className="label" style={{ display: 'block', marginBottom: '10px', color: 'var(--ai)' }}>HELP</span>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(32px, 6vw, 64px)', letterSpacing: '0.04em', lineHeight: 1 }}>
            FREQUENTLY<br/>ASKED
          </h1>
        </div>
      </main>
      <Footer />
    </div>
  );
}
