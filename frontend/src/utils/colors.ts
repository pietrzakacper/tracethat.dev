import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import { AlertTriangle, Circle, Heart, Triangle, Star } from "lucide-react";

type Color = { base: string; rest: string; hover: string; icon: LucideIcon };
const COLORS: Color[] = [
  { base: "hsl(226, 71%, 40%)", rest: "hsla(226, 71%, 40%, 0.1)", hover: "hsla(226, 71%, 40%, 0.2)", icon: Circle },
  { base: "hsl(143, 64%, 24%)", rest: "hsla(143, 64%, 24%, 0.1)", hover: "hsla(143, 64%, 24%, 0.2)", icon: Heart },
  { base: "hsl(0, 70%, 35%)", rest: "hsla(0, 70%, 35%, 0.1)", hover: "hsla(0, 70%, 35%, 0.2)", icon: Triangle },
  {
    base: "hsl(273, 67%, 39%)",
    rest: "hsla(273, 67%, 39%, 0.1)",
    hover: "hsla(273, 67%, 39%, 0.2)",
    icon: AlertTriangle,
  },
  { base: "hsl(336, 74%, 35%)", rest: "hsla(336, 74%, 35%, 0.1)", hover: "hsla(336, 74%, 35%, 0.2)", icon: Star },
  { base: "hsl(244, 55%, 41%)", rest: "hsla(244, 55%, 41%, 0.1)", hover: "hsla(244, 55%, 41%, 0.2)", icon: Circle },

  // ["bg-blue-800/10", "hover:bg-blue-800/30"],
  // ["bg-green-800/10", "hover:bg-green-800/30"],
  // ["bg-red-800/10", "hover:bg-red-800/30"],

  // ["bg-purple-100", "hover:bg-purple-100/70"],
  // ["bg-pink-100", "hover:bg-pink-100/70"],
  // ["bg-indigo-100", "hover:bg-indigo-100/70"],
  // ["bg-gray-100", "hover:bg-gray-100/70"],
  // ["bg-blue-200", "hover:bg-blue-200/70"],
  // ["bg-green-200", "hover:bg-green-200/70"],
  // ["bg-red-200", "hover:bg-red-200/70"],
  // ["bg-purple-200", "hover:bg-purple-200/70"],
  // ["bg-pink-200", "hover:bg-pink-200/70"],
  // ["bg-indigo-200", "hover:bg-indigo-200/70"],
  // ["bg-gray-200", "hover:bg-gray-200/70"],
  // ["bg-blue-300", "hover:bg-blue-300/70"],
  // ["bg-green-300", "hover:bg-green-300/70"],
  // ["bg-red-300", "hover:bg-red-300/70"],
  // ["bg-purple-300", "hover:bg-purple-300/70"],
  // ["bg-pink-300", "hover:bg-pink-300/70"],
  // ["bg-indigo-300", "hover:bg-indigo-300/70"],
  // ["bg-gray-300", "hover:bg-gray-300/70"],
  // ["bg-blue-400", "hover:bg-blue-400/70"],
  // ["bg-green-400", "hover:bg-green-400/70"],
  // ["bg-red-400", "hover:bg-red-400/70"],
  // ["bg-purple-400", "hover:bg-purple-400/70"],
  // ["bg-pink-400", "hover:bg-pink-400/70"],
  // ["bg-indigo-400", "hover:bg-indigo-400/70"],
  // ["bg-gray-400", "hover:bg-gray-400/70"],
];

export function getColor(id: string) {
  const hash = id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return COLORS[hash % COLORS.length];
}

export function getRowBackgroundClassNames(color: Color) {
  return cn(color.rest, color.hover);
}
