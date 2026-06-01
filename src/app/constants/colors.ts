/**
 * Paleta de cores da marca Obelisko
 * Cores principais para a aplicação
 */

export const ObeliskoColors = {
  // Cores primárias da marca
  primary: {
    // Azul marinho - cor principal
    900: '#001F3F',  // Muito escuro
    800: '#003D66',  // Escuro
    700: '#005A8D',  // Regular
    600: '#0077B6',  // Mais claro
    500: '#0096D6',  // Principal
    400: '#00B4E4',  // Claro
  },

  // Amarelo - cor de destaque/complementar
  accent: {
    900: '#CCB000',  // Muito escuro
    800: '#D9B80A',  // Escuro
    700: '#E5C200',  // Regular
    600: '#F0C808',  // Mais claro
    500: '#FFD700',  // Principal (ouro)
    400: '#FFE135',  // Claro
  },

  // Neutros
  neutral: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
  },

  // Semânticas
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
} as const;

// Tipagem das cores para usar em componentes
export type ObeliskoColorKey = keyof typeof ObeliskoColors;
