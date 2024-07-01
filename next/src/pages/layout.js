import Script from 'next/script';

export default function RootLayout({children}) {
  const gtag = process.env.NEXT_PUBLIC_REACT_GANALYTICS_ID;
  return (
    <>
      <Script
        strategy='lazyOnload'
        src={`https://www.googletagmanager.com/gtag/js?id=${gtag}`}
      />
      <Script id='' strategy='lazyOnload'>
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${gtag}', {
          page_path: window.location.pathname,
          });
        `}
      </Script>    
      <>{children}</>
    </>
  )
} 