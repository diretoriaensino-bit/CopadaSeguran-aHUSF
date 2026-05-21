import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

interface RawQuestion {
  q: string;
  options: string[];
  correct: number;
  feedback: string;
}

export function prepareQuizQuestions(questions: RawQuestion[], limit = 5): RawQuestion[] {
  const shuffledQuestions = shuffleArray(questions);
  const selected = shuffledQuestions.slice(0, limit);
  return selected.map(q => {
    const correctOptionText = q.options[q.correct];
    const shuffledOptions = shuffleArray(q.options);
    const newCorrectIndex = shuffledOptions.indexOf(correctOptionText);
    return {
      ...q,
      options: shuffledOptions,
      correct: newCorrectIndex === -1 ? q.correct : newCorrectIndex
    };
  });
}

