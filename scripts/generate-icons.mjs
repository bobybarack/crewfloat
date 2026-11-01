import {mkdirSync, writeFileSync} from 'node:fs';
import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {HugeiconsIcon} from '@hugeicons/react';
import {
  Add01Icon, AlertCircleIcon, ArrowDown01Icon, ArrowLeft01Icon,
  ArrowRight01Icon, ArrowUp01Icon, ArrowUpDownIcon, Cancel01Icon,
  CheckmarkSquare02Icon, Copy01Icon, FilterIcon, Layers01Icon,
  Loading03Icon, Menu01Icon, MinusSignIcon, MoreVerticalIcon,
  Search01Icon, Settings01Icon, Square01Icon, Tick02Icon
} from '@hugeicons/core-free-icons';

// Generate library SVGs with the official renderer; no custom path geometry.
const icons = {
  add: Add01Icon, alert: AlertCircleIcon, 'arrow-down': ArrowDown01Icon,
  'arrow-left': ArrowLeft01Icon, 'arrow-right': ArrowRight01Icon,
  'arrow-up': ArrowUp01Icon, 'arrow-up-down': ArrowUpDownIcon,
  check: Tick02Icon, 'check-square': CheckmarkSquare02Icon,
  close: Cancel01Icon, copy: Copy01Icon, filter: FilterIcon,
  layers: Layers01Icon, loading: Loading03Icon, menu: Menu01Icon,
  minus: MinusSignIcon, more: MoreVerticalIcon, search: Search01Icon,
  settings: Settings01Icon, square: Square01Icon
};
mkdirSync('public/icons/hugeicons', {recursive: true});
for (const [name, icon] of Object.entries(icons)) {
  writeFileSync(`public/icons/hugeicons/${name}.svg`, renderToStaticMarkup(createElement(HugeiconsIcon, {
    icon, size: 24, strokeWidth: 1.8, color: '#000000', 'data-icon-library': 'hugeicons'
  })) + '\n');
}
writeFileSync('public/favicon.svg', renderToStaticMarkup(createElement(HugeiconsIcon, {
  icon: Layers01Icon, size: 32, strokeWidth: 2, color: '#205d49', 'data-icon-library': 'hugeicons'
})) + '\n');
