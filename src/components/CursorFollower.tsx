import React, { useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { gsap } from 'gsap';

const INTERACTIVE_SELECTOR = [
  'a',
  'button',
  '[role="button"]',
  '[role="tab"]',
  'summary',
  '.sa-vehicle-card',
  '[id^="property-card-"]',
  '[id^="apartment-card-"]'
].join(',');

const FORM_SELECTOR = 'input, textarea, select, option, [contenteditable="true"]';

export const CursorFollower: React.FC = () => {
  const { currentPath } = useApp();
  const dotRef = useRef<HTMLDivElement>(null);
  const hoveredTargetRef = useRef<Element | null>(null);
  const isAdmin = currentPath === '/admin' || currentPath.startsWith('/admin/');

  useEffect(() => {
    const dot = dotRef.current;
    const canUseCursor = window.matchMedia('(pointer: fine) and (hover: hover)').matches;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!dot || isAdmin || !canUseCursor || reduceMotion) return;

    let cleanupListeners = () => {};
    const context = gsap.context(() => {
      const moveX = gsap.quickTo(dot, 'x', { duration: 0.42, ease: 'power3.out' });
      const moveY = gsap.quickTo(dot, 'y', { duration: 0.42, ease: 'power3.out' });
      const scaleXTo = gsap.quickTo(dot, 'scaleX', { duration: 0.3, ease: 'power3.out' });
      const scaleYTo = gsap.quickTo(dot, 'scaleY', { duration: 0.3, ease: 'power3.out' });
      const opacityTo = gsap.quickTo(dot, 'opacity', { duration: 0.3, ease: 'power3.out' });

      const isIgnoredTarget = (target: EventTarget | null) =>
        target instanceof Element && Boolean(target.closest(FORM_SELECTOR));

      const findInteractiveTarget = (target: EventTarget | null) => {
        if (!(target instanceof Element) || isIgnoredTarget(target)) return null;
        return target.closest(INTERACTIVE_SELECTOR);
      };

      const setHoverState = (target: Element | null) => {
        if (hoveredTargetRef.current === target) return;
        hoveredTargetRef.current = target;
        const isMedia = Boolean(target?.matches('.sa-vehicle-card, [id^="property-card-"], [id^="apartment-card-"]'));
        const scale = target ? (isMedia ? 2.8 : 2.4) : 1;
        scaleXTo(scale);
        scaleYTo(scale);
        opacityTo(target ? 0.72 : 0.9);
        dot.classList.toggle('is-outline', Boolean(target));
      };

      const handlePointerMove = (event: PointerEvent) => {
        moveX(event.clientX);
        moveY(event.clientY);
        if (dot.style.visibility !== 'visible') dot.style.visibility = 'visible';
        setHoverState(findInteractiveTarget(event.target));
      };

      const handlePointerOver = (event: PointerEvent) => {
        setHoverState(findInteractiveTarget(event.target));
      };

      const handlePointerOut = (event: PointerEvent) => {
        const nextTarget = event.relatedTarget;
        if (nextTarget instanceof Node && event.currentTarget instanceof Node && event.currentTarget.contains(nextTarget)) {
          setHoverState(findInteractiveTarget(nextTarget));
          return;
        }
        setHoverState(null);
      };

      const handleWindowBlur = () => {
        setHoverState(null);
        dot.style.visibility = 'hidden';
      };

      window.addEventListener('pointermove', handlePointerMove, { passive: true });
      document.addEventListener('pointerover', handlePointerOver, { passive: true });
      document.addEventListener('pointerout', handlePointerOut, { passive: true });
      window.addEventListener('blur', handleWindowBlur);

      cleanupListeners = () => {
        window.removeEventListener('pointermove', handlePointerMove);
        document.removeEventListener('pointerover', handlePointerOver);
        document.removeEventListener('pointerout', handlePointerOut);
        window.removeEventListener('blur', handleWindowBlur);
        gsap.killTweensOf(dot);
      };
    }, dot);

    return () => {
      cleanupListeners();
      context.revert();
    };
  }, [isAdmin]);

  if (isAdmin) return null;

  return <div ref={dotRef} className="sa-cursor-follower" aria-hidden="true" />;
};
