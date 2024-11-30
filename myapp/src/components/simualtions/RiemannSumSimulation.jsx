import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Sketch from 'react-p5';

const RiemannSumSimulation = () => {
  const [rectangles, setRectangles] = useState(10);
  const [functionType, setFunctionType] = useState('quadratic');
  const [customFunction, setCustomFunction] = useState('2 * x * x');
  const [sumType, setSumType] = useState('left');
  const [error, setError] = useState(null);

  const [dimensions, setDimensions] = useState({
    width: Math.min(800, window.innerWidth - 40),
    height: 400
  });

  const margin = 40;
  const graphWidth = dimensions.width - 2 * margin;
  const graphHeight = dimensions.height - 2 * margin;

  useEffect(() => {
    const handleResize = () => {
      setDimensions({
        width: Math.min(800, window.innerWidth - 40),
        height: 400
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const safeEval = (expr, x) => {
    try {
      const dangerousKeywords = ['eval', 'Function', 'constructor', 'prototype', 'window', 'document'];
      if (dangerousKeywords.some(keyword => expr.includes(keyword))) {
        throw new Error('Invalid expression');
      }

      // Replace math functions with Math object references
      const processedExpr = expr
        .replace(/\bsin\b/g, 'Math.sin')
        .replace(/\bcos\b/g, 'Math.cos')
        .replace(/\btan\b/g, 'Math.tan')
        .replace(/\babs\b/g, 'Math.abs')
        .replace(/\bsqrt\b/g, 'Math.sqrt')
        .replace(/\bpow\b/g, 'Math.pow')
        .replace(/\bexp\b/g, 'Math.exp')
        .replace(/\blog\b/g, 'Math.log')
        .replace(/\bpi\b/g, 'Math.PI')
        .replace(/\be\b/g, 'Math.E');

      const func = new Function('x', `'use strict'; return ${processedExpr}`);
      return func(x);
    } catch (err) {
      throw new Error('Expression evaluation error');
    }
  };

  const evaluateFunction = useCallback((x, type) => {
    try {
      if (type === 'custom') {
        return safeEval(customFunction, x);
      }

      switch (type) {
        case 'quadratic':
          return 2 * x * x;
        case 'linear':
          return 2 * x;
        case 'sine':
          return Math.sin(x * Math.PI) + 1;
        default:
          return x * x;
      }
    } catch (err) {
      setError(err.message);
      return 0;
    }
  }, [customFunction]);

  const calculateRiemannSum = useCallback((n, type, funcType) => {
    try {
      if (n <= 0) throw new Error('Invalid number of rectangles');
      
      const dx = 1 / n;
      let sum = 0;
      
      for (let i = 0; i < n; i++) {
        const x = type === 'left' ? i * dx : (i + 1) * dx;
        sum += evaluateFunction(x, funcType) * dx;
      }
      
      return Number(sum).toFixed(4);
    } catch (err) {
      setError('Calculation error');
      return '0.0000';
    }
  }, [evaluateFunction]);

  const calculatedArea = useMemo(() => {
    return calculateRiemannSum(rectangles, sumType, functionType);
  }, [rectangles, sumType, functionType, calculateRiemannSum]);

  const setup = (p5, canvasParentRef) => {
    p5.createCanvas(dimensions.width, dimensions.height).parent(canvasParentRef);
  };

  const draw = (p5) => {
    try {
      p5.background(255);
      
      // Draw axes
      p5.stroke(0);
      p5.strokeWeight(1);
      p5.line(margin, dimensions.height - margin, dimensions.width - margin, dimensions.height - margin);
      p5.line(margin, margin, margin, dimensions.height - margin);

      // Draw function curve
      p5.stroke(0, 0, 255);
      p5.noFill();
      p5.beginShape();
      for (let x = 0; x <= graphWidth; x++) {
        const xValue = x / graphWidth;
        const yValue = evaluateFunction(xValue, functionType);
        const screenX = x + margin;
        const screenY = dimensions.height - margin - (yValue * graphHeight / 4);
        p5.vertex(screenX, screenY);
      }
      p5.endShape();

      // Draw Riemann rectangles
      const dx = graphWidth / rectangles;
      p5.stroke(255, 0, 0, 100);
      p5.fill(255, 0, 0, 50);

      for (let i = 0; i < rectangles; i++) {
        const x = i * dx;
        const xValue = x / graphWidth;
        const rectX = sumType === 'left' ? xValue : xValue + dx / graphWidth;
        const height = evaluateFunction(rectX, functionType);
        const screenX = x + margin;
        const screenY = dimensions.height - margin;
        const rectHeight = height * graphHeight / 4;
        p5.rect(screenX, screenY, dx, -rectHeight);
      }
    } catch (err) {
      setError('Rendering error');
    }
  };

  return (
    <div className="flex flex-col items-center w-full p-4">
      <div className="w-full max-w-4xl bg-white rounded-lg shadow-lg p-4">
        <h2 className="text-2xl font-bold mb-4 text-center">Riemann Sum Visualization</h2>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        <div className="mb-4">
          <Sketch setup={setup} draw={draw} />
        </div>
        
        <div className="flex flex-wrap gap-4 justify-center mb-4">
          <div className="flex flex-col">
            <label className="mb-2">Number of Rectangles:</label>
            <input
              type="range"
              min="1"
              max="50"
              value={rectangles}
              onChange={(e) => {
                const value = parseInt(e.target.value);
                if (!isNaN(value) && value > 0) {
                  setRectangles(value);
                  setError(null);
                }
              }}
              className="w-48"
            />
            <span className="text-sm text-gray-600">Value: {rectangles}</span>
          </div>
          
          <div className="flex flex-col">
            <label className="mb-2">Function Type:</label>
            <select
              value={functionType}
              onChange={(e) => {
                setFunctionType(e.target.value);
                setError(null);
              }}
              className="p-2 border rounded"
            >
              <option value="quadratic">Quadratic (2x²)</option>
              <option value="linear">Linear (2x)</option>
              <option value="sine">Sine (sin(πx) + 1)</option>
              <option value="custom">Custom Function</option>
            </select>
          </div>
          
          <div className="flex flex-col">
            <label className="mb-2">Sum Type:</label>
            <select
              value={sumType}
              onChange={(e) => {
                setSumType(e.target.value);
                setError(null);
              }}
              className="p-2 border rounded"
            >
              <option value="left">Left Riemann Sum</option>
              <option value="right">Right Riemann Sum</option>
            </select>
          </div>
        </div>

        {functionType === 'custom' && (
          <div className="flex flex-col items-center mb-4">
            <label className="mb-2">Custom Function:</label>
            <input
              type="text"
              value={customFunction}
              onChange={(e) => {
                setCustomFunction(e.target.value);
                setError(null);
              }}
              placeholder="Example: 2 * x * x"
              className="p-2 border rounded w-64"
            />
            <span className="text-sm text-gray-600 mt-1">
              Available: x, sin(x), cos(x), tan(x), sqrt(x), pow(x,y), exp(x), log(x), pi, e
            </span>
          </div>
        )}
        
        <div className="mt-4 text-center">
          <p className="font-semibold">
            Approximate Area: {calculatedArea}
          </p>
        </div>
      </div>
    </div>
  );
};

export default RiemannSumSimulation;