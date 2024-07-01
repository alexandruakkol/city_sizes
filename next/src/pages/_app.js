import './App.css';
import './index.css';
import App from './index.js';
import React from 'react';
import RootLayout from './layout.js';

export default function MyApp({ Component, pageProps }) {
    
    return <RootLayout>
        <App {...pageProps} />
    </RootLayout>
}