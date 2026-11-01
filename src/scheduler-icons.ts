import {ArrowLeft01Icon, ArrowRight01Icon} from '@hugeicons/core-free-icons';

export function installSchedulerIcons(root: HTMLElement) {
  // Bryntum creates these SVG slots internally. Preserve its elements and event
  // hooks, replacing only the geometry with the official Hugeicons icon data.
  const apply = () => {
    for (const svg of root.querySelectorAll<SVGSVGElement>('svg.b-grid-splitter-button-icon:not([data-icon-library="hugeicons"])')) {
      const data = svg.classList.contains('b-grid-region-expand-arrow') ? ArrowRight01Icon : ArrowLeft01Icon;
      svg.setAttribute('viewBox', '0 0 24 24');
      svg.setAttribute('width', '16');
      svg.setAttribute('height', '16');
      svg.setAttribute('fill', 'none');
      svg.setAttribute('stroke', 'currentColor');
      svg.setAttribute('aria-hidden', 'true');
      svg.setAttribute('data-icon-library', 'hugeicons');
      svg.replaceChildren(...data.map(([tag, attributes]) => {
        const child = document.createElementNS('http://www.w3.org/2000/svg', tag);
        for (const [name, value] of Object.entries(attributes)) {
          if (name !== 'key') child.setAttribute(name.replace(/[A-Z]/g, c => `-${c.toLowerCase()}`), String(name === 'strokeWidth' ? 1.8 : value));
        }
        return child;
      }));
    }
  };
  apply();
  const observer = new MutationObserver(apply);
  observer.observe(root, {childList: true, subtree: true});
  return () => observer.disconnect();
}
