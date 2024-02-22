import { cn } from "@/lib/utils";

const COLORS = [
  ["bg-blue-100", "hover:bg-blue-100/70"],
  ["bg-green-100", "hover:bg-green-100/70"],
  ["bg-red-100", "hover:bg-red-100/70"],
  ["bg-purple-100", "hover:bg-purple-100/70"],
  ["bg-pink-100", "hover:bg-pink-100/70"],
  ["bg-indigo-100", "hover:bg-indigo-100/70"],
  ["bg-gray-100", "hover:bg-gray-100/70"],
  ["bg-blue-200", "hover:bg-blue-200/70"],
  ["bg-green-200", "hover:bg-green-200/70"],
  ["bg-red-200", "hover:bg-red-200/70"],
  ["bg-purple-200", "hover:bg-purple-200/70"],
  ["bg-pink-200", "hover:bg-pink-200/70"],
  ["bg-indigo-200", "hover:bg-indigo-200/70"],
  ["bg-gray-200", "hover:bg-gray-200/70"],
  ["bg-blue-300", "hover:bg-blue-300/70"],
  ["bg-green-300", "hover:bg-green-300/70"],
  ["bg-red-300", "hover:bg-red-300/70"],
  ["bg-purple-300", "hover:bg-purple-300/70"],
  ["bg-pink-300", "hover:bg-pink-300/70"],
  ["bg-indigo-300", "hover:bg-indigo-300/70"],
  ["bg-gray-300", "hover:bg-gray-300/70"],
  ["bg-blue-400", "hover:bg-blue-400/70"],
  ["bg-green-400", "hover:bg-green-400/70"],
  ["bg-red-400", "hover:bg-red-400/70"],
  ["bg-purple-400", "hover:bg-purple-400/70"],
  ["bg-pink-400", "hover:bg-pink-400/70"],
  ["bg-indigo-400", "hover:bg-indigo-400/70"],
  ["bg-gray-400", "hover:bg-gray-400/70"],
];

export function getColor(id: string) {
  const hash = id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return COLORS[hash % COLORS.length];
}

export function getRowBackgroundClassNames(eventName: string) {
  const [restClass, hoverClass] = getColor(eventName);
  return cn(restClass, hoverClass);
}
