// src/app/Root.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Breadcrumbs from '../components/Breadcrumbs';
import Starfield from '../components/Starfield';

export default function Root(){
  return (
    <div className="app-bg">
      {/* слой звёзд — поверх background .app-bg */}
      <Starfield maxStars={380} />

      {/* контент — выше звёзд */}
      <div className="relative z-10">
        <Navbar/>
        <Breadcrumbs/>
        <Outlet/>
        <Footer/>
      </div>
    </div>
  );
}
