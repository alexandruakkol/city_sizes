import Script from 'next/script';

export default function RootLayout(children) {
  return (
    <html lang="en">
      <Script
        strategy='lazyOnload'
        src={`https://www.googletagmanager.com/gtag/js?id=${process.env.REACT_GANALYTICS_ID}`}
      />
      <Script id='' strategy='lazyOnload'>
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${process.env.REACT_GANALYTICS_ID}', {
          page_path: window.location.pathname,
          });
        `}
      </Script>    
      <body>{children}</body>
    </html>
  )
} 