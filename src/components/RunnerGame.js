import React, { useState, useEffect, useRef } from 'react';

const RunnerFigure = ({ speed }) => (
  <svg 
    width="32" 
    height="32" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke={speed > 2 ? '#16a34a' : '#2563eb'} 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    {/* Simple stick figure runner */}
    <circle cx="12" cy="6" r="4" /> {/* Head */}
    <line x1="12" y1="10" x2="12" y2="16" /> {/* Body */}
    <line x1="8" y1="20" x2="12" y2="16" /> {/* Left leg */}
    <line x1="16" y1="20" x2="12" y2="16" /> {/* Right leg */}
    <line x1="6" y1="14" x2="12" y2="12" /> {/* Left arm */}
    <line x1="18" y1="14" x2="12" y2="12" /> {/* Right arm */}
  </svg>
);

const RunnerGame = ({ 
  correctAnswers = 0, 
  totalQuestions = 0,
  timeRemaining = 120, // 2 minutes in seconds
  isGameActive = true
}) => {
  const [distance, setDistance] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [animation, setAnimation] = useState('');
  const requestRef = useRef();
  const previousTimeRef = useRef();

  // Calculate speed based on correct answers
  useEffect(() => {
    const baseSpeed = 1;
    const speedMultiplier = 0.5;
    const newSpeed = baseSpeed + (correctAnswers * speedMultiplier);
    setSpeed(newSpeed);
  }, [correctAnswers]);

  // Animation loop
  const animate = (time) => {
    if (previousTimeRef.current !== undefined) {
      const deltaTime = time - previousTimeRef.current;
      
      // Update distance based on speed and time
      setDistance(prevDistance => {
        const newDistance = prevDistance + (speed * deltaTime * 0.01);
        return newDistance;
      });
    }
    previousTimeRef.current = time;
    requestRef.current = requestAnimationFrame(animate);
  };

  // Start/stop animation based on game state
  useEffect(() => {
    if (isGameActive) {
      requestRef.current = requestAnimationFrame(animate);
    }
    return () => cancelAnimationFrame(requestRef.current);
  }, [isGameActive]);

  // Runner animation class based on speed
  useEffect(() => {
    const animationClass = speed > 2 ? 'animate-bounce' : 'animate-pulse';
    setAnimation(animationClass);
  }, [speed]);

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      {/* Progress Stats */}
      <div className="flex justify-between mb-4">
        <div className="text-sm">
          Speed: {speed.toFixed(1)}x
        </div>
        <div className="text-sm">
          Distance: {Math.floor(distance)}m
        </div>
        <div className="text-sm">
          Time: {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}
        </div>
      </div>

      {/* Runner Track */}
      <div className="relative w-full h-24 bg-gradient-to-r from-blue-100 to-blue-50 rounded-lg overflow-hidden">
        {/* Runner Character */}
        <div 
          className={`absolute bottom-4 left-8 transform ${animation}`}
          style={{
            transition: 'transform 0.3s ease-in-out'
          }}
        >
          <RunnerFigure speed={speed} />
        </div>

        {/* Track Markers */}
        <div className="absolute bottom-0 w-full h-1 bg-gray-300" />
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute bottom-1 w-1 h-2 bg-gray-400"
            style={{ left: `${(i + 1) * 12.5}%` }}
          />
        ))}
      </div>

      {/* Game Stats */}
      <div className="mt-4 flex justify-between text-sm text-gray-600">
        <div>
          Correct: {correctAnswers}/{totalQuestions}
        </div>
        <div>
          Accuracy: {totalQuestions > 0 ? ((correctAnswers / totalQuestions) * 100).toFixed(1) : 0}%
        </div>
      </div>
    </div>
  );
};

export default RunnerGame;