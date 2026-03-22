import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* PWA */}
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#080808" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="A1D" />

        {/* Apple touch icons */}
        <link rel="apple-touch-icon" sizes="192x192" href="/icons/icon-192.png" />
        <link rel="apple-touch-icon" sizes="512x512" href="/icons/icon-512.png" />

        {/* OG / Social */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Alpha-1 Design — Premium Creative Studio" />
        <meta property="og:description" content="AI writing, image compression, and color palette tools. Installable PWA." />
        <meta property="og:image" content="/icons/icon-512.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Alpha-1 Design" />
        <meta name="twitter:description" content="AI writing, image compression, and color palette tools." />

        {/* Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Mono:ital,wght@0,300;0,400;0,500;1,300&family=Syne:wght@400;600;700;800&display=swap" rel="stylesheet" />
      </Head>
      <body>
        {/* Alpha Analytics Tracker */}
        <script dangerouslySetInnerHTML={{ __html: `
          (function(){
            var SITE_ID = "ab8304c6";
            var API_URL = "https://alpha-analytics-api.onrender.com";
            if(navigator.doNotTrack==="1")return;
            function pv(){fetch(API_URL+"/track/pageview",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({site_id:SITE_ID,path:location.pathname,referrer:document.referrer||null}),keepalive:true}).catch(function(){});}
            pv();
            var _ps=history.pushState;history.pushState=function(){_ps.apply(this,arguments);pv();};
            window.addEventListener("popstate",pv);
          })();
        `}} />
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
