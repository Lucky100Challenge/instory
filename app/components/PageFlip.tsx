import React, { useRef, useEffect } from 'react';
import anime from 'animejs';

interface PageFlipProps {
  onAnimationComplete: () => void;
}

const PageFlip: React.FC<PageFlipProps> = ({ onAnimationComplete }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const pageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current && pageRef.current) {
      anime({
        targets: pageRef.current,
        rotateY: [0, -180],
        duration: 1500,
        easing: 'easeInOutSine',
        complete: () => {
          setTimeout(() => {
            if (containerRef.current) {
              containerRef.current.style.display = 'none';
            }
            onAnimationComplete();
          }, 500);
        }
      });
    }
  }, [onAnimationComplete]);

  return (
    <div ref={containerRef} className="fixed inset-0 z-50 perspective-1000 pointer-events-none">
      <div className="w-full h-full relative">
        <div 
          ref={pageRef} 
          className="absolute inset-0 bg-blue-100 shadow-lg origin-left"
          style={{
            backfaceVisibility: 'hidden',
            transformStyle: 'preserve-3d'
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-200 to-purple-100" />
          <div 
            className="absolute inset-0 bg-white" 
            style={{ 
              transform: 'rotateY(180deg)',
              backfaceVisibility: 'hidden'
            }} 
          />
        </div>
      </div>
    </div>
  );
};

export default PageFlip;