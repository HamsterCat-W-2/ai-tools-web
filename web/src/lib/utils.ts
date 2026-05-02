import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export async function loadToolsData() {
  const response = await fetch("/data/tools.json");
  return response.json();
}
