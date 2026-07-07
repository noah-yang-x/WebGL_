// src/components/ImageCard.tsx

import React from 'react';
// import { motion } from 'framer-motion';

interface ImageCardProps {
  onClick?: () => void;
  width: string;
  height: string;
  color: string;
  borderColor: string;
  label: string;
  text?: string;
  otherStyle?: string;
}

const LinkBox: React.FC<ImageCardProps> = ({
  onClick,
  width = "w-48",
  height = "h-48",
  color = "three",
  borderColor,
  text='',
  label='',
}) => {

  const custumeClass = `${width} ${height} ${borderColor} border-4 p-2 flex items-center`;
  // const custumeClass = `${width} ${height} border-three-300 border-4 p-2 flex items-center`;
  const textClass = `text-3xl ${color} font-bold`;

  return (
    <div className={custumeClass} onClick={onClick}>
      <div className={textClass}>
        <div >&lt;<span>{label}</span>&gt;</div>
        <div >&nbsp;&nbsp;&nbsp;&nbsp;<span className='text-xl'>{text}</span></div>
        <div >&lt;&#47;<span>{label}</span>&gt;</div>
      </div>
    </div>
  );
};

export default LinkBox;