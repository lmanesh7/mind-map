import React, { useState, useEffect } from 'react';
import Snackbar from '@mui/material/Snackbar';
import Button from '@mui/material/Button';

const Footer: React.FC = () => {
  const [openSnackbar, setOpenSnackbar] = useState(false);

  useEffect(() => {
    // Show the interactive prompt after 15 seconds
    const timer = setTimeout(() => {
      setOpenSnackbar(true);
    }, 15000);

    return () => clearTimeout(timer);
  }, []);

  const handleShare = () => {
    navigator.clipboard.writeText('Check out this awesome Mind Map app! https://mind-map-bf7j.onrender.com/');
    alert('Link copied to clipboard! Thank you for sharing.');
  };

  return (
    <>
      <div style={{
        position: 'absolute',
        bottom: 2.5,
        right: 60,
        zIndex: 10,
        background: 'rgba(255, 255, 255, 0.8)',
        padding: '5px 10px',
        borderRadius: '5px',
        fontSize: '12px',
        boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
        backdropFilter: 'blur(5px)'
      }}>
        <span>Built by </span>
        <span className="glow-text" style={{ fontWeight: 'bold', fontSize:"15px" }}>
          <a href="https://github.com/lmanesh7" target="_blank" rel="noreferrer" style={{ textDecoration: 'none', color: 'inherit' }}>lmanesh7</a> | <a href="https://github.com/lmanesh7/mind-map" target="_blank" rel="noreferrer" style={{ textDecoration: 'none', color: 'inherit' }}>GitHub Repo</a>
        </span>
      </div>

      <Snackbar
        open={openSnackbar}
        onClose={() => setOpenSnackbar(false)}
        message="Enjoying the app? Please give it a star on GitHub!"
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        action={
          <>
            <Button 
              variant="contained" 
              size="medium" 
              href="https://github.com/lmanesh7/mind-map" 
              target="_blank" 
              onClick={() => setOpenSnackbar(false)}
              style={{ backgroundColor: 'inherit', color: '#f0bf03', fontWeight: 'bold', fontSize: '1rem', marginRight: '8px' }}
            >
              ⭐ Star Repo
            </Button>
            <Button color="inherit" size="small" onClick={handleShare}>
              Share
            </Button>
            <Button color="inherit" size="small" onClick={() => setOpenSnackbar(false)}>
              Close
            </Button>
          </>
        }
      />
    </>
  );
};

export default Footer;
