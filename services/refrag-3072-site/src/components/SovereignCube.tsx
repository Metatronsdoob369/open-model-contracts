'use client';

import React, { useState, useEffect } from 'react';

const WORDS = [
  'CANONICAL', 'SHATTER', 'MANIFEST', 'VAULT', 
  '3072D_CORE', 'TEMPORAL', 'LUAU_REFRAG', 'SOVEREIGN',
  'AGENCY', 'REFRAG', 'GOTH_TAG', 'METROPOLIS'
];

const SovereignCube = () => {
  const [faces, setFaces] = useState(['VAULT', 'LAW', 'SHATTER', '4D_DNA', 'STABLE', 'CANON']);

  useEffect(() => {
    const interval = setInterval(() => {
      setFaces(prev => prev.map(() => WORDS[Math.floor(Math.random() * WORDS.length)]));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full py-8 flex justify-center items-center">
      <style>{`
        .cube-wrapper {
          width: 120px;
          height: 120px;
          perspective: 800px;
        }
        .cube {
          position: relative;
          width: 100%;
          height: 100%;
          transform-style: preserve-3d;
          animation: rotate-cube 15s infinite linear;
        }
        .face {
          position: absolute;
          width: 120px;
          height: 120px;
          background: rgba(0, 0, 0, 0.95);
          border: 1px solid transparent;
          border-image: linear-gradient(to right, #00EEFF, #50FF32) 1;
          color: #00EEFF;
          font-family: monospace;
          font-size: 10px;
          font-weight: bold;
          line-height: 120px;
          text-align: center;
          letter-spacing: 0.1em;
          box-shadow: inset 0 0 15px rgba(0, 238, 255, 0.1);
          text-shadow: 0 0 5px rgba(0, 238, 255, 0.5);
          backdrop-filter: blur(4px);
        }
        .front  { transform: translateZ(60px); }
        .back   { transform: rotateY(180deg) translateZ(60px); }
        .right  { transform: rotateY(90deg) translateZ(60px); }
        .left   { transform: rotateY(-90deg) translateZ(60px); }
        .top    { transform: rotateX(90deg) translateZ(60px); }
        .bottom { transform: rotateX(-90deg) translateZ(60px); }

        @keyframes rotate-cube {
          0% { transform: rotateX(0) rotateY(0) rotateZ(0); }
          100% { transform: rotateX(360deg) rotateY(360deg) rotateZ(360deg); }
        }
        .matrix-flicker {
          animation: flicker 2s infinite alternate;
        }
        @keyframes flicker {
          0% { opacity: 1; filter: skew(0deg); }
          50% { opacity: 0.8; }
          100% { opacity: 1; }
        }
      `}</style>
      
      <div className="cube-wrapper hover:scale-110 transition-transform duration-500">
        <div className="cube">
          <div className="face front"><span className="matrix-flicker">{faces[0]}</span></div>
          <div className="face back"><span className="matrix-flicker">{faces[1]}</span></div>
          <div className="face right"><span className="matrix-flicker">{faces[2]}</span></div>
          <div className="face left"><span className="matrix-flicker">{faces[3]}</span></div>
          <div className="face top"><span className="matrix-flicker">{faces[4]}</span></div>
          <div className="face bottom"><span className="matrix-flicker">{faces[5]}</span></div>
        </div>
      </div>
    </div>
  );
}

export default SovereignCube;
