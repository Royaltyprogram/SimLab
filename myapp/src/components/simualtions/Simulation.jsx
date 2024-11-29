import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';

const ProjectileMotion = () => {
  const canvasRef = useRef(null);
  const frameRef = useRef(null);
  const animationSpeedRef = useRef(1/60); // 60 FPS
  
  const [velocity, setVelocity] = useState(50);
  const [angle, setAngle] = useState(45);
  const [isSimulating, setIsSimulating] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [time, setTime] = useState(0);

  const g = 9.81;
  const scale = 5;

  // 입력값 검증 강화
  const validateInputs = useCallback((v, a) => {
    if (isNaN(v) || v < 0 || v > 100) return false;
    if (isNaN(a) || a < 0 || a > 90) return false;
    return true;
  }, []);

  // 캔버스 크기 조정 함수
  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;
  }, []);

  const drawBackground = useCallback((ctx, canvas) => {
    if (!ctx || !canvas) return;
    
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 그리드 그리기
    ctx.strokeStyle = '#ddd';
    ctx.lineWidth = 1;
    ctx.beginPath();
    
    const gridSize = 50;
    for (let x = 0; x <= canvas.width; x += gridSize) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
    }
    for (let y = 0; y <= canvas.height; y += gridSize) {
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
    }
    ctx.stroke();
  }, []);

  const drawProjectile = useCallback((ctx, canvas, x, y) => {
    if (!ctx || !canvas) return;
    
    ctx.beginPath();
    ctx.arc(x, canvas.height - y, 5, 0, Math.PI * 2);
    ctx.fillStyle = 'red';
    ctx.fill();
  }, []);

  const calculateTrajectory = useMemo(() => {
    const angleRad = (angle * Math.PI) / 180;
    return (t) => ({
      x: Math.round((velocity * Math.cos(angleRad) * t * scale) * 100) / 100,
      y: Math.round((velocity * Math.sin(angleRad) * t - 0.5 * g * t * t) * scale * 100) / 100
    });
  }, [velocity, angle, scale]);

  const animate = useCallback(() => {
    if (!isSimulating || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    setTime(prevTime => {
      const newTime = prevTime + animationSpeedRef.current;
      const { x, y } = calculateTrajectory(newTime);
      
      drawBackground(ctx, canvas);
      drawProjectile(ctx, canvas, x, y);
      setPosition({ x, y });

      if (y <= 0) {
        setIsSimulating(false);
        return prevTime;
      }
      
      frameRef.current = requestAnimationFrame(animate);
      return newTime;
    });
  }, [isSimulating, calculateTrajectory, drawBackground, drawProjectile]);

  useEffect(() => {
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [resizeCanvas]);

  useEffect(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (isSimulating) {
      animate();
    } else {
      drawBackground(ctx, canvas);
      drawProjectile(ctx, canvas, position.x, position.y);
    }
  }, [isSimulating, animate, drawBackground, drawProjectile, position]);

  const startSimulation = useCallback(() => {
    if (!validateInputs(velocity, angle)) {
      alert('유효하지 않은 입력값입니다. 속도(0-100 m/s)와 각도(0-90°)를 확인해주세요.');
      return;
    }
    
    setTime(0);
    setPosition({ x: 0, y: 0 });
    setIsSimulating(true);
  }, [velocity, angle, validateInputs]);

  return (
    <div className="p-4">
      <div className="mb-4 space-y-2">
        <div>
          <label className="mr-2">초기 속도 (m/s):</label>
          <input 
            type="number" 
            value={velocity}
            onChange={(e) => {
              const val = parseFloat(e.target.value);
              if (!isNaN(val)) setVelocity(val);
            }}
            className="border p-1"
            min="0"
            max="100"
            step="0.1"
          />
        </div>
        <div>
          <label className="mr-2">발사 각도 (도):</label>
          <input 
            type="number" 
            value={angle}
            onChange={(e) => {
              const val = parseFloat(e.target.value);
              if (!isNaN(val)) setAngle(val);
            }}
            className="border p-1"
            min="0"
            max="90"
            step="0.1"
          />
        </div>
        <button
          onClick={startSimulation}
          disabled={isSimulating}
          className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {isSimulating ? '시뮬레이션 중...' : '시작'}
        </button>
      </div>
      <canvas
        ref={canvasRef}
        className="border border-gray-300 w-full h-[400px]"
      />
    </div>
  );
};

export default ProjectileMotion;