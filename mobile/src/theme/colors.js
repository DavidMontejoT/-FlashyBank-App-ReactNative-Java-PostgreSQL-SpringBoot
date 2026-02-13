// FlashyBank Theme Colors - Based on Pencil Design
export const colors = {
  // Primary colors
  primary: '#BAF742',        // Verde Flashy principal
  primaryLight: '#D9FF9B',   // Verde Flashy claro (gradiente)
  primaryDark: '#8FC73E',    // Verde Flashy oscuro (gradiente)
  primaryHover: '#9FE030',

  // Green Mode (Dark theme)
  greenBackground: '#0a1f0a',
  greenBackgroundMid: '#1a3d1a',
  greenBackgroundEnd: '#0d2818',

  // Light Mode
  lightBackground: '#f5f5f7',
  lightBackgroundEnd: '#e8e8e8',
  lightCard: '#ffffff',
  lightBorder: '#e5e5e5',

  // Background colors
  background: '#FFFFFF',
  backgroundLight: '#F0EDDE',
  backgroundGreen: '#BAF742',
  backgroundSuccess: '#F5FFE2',

  // Text colors
  textPrimary: '#000000',
  textDark: '#1a1a1a',
  textSecondary: '#333333',
  textMuted: '#666666',
  textLight: '#999999',
  textWhite: '#FFFFFF',
  textWhite90: '#ffffff90',

  // Status colors
  success: '#4CAF50',
  successLight: '#22c55e',
  error: '#f44336',
  warning: '#FF9800',
  info: '#2196F3',

  // UI colors
  card: '#FFFFFF',
  cardTransparent: 'rgba(255, 255, 255, 0.75)',
  cardWhite10: 'rgba(255, 255, 255, 0.1)',
  cardGreen10: 'rgba(255, 255, 255, 0.1)',
  border: '#E0E0E0',
  borderLight: 'rgba(186, 247, 66, 0.3)',
  borderGreen20: 'rgba(186, 247, 66, 0.2)',
  borderGreen30: 'rgba(186, 247, 66, 0.3)',
  borderWhite: 'rgba(255, 255, 255, 1)',
  shadow: 'rgba(0, 0, 0, 0.1)',
  shadowGreen: 'rgba(186, 247, 66, 0.2)',

  // Transaction colors
  sent: '#f44336',
  received: '#4CAF50',

  // Overlay
  overlay: 'rgba(0, 0, 0, 0.5)',
  overlayLight: 'rgba(255, 255, 255, 0.3)',
  overlayGreen15: 'rgba(186, 247, 66, 0.15)',

  // Glassmorphism
  glassGreen: 'rgba(186, 247, 66, 0.2)',
  glassWhite: 'rgba(255, 255, 255, 0.5)',
};

// Gradient definitions
export const gradients = {
  primary: ['#BAF742', '#D9FF9B'],
  success: ['#F5FFE2', '#BAF742'],
  balanceCard: ['#BAF742', '#8FC73E'],
  greenMode: ['#0a1f0a', '#1a3d1a', '#0d2818'],
  lightMode: ['#f5f5f7', '#e8e8e8'],
};

// Spacing
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

// Border radius
export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  pill: 60,
  round: 100,
  xl32: 32,
  top40: [40, 40, 0, 0],
};

// Font sizes
export const fontSizes = {
  xs: 10,
  sm: 11,
  md: 12,
  regular: 14,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  display: 42,
  huge: 48,
};

// Font families
export const fontFamilies = {
  primary: 'Inter',
  display: 'SF Pro Display',
  text: 'SF Pro Text',
};
