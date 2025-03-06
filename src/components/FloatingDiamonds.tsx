import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';

// Generate random positions and speeds for each diamond
const generateDiamondProps = () => {
  return {
    x: Math.random() * 100 - 50, // Random starting position
    y: Math.random() * 100 - 50,
    duration: Math.random() * 20 + 15, // Random duration between 15-35 seconds
    size: Math.random() * 40 + 20, // Random size between 20-60px
  };
};

// Create an array of diamonds with random properties
const diamonds = Array.from({ length: 8 }).map(() => generateDiamondProps());

const FloatingDiamonds: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {diamonds.map((diamond, index) => (
        <motion.div
          key={index}
          className="absolute"
          style={{
            width: diamond.size,
            height: diamond.size,
          }}
          animate={{
            x: ['0%', '100%', '0%'],
            y: ['0%', '100%', '0%'],
          }}
          transition={{
            duration: diamond.duration,
            ease: "linear",
            repeat: Infinity,
            repeatType: "reverse"
          }}
          initial={{
            x: `${diamond.x}%`,
            y: `${diamond.y}%`,
          }}
        >
          <Image
            src={index % 2 === 0 ? '/diamond1.png' : '/diamond2.png'}
            alt="Floating diamond"
            fill
            className="opacity-20"
          />
        </motion.div>
      ))}
    </div>
  );
};

export default FloatingDiamonds; 