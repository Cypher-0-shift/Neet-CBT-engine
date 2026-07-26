/**
 * Question Palette visual constants
 * Maps question states to NTA CBT color scheme
 */

import { QuestionStatus } from '../types/question.types';

export interface PaletteStyle {
  backgroundColor: string;
  textColor: string;
  borderColor: string;
  label: string;
}

export const PALETTE_STYLES: Record<QuestionStatus, PaletteStyle> = {
  [QuestionStatus.NOT_VISITED]: {
    backgroundColor: '#C0C0C0',
    textColor: '#333333',
    borderColor: '#A0A0A0',
    label: 'Not Visited',
  },
  [QuestionStatus.NOT_ANSWERED]: {
    backgroundColor: '#E74C3C',
    textColor: '#FFFFFF',
    borderColor: '#C0392B',
    label: 'Not Answered',
  },
  [QuestionStatus.ANSWERED]: {
    backgroundColor: '#27AE60',
    textColor: '#FFFFFF',
    borderColor: '#1E8449',
    label: 'Answered',
  },
  [QuestionStatus.MARKED_FOR_REVIEW]: {
    backgroundColor: '#8E44AD',
    textColor: '#FFFFFF',
    borderColor: '#6C3483',
    label: 'Marked for Review',
  },
  [QuestionStatus.ANSWERED_AND_MARKED]: {
    backgroundColor: '#8E44AD',
    textColor: '#FFFFFF',
    borderColor: '#6C3483',
    label: 'Answered & Marked for Review',
  },
};
