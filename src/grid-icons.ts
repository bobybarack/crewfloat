import {iconOverrides} from 'ag-grid-community';

const icon = (name: string) => ({url: `/icons/hugeicons/${name}.svg`});

// Replace the grid's built-in icon set, including filter popup controls.
export const hugeiconsGrid = iconOverrides({type: 'image', mask: true, icons: {
  asc: icon('arrow-up'), desc: icon('arrow-down'), none: icon('arrow-up-down'),
  'small-up': icon('arrow-up'), 'small-down': icon('arrow-down'),
  'small-left': icon('arrow-left'), 'small-right': icon('arrow-right'),
  up: icon('arrow-up'), down: icon('arrow-down'), left: icon('arrow-left'), right: icon('arrow-right'),
  first: icon('arrow-left'), previous: icon('arrow-left'), next: icon('arrow-right'), last: icon('arrow-right'),
  expanded: icon('arrow-down'), contracted: icon('arrow-right'),
  'tree-open': icon('arrow-down'), 'tree-closed': icon('arrow-right'), 'tree-indeterminate': icon('minus'),
  menu: icon('menu'), 'menu-alt': icon('more'), filter: icon('filter'),
  'filter-active': icon('filter'), 'filter-add': icon('add'),
  'filter-card-expand': icon('arrow-down'), 'filter-card-collapse': icon('arrow-up'),
  search: icon('search'), cross: icon('close'), cancel: icon('close'), tick: icon('check'),
  plus: icon('add'), minus: icon('minus'), loading: icon('loading'), settings: icon('settings'),
  columns: icon('layers'), copy: icon('copy'), document: icon('layers'),
  'checkbox-checked': icon('check-square'), 'checkbox-unchecked': icon('square'),
  'checkbox-indeterminate': icon('minus'), 'radio-button-on': icon('check'), 'radio-button-off': icon('square')
}});
