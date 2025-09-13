
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="w-full max-w-3xl mx-auto text-center mb-8">
      <h1 className="text-4xl sm:text-5xl font-bold text-cyan-300 tracking-wider">
        Gemini Adventure
      </h1>
      <p className="text-lg text-cyan-500">The Endless Quest</p>
    </header>
  );
};

export default Header;
