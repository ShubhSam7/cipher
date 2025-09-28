import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// lib/utils.ts
const adjectives = ['swift', 'bright', 'clever', 'bold', 'quiet']
const animals = ['tiger', 'eagle', 'wolf', 'fox', 'bear']

export function generateAnonymousHandle(): string {
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)]
  const animal = animals[Math.floor(Math.random() * animals.length)]
  const number = Math.floor(Math.random() * 999) + 1
  
  return `anon_${adj}_${animal}_${number}`
}
