import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  Circle,
  Heart,
  Triangle,
  Star,
  PawPrint,
  Octagon,
  Shirt,
  Bolt,
  Diamond,
  Home,
  Moon,
  Sun,
  LayoutGrid,
  Folder,
  Flag,
  ArrowBigDown,
  ArrowBigUp,
  ArrowBigRight,
} from "lucide-react";

type Color = { base: string; rest: string; hover: string; icon: LucideIcon };
const COLORS: Color[] = [
  { base: "rgba(255, 0, 0, 1)", rest: "rgba(255, 0, 0, 0.1)", hover: "rgba(255, 0, 0, 0.2)", icon: AlertTriangle },
  { base: "rgba(0, 255, 0, 1)", rest: "rgba(0, 255, 0, 0.1)", hover: "rgba(0, 255, 0, 0.2)", icon: Circle },
  { base: "rgba(0, 0, 255, 1)", rest: "rgba(0, 0, 255, 0.1)", hover: "rgba(0, 0, 255, 0.2)", icon: Heart },
  { base: "rgba(255, 255, 0, 1)", rest: "rgba(255, 255, 0, 0.1)", hover: "rgba(255, 255, 0, 0.2)", icon: Triangle },
  { base: "rgba(0, 255, 255, 1)", rest: "rgba(0, 255, 255, 0.1)", hover: "rgba(0, 255, 255, 0.2)", icon: Star },
  { base: "rgba(255, 0, 255, 1)", rest: "rgba(255, 0, 255, 0.1)", hover: "rgba(255, 0, 255, 0.2)", icon: Octagon },
  {
    base: "rgba(192, 192, 192, 1)",
    rest: "rgba(192, 192, 192, 0.1)",
    hover: "rgba(192, 192, 192, 0.2)",
    icon: ArrowBigRight,
  },
  { base: "rgba(128, 0, 0, 1)", rest: "rgba(128, 0, 0, 0.1)", hover: "rgba(128, 0, 0, 0.2)", icon: ArrowBigUp },
  { base: "rgba(128, 128, 0, 1)", rest: "rgba(128, 128, 0, 0.1)", hover: "rgba(128, 128, 0, 0.2)", icon: Shirt },
  { base: "rgba(128, 0, 128, 1)", rest: "rgba(128, 0, 128, 0.1)", hover: "rgba(128, 0, 128, 0.2)", icon: PawPrint },
  { base: "rgba(0, 128, 128, 1)", rest: "rgba(0, 128, 128, 0.1)", hover: "rgba(0, 128, 128, 0.2)", icon: Diamond },
  { base: "rgba(0, 0, 128, 1)", rest: "rgba(0, 0, 128, 0.1)", hover: "rgba(0, 0, 128, 0.2)", icon: Bolt },
  { base: "rgba(128, 128, 128, 1)", rest: "rgba(128, 128, 128, 0.1)", hover: "rgba(128, 128, 128, 0.2)", icon: Home },
  { base: "rgba(255, 165, 0, 1)", rest: "rgba(255, 165, 0, 0.1)", hover: "rgba(255, 165, 0, 0.2)", icon: Moon },
  { base: "rgba(255, 192, 203, 1)", rest: "rgba(255, 192, 203, 0.1)", hover: "rgba(255, 192, 203, 0.2)", icon: Sun },
  { base: "rgba(75, 0, 130, 1)", rest: "rgba(75, 0, 130, 0.1)", hover: "rgba(75, 0, 130, 0.2)", icon: LayoutGrid },
  { base: "rgba(127, 255, 212, 1)", rest: "rgba(127, 255, 212, 0.1)", hover: "rgba(127, 255, 212, 0.2)", icon: Folder },
  { base: "rgba(255, 69, 0, 1)", rest: "rgba(255, 69, 0, 0.1)", hover: "rgba(255, 69, 0, 0.2)", icon: Flag },
  {
    base: "rgba(255, 218, 185, 1)",
    rest: "rgba(255, 218, 185, 0.1)",
    hover: "rgba(255, 218, 185, 0.2)",
    icon: ArrowBigDown,
  },
];

export function getColor(id: string) {
  const hash = id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return COLORS[hash % COLORS.length];
}

export function getRowBackgroundClassNames(color: Color) {
  return cn(color.rest, color.hover);
}
