import { Dribbble } from 'lucide-react';
import type { ComponentProps } from 'react';

export const SportIcons = {
  Pickleball: (props: ComponentProps<'svg'>) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M16.5 7.5l-3 3" />
      <path d="M12.5 11.5l-3 3" />
      <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      <path d="M21 12h-2" />
      <path d="M5 12H3" />
      <path d="M12 5V3" />
      <path d="M12 21v-2" />
    </svg>
  ),
  Basketball: Dribbble,
  Tennis: (props: ComponentProps<'svg'>) => (
     <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M11.23 6.27l-5.74 5.74a8 8 0 0 0 11.31 11.31l5.74-5.74" />
      <path d="M18.8 7.64a2.05 2.05 0 1 0-2.9-2.9" />
    </svg>
  ),
};
