import { RefObject, useLayoutEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/** A small, reusable reveal system for public pages. It deliberately avoids motion on touch/reduced-motion users. */
export function useEditorialMotion<T extends HTMLElement>(root: RefObject<T | null>) {
  useLayoutEffect(() => {
    const node = root.current;
    if (!node || window.matchMedia('(prefers-reduced-motion: reduce)').matches || window.matchMedia('(pointer: coarse)').matches) return;
    const context = gsap.context(() => {
      const hero = node.querySelector<HTMLElement>('.sa-hero:not(.sa-cinematic-hero), .sa-cars-hero');
      const heroImage = node.querySelector<HTMLElement>('.sa-hero:not(.sa-cinematic-hero) .sa-hero__image, .sa-cars-hero__image');
      const heroContent = node.querySelector<HTMLElement>('.sa-hero__content, .sa-cars-hero__content');
      if (hero && heroImage && heroContent) {
        const heroTimeline = gsap.timeline({ defaults: { ease: 'power3.out' } });
        heroTimeline
          .from(heroImage, { scale: 1.06, duration: 1.35, ease: 'power2.out' }, 0)
          .from(heroContent.children, { y: 26, opacity: 0, duration: 0.8, stagger: 0.1 }, 0.2)
          .from(hero.querySelector('.sa-hero__footer, .sa-cars-hero__footer'), { opacity: 0, duration: 0.6 }, 0.72);
        gsap.to(heroImage, {
          yPercent: 5,
          ease: 'none',
          scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true }
        });
      }
      const masthead = node.querySelector('.sa-catalogue__masthead, .sa-detail__masthead');
      if (masthead) gsap.from(masthead.children, { y: 26, opacity: 0, duration: .7, ease: 'power3.out', stagger: .1 });
      gsap.utils.toArray<HTMLElement>('.sa-editorial-page > section:first-child > div, .sa-section__top', node).forEach(item => {
        gsap.from(item, { y: 28, opacity: 0, duration: .8, ease: 'power3.out', scrollTrigger: { trigger: item, start: 'top 84%', once: true } });
      });
      gsap.utils.toArray<HTMLElement>('.sa-detail .aspect-\\[16\\/9\\], .sa-detail .aspect-\\[21\\/9\\]', node).forEach(item => {
        gsap.from(item, { clipPath: 'inset(0 0 100% 0)', duration: 1, ease: 'power3.inOut', scrollTrigger: { trigger: item, start: 'top 86%', once: true } });
      });
      gsap.utils.toArray<HTMLElement>('.sa-vehicle-card, .sa-cars-principles > div, .sa-cars-steps > div', node).forEach(item => {
        gsap.from(item, { y: 30, opacity: 0, duration: .75, ease: 'power3.out', scrollTrigger: { trigger: item, start: 'top 88%', once: true } });
      });
      const mediaImage = node.querySelector<HTMLElement>('.sa-cars-media__image');
      if (mediaImage) gsap.to(mediaImage, { yPercent: 6, ease: 'none', scrollTrigger: { trigger: mediaImage, start: 'top bottom', end: 'bottom top', scrub: true } });

      // Viewport-fixed image reveal inside scrolling mask window (.sa-locations)
      const locationsSection = node.querySelector<HTMLElement>('#locations-fixed-window, .sa-locations');
      const fixedLayer = node.querySelector<HTMLElement>('#locations-fixed-viewport-layer, .sa-locations-fixed-viewport-layer');
      if (locationsSection && fixedLayer) {
        // Initial visibility check to ensure proper state on fresh load or mid-page reload
        const rect = locationsSection.getBoundingClientRect();
        if (rect.bottom > 0 && rect.top < window.innerHeight) {
          fixedLayer.classList.add('is-visible');
        } else {
          fixedLayer.classList.remove('is-visible');
        }

        // Toggle fixed layer visibility purely at viewport boundaries without continuous scroll translation
        ScrollTrigger.create({
          trigger: locationsSection,
          start: 'top bottom',
          end: 'bottom top',
          onEnter: () => fixedLayer.classList.add('is-visible'),
          onEnterBack: () => fixedLayer.classList.add('is-visible'),
          onLeave: () => fixedLayer.classList.remove('is-visible'),
          onLeaveBack: () => fixedLayer.classList.remove('is-visible'),
        });
      }

      // About page editorial reveals
      const aboutPortrait = node.querySelector<HTMLElement>('.sa-about-founder-portrait img');
      if (aboutPortrait) {
        gsap.from(aboutPortrait, { scale: 1.08, duration: 1.5, ease: 'power2.out' });
      }
      const aboutFounderCopy = node.querySelector<HTMLElement>('.sa-about-founder-copy');
      if (aboutFounderCopy) {
        gsap.from(aboutFounderCopy.children, { y: 24, opacity: 0, duration: 0.85, stagger: 0.1, ease: 'power3.out', delay: 0.15 });
      }
      gsap.utils.toArray<HTMLElement>('.sa-about-brands-list article', node).forEach(item => {
        gsap.from(item, { y: 20, opacity: 0, duration: 0.7, ease: 'power3.out', scrollTrigger: { trigger: item, start: 'top 88%', once: true } });
      });
      gsap.utils.toArray<HTMLElement>('.sa-about-values-list article', node).forEach(item => {
        gsap.from(item, { y: 20, opacity: 0, duration: 0.7, ease: 'power3.out', scrollTrigger: { trigger: item, start: 'top 88%', once: true } });
      });
      const aboutVideo = node.querySelector<HTMLElement>('.sa-about-video-frame');
      if (aboutVideo) {
        gsap.from(aboutVideo, { y: 28, opacity: 0, duration: 0.85, ease: 'power3.out', scrollTrigger: { trigger: aboutVideo, start: 'top 85%', once: true } });
      }
      gsap.utils.toArray<HTMLElement>('.sa-about-mission-grid > div', node).forEach(item => {
        gsap.from(item, { y: 20, opacity: 0, duration: 0.75, ease: 'power3.out', scrollTrigger: { trigger: item, start: 'top 86%', once: true } });
      });

      gsap.utils.toArray<HTMLElement>('.sa-reveal', node).forEach(item => {
        gsap.from(item, { y: 38, opacity: 0, duration: .75, ease: 'power3.out', scrollTrigger: { trigger: item, start: 'top 88%', once: true } });
      });
    }, node);
    return () => context.revert();
  }, [root]);
}
