'use client';

import { useRef, useState, useEffect, ReactNode } from 'react';

interface CardDeckProps {
  children: ReactNode;
  totalCards: number;
}

export default function CardDeck({ children, totalCards }: CardDeckProps) {
  const deckRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const deck = deckRef.current;
    if (!deck) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const index = Number(entry.target.getAttribute('data-card-index'));
            if (!isNaN(index)) setActiveIndex(index);
          }
        }
      },
      { root: deck, threshold: 0.6 },
    );

    const cards = deck.querySelectorAll('[data-card-index]');
    cards.forEach((card) => observer.observe(card));

    return () => observer.disconnect();
  }, []);

  const scrollTo = (index: number) => {
    const deck = deckRef.current;
    if (!deck) return;
    const card = deck.querySelector(`[data-card-index="${index}"]`);
    card?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown' || e.key === ' ') {
        e.preventDefault();
        if (activeIndex < totalCards - 1) scrollTo(activeIndex + 1);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (activeIndex > 0) scrollTo(activeIndex - 1);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeIndex, totalCards]);

  return (
    <>
      <div ref={deckRef} className="wrapped-deck">
        {children}
      </div>

      {/* 도트 인디케이터 */}
      <div className="dot-indicator">
        {Array.from({ length: totalCards }, (_, i) => (
          <button
            key={i}
            className={`dot ${i === activeIndex ? 'active' : ''}`}
            onClick={() => scrollTo(i)}
            aria-label={`카드 ${i + 1}로 이동`}
          />
        ))}
      </div>
    </>
  );
}
