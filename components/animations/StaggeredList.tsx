import React from 'react';
import FadeInView from './FadeInView';

interface StaggeredListProps {
  children: React.ReactNode[];
  staggerDelay?: number;
  initialDelay?: number;
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
}

export default function StaggeredList({
  children,
  staggerDelay = 150,
  initialDelay = 0,
  direction = 'up',
}: StaggeredListProps) {
  return (
    <>
      {React.Children.map(children, (child, index) => (
        <FadeInView 
          key={index}
          delay={initialDelay + index * staggerDelay}
          direction={direction}
        >
          {child}
        </FadeInView>
      ))}
    </>
  );
}