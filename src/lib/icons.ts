import {
  UtensilsCrossed,
  Car,
  Home,
  Ticket,
  HeartPulse,
  ShoppingBag,
  ShoppingBasket,
  Ellipsis,
  BookOpen,
  GraduationCap,
  Gift,
  PawPrint,
  Plane,
  Briefcase,
  PiggyBank,
  Wrench,
  Film,
  Shirt,
  Gamepad2,
  LucideIcon,
  Shapes,
} from 'lucide-react';

export const iconMap: Record<string, LucideIcon> = {
  UtensilsCrossed,
  Car,
  Home,
  Ticket,
  HeartPulse,
  ShoppingBag,
  ShoppingBasket,
  BookOpen,
  GraduationCap,
  Gift,
  PawPrint,
  Plane,
  Briefcase,
  PiggyBank,
  Wrench,
  Film,
  Shirt,
  Gamepad2,
  Ellipsis,
  Shapes, // Default/fallback icon
};

export const iconList = Object.keys(iconMap).filter(key => key !== 'Shapes' && key !== 'Ellipsis');

export const getIcon = (name: string | undefined): LucideIcon => {
    return name && iconMap[name] ? iconMap[name] : Shapes;
};
