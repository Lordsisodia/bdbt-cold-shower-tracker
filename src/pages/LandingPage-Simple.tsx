import React from 'react';

const LandingPage: React.FC = () => {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>BDBT - Build Dream Build Team</h1>
      <p>Welcome to your success journey!</p>
      <div style={{ marginTop: '20px' }}>
        <nav>
          <a href="/about" style={{ marginRight: '20px', color: 'blue' }}>About</a>
          <a href="/tips" style={{ marginRight: '20px', color: 'blue' }}>Tips</a>
          <a href="/blueprint" style={{ marginRight: '20px', color: 'blue' }}>Blueprint</a>
        </nav>
      </div>
    </div>
  );
};

export default LandingPage;