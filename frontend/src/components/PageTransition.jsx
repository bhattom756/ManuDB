import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const PageTransition = ({ children }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [displayChildren, setDisplayChildren] = useState(children);
  const location = useLocation();

  useEffect(() => {
    setIsVisible(false);
    
    const timer = setTimeout(() => {
      setDisplayChildren(children);
      setIsVisible(true);
    }, 50);

    return () => clearTimeout(timer);
  }, [location.pathname, children]);

  return (
    <div 
      className={`page-transition-wrapper ${isVisible ? 'page-transition-enter-active' : 'page-transition-enter'}`}
    >
      {displayChildren}
    </div>
  );
};

export default PageTransition;