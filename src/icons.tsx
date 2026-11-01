import {HugeiconsIcon, type HugeiconsProps, type IconSvgElement} from '@hugeicons/react';
import {
  Add01Icon, AlertCircleIcon, ArrowRight01Icon, ArrowUpRight01Icon,
  Calendar03Icon, Cancel01Icon, CheckmarkCircle02Icon, Clock01Icon,
  Copy01Icon, Dollar01Icon, File01Icon, Layers01Icon, Refresh01Icon,
  Settings01Icon, ShieldCheckIcon, SparklesIcon, Task01Icon,
  TestTube01Icon, Tick02Icon
} from '@hugeicons/core-free-icons';

type IconProps = Omit<HugeiconsProps, 'icon'>;
function iconComponent(icon: IconSvgElement) {
  return function Icon(props: IconProps) {
    return <HugeiconsIcon icon={icon} size={20} strokeWidth={1.8}
      aria-hidden="true" focusable="false" data-icon-library="hugeicons" {...props}/>;
  };
}

export const Add = iconComponent(Add01Icon);
export const Alert = iconComponent(AlertCircleIcon);
export const ArrowRight = iconComponent(ArrowRight01Icon);
export const ArrowUpRight = iconComponent(ArrowUpRight01Icon);
export const Calendar = iconComponent(Calendar03Icon);
export const Check = iconComponent(Tick02Icon);
export const CheckCircle = iconComponent(CheckmarkCircle02Icon);
export const Clock = iconComponent(Clock01Icon);
export const Close = iconComponent(Cancel01Icon);
export const Copy = iconComponent(Copy01Icon);
export const CurrencyDollar = iconComponent(Dollar01Icon);
export const FileText = iconComponent(File01Icon);
export const Flask = iconComponent(TestTube01Icon);
export const Layers = iconComponent(Layers01Icon);
export const Refresh = iconComponent(Refresh01Icon);
export const Settings = iconComponent(Settings01Icon);
export const ShieldCheck = iconComponent(ShieldCheckIcon);
export const Sparkles = iconComponent(SparklesIcon);
export const Tasks = iconComponent(Task01Icon);
