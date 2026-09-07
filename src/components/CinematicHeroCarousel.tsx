import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { ArrowDownRight, ArrowLeft, ArrowRight, MessageSquare, Search, Sparkles } from 'lucide-react';
import { gsap } from 'gsap';
import { useApp } from '../context/AppContext';
import { formatWhatsAppUrl } from '../utils/formatters';

interface HeroSlide {
  image: string;
  alt: string;
  focalPosition: string;
}

const heroSlides: HeroSlide[] = [
  {
    image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=2400&q=88',
    alt: 'Contemporary Lagos residence framed by tropical planting',
    focalPosition: 'center 58%'
  },
  {
    image: 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=2400&q=88',
    alt: 'Warm modern living room with architectural detail',
    focalPosition: 'center center'
  },
  {
    image: 'https://images.unsplash.com/photo-1600607688969-a5bfcd646154?auto=format&fit=crop&w=2400&q=88',
    alt: 'Modern house exterior opening onto a landscaped garden',
    focalPosition: 'center 48%'
  },
  {
    image: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=2400&q=88',
    alt: 'Refined interior with natural light and layered textures',
    focalPosition: 'center center'
  }
];

const AUTOPLAY_SECONDS = 7;
const TRANSITION_SECONDS = 1.45;

export const CinematicHeroCarousel: React.FC = () => {
  const { navigate, settings } = useApp();
  const rootRef = useRef<HTMLElement>(null);
  const slideRefs = useRef<Array<HTMLImageElement | null>>([]);
  const progressRefs = useRef<Array<HTMLSpanElement | null>>([]);
  const activeIndexRef = useRef(0);
  const transitionLockRef = useRef(false);
  const autoplayRef = useRef<gsap.core.Tween | null>(null);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [mode, setMode] = useState<'sale' | 'rent' | 'shortlet'>('sale');
  const [area, setArea] = useState('all');

  const discover = (event: React.FormEvent) => {
    event.preventDefault();
    const suffix = area === 'all' ? '' : `?area=${encodeURIComponent(area)}`;
    navigate(mode === 'shortlet' ? `/shortlets${suffix}` : `/properties?listingType=${mode}${area === 'all' ? '' : `&area=${encodeURIComponent(area)}`}`);
  };

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const context = gsap.context(() => {
      const images = slideRefs.current.filter(Boolean) as HTMLImageElement[];
      const progress = progressRefs.current.filter(Boolean) as HTMLSpanElement[];
      const currentImage = () => images[activeIndexRef.current];

      gsap.set(images, { autoAlpha: 0, scale: 1.04, clipPath: 'inset(0 0 0 0)', xPercent: 0 });
      gsap.set(images[0], { autoAlpha: 1, scale: 1 });
      gsap.set(progress, { scaleX: 0, transformOrigin: 'left center' });
      const content = root.querySelector('.sa-hero__content');
      const footer = root.querySelector('.sa-hero__footer');
      if (content && !reduceMotion) {
        gsap.from(content.children, { y: 24, opacity: 0, duration: 0.8, ease: 'power3.out', stagger: 0.1, delay: 0.2 });
        gsap.from(footer, { opacity: 0, duration: 0.65, ease: 'power3.out', delay: 0.8 });
      }

      const playProgress = () => {
        progress.forEach((line, index) => gsap.set(line, { scaleX: index === activeIndexRef.current ? 0 : index < activeIndexRef.current ? 1 : 0 }));
        if (!reduceMotion) {
          gsap.to(progress[activeIndexRef.current], { scaleX: 1, duration: AUTOPLAY_SECONDS, ease: 'none' });
        } else {
          gsap.set(progress[activeIndexRef.current], { scaleX: 1 });
        }
      };

      const scheduleAutoplay = () => {
        autoplayRef.current?.kill();
        if (document.visibilityState === 'hidden') return;
        autoplayRef.current = gsap.delayedCall(AUTOPLAY_SECONDS, () => transitionTo(activeIndexRef.current + 1));
      };

      const transitionTo = (requestedIndex: number) => {
        if (transitionLockRef.current || images.length < 2) return;
        const nextIndex = (requestedIndex + images.length) % images.length;
        if (nextIndex === activeIndexRef.current) return;
        transitionLockRef.current = true;
        autoplayRef.current?.kill();
        const outgoing = currentImage();
        const incoming = images[nextIndex];
        const direction = nextIndex > activeIndexRef.current || (activeIndexRef.current === images.length - 1 && nextIndex === 0) ? 1 : -1;
        const timeline = gsap.timeline({
          defaults: { ease: 'power3.inOut' },
          onComplete: () => {
            activeIndexRef.current = nextIndex;
            setActiveIndex(nextIndex);
            transitionLockRef.current = false;
            playProgress();
            scheduleAutoplay();
          }
        });

        timeline
          .set(incoming, { zIndex: 2, autoAlpha: 1, scale: 1.07, xPercent: direction * 2, clipPath: direction > 0 ? 'inset(0 100% 0 0)' : 'inset(0 0 0 100%)' })
          .to(outgoing, { scale: 1.035, xPercent: -direction * 1.2, duration: TRANSITION_SECONDS }, 0)
          .to(incoming, { clipPath: 'inset(0 0% 0 0)', scale: 1, xPercent: 0, duration: TRANSITION_SECONDS }, 0)
          .set(outgoing, { zIndex: 0, autoAlpha: 0, scale: 1.04, xPercent: 0 });
      };

      const handleVisibility = () => {
        if (document.visibilityState === 'hidden') {
          autoplayRef.current?.kill();
          gsap.killTweensOf(progress);
        } else {
          playProgress();
          scheduleAutoplay();
        }
      };

      const handleTouchStart = (event: TouchEvent) => { touchStartRef.current = { x: event.changedTouches[0].clientX, y: event.changedTouches[0].clientY }; };
      const handleTouchEnd = (event: TouchEvent) => {
        const start = touchStartRef.current;
        if (!start) return;
        const deltaX = event.changedTouches[0].clientX - start.x;
        const deltaY = event.changedTouches[0].clientY - start.y;
        touchStartRef.current = null;
        if (Math.abs(deltaX) > 55 && Math.abs(deltaX) > Math.abs(deltaY) * 1.25) transitionTo(activeIndexRef.current + (deltaX < 0 ? 1 : -1));
      };

      root.addEventListener('touchstart', handleTouchStart, { passive: true });
      root.addEventListener('touchend', handleTouchEnd, { passive: true });
      document.addEventListener('visibilitychange', handleVisibility);
      playProgress();
      scheduleAutoplay();

      (root as HTMLElement & { transitionTo?: (index: number) => void }).transitionTo = transitionTo;

      root.dataset.carouselReady = 'true';
      (root as HTMLElement & { cleanupCarousel?: () => void }).cleanupCarousel = () => {
        root.removeEventListener('touchstart', handleTouchStart);
        root.removeEventListener('touchend', handleTouchEnd);
        document.removeEventListener('visibilitychange', handleVisibility);
        autoplayRef.current?.kill();
      };
    }, root);

    return () => {
      (root as HTMLElement & { cleanupCarousel?: () => void }).cleanupCarousel?.();
      context.revert();
    };
  }, []);

  const goTo = (index: number) => {
    const root = rootRef.current as (HTMLElement & { transitionTo?: (index: number) => void }) | null;
    root?.transitionTo?.(index);
  };

  return (
    <section ref={rootRef} className="sa-hero sa-cinematic-hero" aria-label="Selling Ajah featured campaign">
      <div className="sa-hero__slides" aria-hidden="true">
        {heroSlides.map((slide, index) => <img key={slide.image} ref={element => { slideRefs.current[index] = element; }} className="sa-hero__image" src={slide.image} alt="" style={{ objectPosition: slide.focalPosition }} loading={index === 0 ? 'eager' : 'lazy'} fetchPriority={index === 0 ? 'high' : 'auto'} onError={event => { event.currentTarget.style.visibility = 'hidden'; }} />)}
      </div>
      <div className="sa-hero__shade" />
      <div className="sa-hero__grid" aria-hidden="true" />
      <div className="sa-hero__content">
        <p className="sa-kicker"><Sparkles size={14} /> Curated property & lifestyle</p>
        <h1>Find your place<br />in <em>Ajah.</em></h1>
        <p className="sa-hero__intro">Exceptional homes, serviced stays and executive mobility across Ajah, Lekki and greater Lagos.</p>
        <div className="sa-hero__actions">
          <form className="sa-discovery" onSubmit={discover}><div className="sa-discovery__tabs" role="tablist" aria-label="Discovery type">{([['sale', 'Buy'], ['rent', 'Rent'], ['shortlet', 'Stay']] as const).map(([value, label]) => <button type="button" role="tab" aria-selected={mode === value} key={value} onClick={() => setMode(value)} className={mode === value ? 'is-active' : ''}>{label}</button>)}</div><label><span>Where</span><select value={area} onChange={event => setArea(event.target.value)}><option value="all">Ajah & Lagos</option><option value="Ajah">Ajah</option><option value="Badore">Badore</option><option value="Sangotedo">Sangotedo</option><option value="Chevron">Chevron</option><option value="VGC">VGC</option></select></label><button className="sa-discovery__submit" type="submit" style={{ backgroundColor: '#c6a15b' }}><Search size={17} /><span>Explore</span></button></form>
          <a className="sa-hero__whatsapp" href={formatWhatsAppUrl(settings.whatsapp, 'Hello Selling Ajah, I would like to speak with an advisor.')} target="_blank" rel="noreferrer"><MessageSquare size={15} /> Talk to an advisor</a>
        </div>
      </div>
      <div className="sa-hero__footer"><span>Scroll to discover</span><ArrowDownRight size={19} /><div className="sa-hero__controls"><button type="button" aria-label="Previous hero image" onClick={() => goTo(activeIndex - 1)}><ArrowLeft size={15} /></button><div className="sa-hero__progress" aria-label={`Slide ${activeIndex + 1} of ${heroSlides.length}`}>{heroSlides.map((slide, index) => <span key={slide.image}><i ref={element => { progressRefs.current[index] = element; }} /><b>{String(index + 1).padStart(2, '0')}</b></span>)}</div><button type="button" aria-label="Next hero image" onClick={() => goTo(activeIndex + 1)}><ArrowRight size={15} /></button></div></div>
    </section>
  );
};
