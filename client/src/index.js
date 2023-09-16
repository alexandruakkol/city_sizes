import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';


const root = ReactDOM.createRoot(document.getElementById('root'));

if(!window.citySizes) 
    window.citySizes = {
        centroids:{}
    };

root.render(
    <App />
);
