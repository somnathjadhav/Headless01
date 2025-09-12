import React from 'react';
import Image from 'next/image';

export default function GeometricDesign() {
  return (
    <div className="relative w-full h-screen overflow-hidden">
      <Image
        src="/signup-bg.webp"
        alt="Signup background"
        fill
        className="object-cover object-top"
        style={{
          objectPosition: 'center -10%', // Crops from top by 10%
        }}
        priority
      />
    </div>
  );
}
