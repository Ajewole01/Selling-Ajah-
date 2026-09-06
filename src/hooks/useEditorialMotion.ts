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
      gsap.utils.toArray<HTMLElement>('.sa-reveal', node).forEach(item => {
        gsap.from(item, { y: 38, opacity: 0, duration: .75, ease: 'power3.out', scrollTrigger: { trigger: item, start: 'top 88%', once: true } });
      });
    }, node);
    return () => context.revert();
  }, [root]);
}
