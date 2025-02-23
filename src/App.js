// src/App.jsx
import html2canvas from 'html2canvas';
import React, { useEffect, useRef, useState } from 'react';
import './App.css';

function App() {
  const [name, setName] = useState('');
  const certificateRef = useRef(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [error, setError] = useState(false);

  // Preload the certificate template with enhanced error handling
  useEffect(() => {
    const img = new Image();
    img.src = '/assets/temp.jpg';
    img.crossOrigin = 'anonymous'; // Handle CORS for local development
    img.onload = () => {
      setImageLoaded(true);
      console.log('Certificate template loaded successfully');
    };
    img.onerror = () => {
      console.error('Failed to load certificate template. Please check public/assets/temp.jpg.');
      alert('Error loading template. Ensure temp.jpg exists in public/assets and is a valid JPEG/PNG file.');
      setError(true);
    };
  }, []);

  const handleDownload = () => {
    if (!name || !imageLoaded || error) {
      alert('Please enter a name and ensure the template image is loaded correctly.');
      return;
    }

    // Create a temporary visible certificate for rendering
    const tempCertificate = certificateRef.current.cloneNode(true);
    document.body.appendChild(tempCertificate);
    tempCertificate.style.display = 'block';
    tempCertificate.style.position = 'absolute';
    tempCertificate.style.top = '-9999px'; // Off-screen rendering

    html2canvas(tempCertificate, {
      useCORS: true,
      scale: 3, // Higher scale for better quality and to capture all content
      backgroundColor: null,
      logging: true, // Enable logging to debug issues
      onclone: (document) => {
        const img = document.querySelector('.certificate-template');
        if (!img || !img.complete || img.naturalWidth === 0) {
          console.error('Certificate template image failed to load or is invalid.');
          throw new Error('Image load or render failed');
        }
      },
    })
      .then((canvas) => {
        const link = document.createElement('a');
        link.download = `FOSS_Hack_25_${name}_certificate.png`;
        link.href = canvas.toDataURL('image/png', 1.0); // High-quality PNG
        link.click();
        document.body.removeChild(tempCertificate); // Clean up
      })
      .catch((error) => {
        console.error('Error generating certificate:', error);
        alert('Failed to generate certificate. Ensure the template image in public/assets/temp.jpg is valid and not corrupted.');
        document.body.removeChild(tempCertificate); // Clean up on error
      })
      .finally(() => {
        // Ensure cleanup even if rendering fails
        if (tempCertificate && tempCertificate.parentNode) {
          document.body.removeChild(tempCertificate);
        }
      });
  };

  return (
    <div className="app-container">
      <div className="form-container">
        <h1 className="title">Fossunited Event Certificate Forum</h1>
        <p className="subtitle">Namaste! Aapka swaagat hai FOSS United Kanpur mein.</p>
        <div className="platform-selection">
          <button className="platform-btn active">FOSS Hack 25</button>
        </div>
        <div className="input-group">
          <label htmlFor="nameInput" className="input-label">Enter Your Name</label>
          <input
            type="text"
            id="nameInput"
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="name-input"
          />
        </div>
        <button 
          onClick={handleDownload}
          disabled={!name || !imageLoaded || error}
          className="download-btn"
        >
          Download Certificate
        </button>
        <p className="choose-text">Choose a Event to generate your certificate</p>
      </div>

      {/* Certificate Preview (Hidden for Capture) */}
      <div className="certificate-wrapper" style={{ display: 'none' }}>
        <div ref={certificateRef} className="certificate">
          <img
            src="/assets/temp.jpg"
            alt="Certificate Template"
            className="certificate-template"
            crossOrigin="anonymous"
            onError={(e) => {
              console.error('Failed to load certificate template.');
              setError(true);
              alert('Certificate template failed to load. Please check public/assets/temp.jpg and ensure it’s a valid image.');
            }}
          />
          <div className="name-overlay">
            <h2 className="cert-name">{name || "Your Name Here"}</h2>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;