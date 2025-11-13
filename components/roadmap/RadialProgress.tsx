import React from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';

interface RadialProgressProps {
  progress: number; // 0 to 100
}

const RadialProgress: React.FC<RadialProgressProps> = ({ progress }) => {
  const size = 80;
  const strokeWidth = 8;
  const center = size / 2;
  const radius = center - strokeWidth / 2;
  const circumference = 2 * Math.PI * radius;

  // Animate the progress value with a spring for a smooth effect
  const progressSpring = useSpring(progress, { stiffness: 100, damping: 30 });
  const displayProgress = useTransform(progressSpring, (p) => Math.round(p));
  const strokeDashoffset = useTransform(progressSpring, (p) => circumference - (p / 100) * circumference);

  return (
    <div style={{ width: size, height: size }} className="relative">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={center}
          cy={center}
          r={radius}
          strokeWidth={strokeWidth}
          className="stroke-slate-200"
          fill="transparent"
        />
        <motion.circle
          cx={center}
          cy={center}
          r={radius}
          strokeWidth={strokeWidth}
          className="stroke-primary"
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${center} ${center})`}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.span className="text-xl font-bold text-primary">
          {displayProgress}
        </motion.span>
        <span className="text-sm font-semibold text-primary mt-1">%</span>
      </div>
    </div>
  );
};

export default RadialProgress;