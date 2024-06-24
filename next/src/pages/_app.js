import './App.css';
import './index.css';
import App from './index.js';
import React from 'react';


export default function MyApp({ Component, pageProps }) {
    return <App {...pageProps} />;
}