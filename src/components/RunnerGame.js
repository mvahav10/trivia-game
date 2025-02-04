import React, { useRef, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { useAnimations, useGLTF, OrbitControls, Environment } from '@react-three/drei';

// Configure GLTFLoader for your model path
useGLTF.preload("/runner.glb"); // Adjust this path to where your model is located

function Runner({ speed, isRunning }) {
  const group = useRef();
  const { scene, animations } = useGLTF("/runner.glb"); // Adjust this path as well
  const { actions } = useAnimations(animations, group);

  useEffect(() => {
    // Adjust animation speed based on correct answers
    const currentAction = actions?.run; // Use optional chaining as animations might not be loaded yet
    if (currentAction) {
      currentAction.setEffectiveTimeScale(speed);
      if (isRunning) {
        currentAction.play();
      } else {
        currentAction.stop();
      }
    }
  }, [actions, speed, isRunning]);

  return <primitive object={scene} ref={group} />;
}

const RunnerGame = ({ 
  correctAnswers = 0, 
  totalQuestions = 0,
  timeRemaining = 120,
  isGameActive = true
}) => {
  const [speed, setSpeed] = React.useState(1);
  const [distance, setDistance] = React.useState(0);

  useEffect(() => {
    const baseSpeed = 1;
    const speedMultiplier = 0.5;
    const newSpeed = baseSpeed + (correctAnswers * speedMultiplier);
    setSpeed(newSpeed);
  }, [correctAnswers]);

  // Calculate distance
  useEffect(() => {
    if (isGameActive) {
      const interval = setInterval(() => {
        setDistance(prev => prev + speed * 0.1);
      }, 100);
      return () => clearInterval(interval);
    }
  }, [speed, isGameActive]);

  return (
    <div className="w-full max-w-4xl mx-auto p-4 bg-gradient-to-b from-sky-100 to-white rounded-xl shadow-lg">
      {/* Stats Bar */}
      <div className="flex justify-between mb-4 text-sm font-medium">
        <div className="flex items-center">
          <div className="w-2 h-2 rounded-full bg-blue-500 mr-2" />
          <span>Speed: {speed.toFixed(1)}x</span>
        </div>
        <div className="flex items-center">
          <div className="w-2 h-2 rounded-full bg-green-500 mr-2" />
          <span>Distance: {Math.floor(distance)}m</span>
        </div>
        <div className="flex items-center">
          <div className="w-2 h-2 rounded-full bg-purple-500 mr-2" />
          <span>Time: {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}</span>
        </div>
      </div>

      {/* 3D Runner Scene */}
      <div className="w-full h-64 rounded-lg overflow-hidden">
        <Canvas shadows>
          <color attach="background" args={['#f0f9ff']} />
          
          {/* Lighting */}
          <ambientLight intensity={0.5} />
          <directionalLight
            position={[10, 10, 10]}
            castShadow
            shadow-mapSize={[1024, 1024]}
          />

          {/* Ground */}
          <mesh 
            rotation={[-Math.PI / 2, 0, 0]} 
            position={[0, -1, 0]} 
            receiveShadow
          >
            <planeGeometry args={[100, 100]} />
            <meshStandardMaterial color="#f0f9ff" />
          </mesh>

          {/* Runner */}
          <Runner speed={speed} isRunning={isGameActive} />

          {/* Camera Controls */}
          <OrbitControls 
            enableZoom={false}
            enablePan={false}
            maxPolarAngle={Math.PI / 2}
            minPolarAngle={Math.PI / 4}
          />
        </Canvas>
      </div>

      {/* Progress Stats */}
      <div className="mt-4 flex justify-between text-sm text-gray-600">
        <div className="flex items-center">
          <div className="w-2 h-2 rounded-full bg-blue-500 mr-2" />
          <span>Correct: {correctAnswers}/{totalQuestions}</span>
        </div>
        <div className="flex items-center">
          <div className="w-2 h-2 rounded-full bg-green-500 mr-2" />
          <span>Accuracy: {totalQuestions > 0 ? ((correctAnswers / totalQuestions) * 100).toFixed(1) : 0}%</span>
        </div>
      </div>
    </div>
    /*fdfdf*/
  );
};

export default RunnerGame;