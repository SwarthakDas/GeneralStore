/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"
import React, { useEffect, useRef } from 'react';
import Script from 'next/script';
import Navbar from '@/components/Navbar';

const Page = () => {
  const vantaRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    let effect: { destroy: () => void } | undefined;
    
    const initVanta = () => {
      if ((window as any).VANTA && vantaRef.current) {
        effect = (window as any).VANTA.BIRDS({
          el: vantaRef.current,
          mouseControls: true,
          touchControls: true,
          gyroControls: false,
          minHeight: 200.00,
          minWidth: 200.00,
          scale: 1.00,
          scaleMobile: 1.00,
          color1: 0x0,
          color2: 0x153789,
          colorMode: "lerp",
          birdSize: 1.10,
          wingSpan: 31.00,
          separation: 61.00,
          alignment: 38.00,
          cohesion: 11.00,
          backgroundAlpha: 0.05
        });
      }
    };
    
    // Check if VANTA is already loaded
    if ((window as any).VANTA) {
      initVanta();
    } else {
      // Set up event listener for when scripts finish loading
      window.addEventListener('vantaLoaded', initVanta);
    }
    
    // Clean up
    return () => {
      if (effect) effect.destroy();
      window.removeEventListener('vantaLoaded', initVanta);
    };
  }, []);

  return (
    <div className='min-h-screen flex flex-col'>      
      {/* Load required scripts */}
      <Script 
        src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r134/three.min.js"
        strategy="beforeInteractive"
      />
      <Script 
        src="https://cdn.jsdelivr.net/npm/vanta@latest/dist/vanta.birds.min.js"
        strategy="afterInteractive"
        onLoad={() => {
          window.dispatchEvent(new Event('vantaLoaded'));
        }}
      />
      
      <div 
        ref={vantaRef}
        className='relative h-screen'
      >
        <div>
          <Navbar/>
        </div>
      </div>
    </div>
  );
};

export default Page;