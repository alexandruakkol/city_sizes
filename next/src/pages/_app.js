import './App.css';
import './index.css';
import App from './index.js';
import React from 'react';
import RootLayout from './layout.js';

export default function MyApp({ Component, pageProps }) {
    
    if(process.env.NODE_ENV === 'production'){
        console.log = () => {};
    }

    return <RootLayout>
        <App {...pageProps} />
    </RootLayout>
}