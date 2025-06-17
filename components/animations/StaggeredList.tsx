import React from 'react';
import FadeInView from './FadeInView';

interface StaggeredListProps {
  children: React.ReactNode[];
  staggerDelay?: number;
  initialDelay?: number;
}

export default function StaggeredList({
  children,
  staggerDelay = 100,
  initialDelay = 0,
}: StaggeredListProps) {
  return (
    <>
      {React.Children.map(children, (child, index) => (
        <FadeInView delay={initialDelay + index * staggerDelay}>
          {child}
        </FadeInView>
      ))}
    </>
  );
}