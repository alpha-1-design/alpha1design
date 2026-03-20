import '../styles/globals.css';
import Head from 'next/head';
import { ThemeProvider } from '../lib/ThemeContext';

export default function App({ Component, pageProps }) {
  return (
    <ThemeProvider>
      <Head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="theme-color" content="#080808" />
        <meta name="description" content="Alpha-1 Design — AI writing, image compression, and color palette tools." />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="A1D" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        <title>Alpha-1 Design</title>
      </Head>
      <div className="page-enter">
        <Component {...pageProps} />
      </div>
    </ThemeProvider>
  );
}
