export interface ThemeConfig {
  id: string;
  name: string;
  type: 'dark' | 'light';
  colors: {
    pageBackground: string;
    heroBackground: string;
    heroText: string;
    heroAccent: string;
    cardBackground: string;
    cardBorder: string;
    buttonPrimary: string;
    buttonPrimaryText: string;
    buttonSecondary: string;
    buttonSecondaryText: string;
    headingColor: string;
    bodyTextColor: string;
  };
}

export const PREDEFINED_THEMES: ThemeConfig[] = [
  // Dark Themes
  {
    id: 'midnight',
    name: 'Midnight Blue',
    type: 'dark',
    colors: {
      pageBackground: '220 25% 10%',
      heroBackground: '220 30% 8%',
      heroText: '0 0% 100%',
      heroAccent: '210 100% 65%',
      cardBackground: '220 25% 15%',
      cardBorder: '220 20% 25%',
      buttonPrimary: '210 100% 65%',
      buttonPrimaryText: '0 0% 100%',
      buttonSecondary: '220 20% 25%',
      buttonSecondaryText: '0 0% 100%',
      headingColor: '0 0% 100%',
      bodyTextColor: '220 15% 75%',
    },
  },
  {
    id: 'forest',
    name: 'Forest Night',
    type: 'dark',
    colors: {
      pageBackground: '150 20% 12%',
      heroBackground: '150 25% 8%',
      heroText: '0 0% 100%',
      heroAccent: '150 60% 55%',
      cardBackground: '150 18% 16%',
      cardBorder: '150 15% 25%',
      buttonPrimary: '150 60% 55%',
      buttonPrimaryText: '150 25% 8%',
      buttonSecondary: '150 15% 25%',
      buttonSecondaryText: '0 0% 100%',
      headingColor: '0 0% 100%',
      bodyTextColor: '150 12% 75%',
    },
  },
  {
    id: 'sunset',
    name: 'Sunset Dark',
    type: 'dark',
    colors: {
      pageBackground: '15 25% 12%',
      heroBackground: '15 30% 8%',
      heroText: '0 0% 100%',
      heroAccent: '25 85% 55%',
      cardBackground: '15 20% 16%',
      cardBorder: '15 15% 25%',
      buttonPrimary: '25 85% 55%',
      buttonPrimaryText: '15 30% 8%',
      buttonSecondary: '15 15% 25%',
      buttonSecondaryText: '0 0% 100%',
      headingColor: '0 0% 100%',
      bodyTextColor: '15 12% 75%',
    },
  },
  {
    id: 'royal',
    name: 'Royal Purple',
    type: 'dark',
    colors: {
      pageBackground: '270 25% 12%',
      heroBackground: '270 30% 8%',
      heroText: '0 0% 100%',
      heroAccent: '280 70% 65%',
      cardBackground: '270 20% 16%',
      cardBorder: '270 15% 25%',
      buttonPrimary: '280 70% 65%',
      buttonPrimaryText: '0 0% 100%',
      buttonSecondary: '270 15% 25%',
      buttonSecondaryText: '0 0% 100%',
      headingColor: '0 0% 100%',
      bodyTextColor: '270 12% 75%',
    },
  },

  // Light Themes
  {
    id: 'cream',
    name: 'Warm Cream',
    type: 'light',
    colors: {
      pageBackground: '40 40% 96%',
      heroBackground: '40 50% 92%',
      heroText: '20 30% 20%',
      heroAccent: '25 85% 55%',
      cardBackground: '0 0% 100%',
      cardBorder: '40 20% 85%',
      buttonPrimary: '25 85% 55%',
      buttonPrimaryText: '0 0% 100%',
      buttonSecondary: '40 15% 75%',
      buttonSecondaryText: '20 30% 20%',
      headingColor: '20 30% 20%',
      bodyTextColor: '20 20% 35%',
    },
  },
  {
    id: 'ocean',
    name: 'Ocean Breeze',
    type: 'light',
    colors: {
      pageBackground: '195 40% 96%',
      heroBackground: '195 50% 92%',
      heroText: '200 30% 20%',
      heroAccent: '195 85% 45%',
      cardBackground: '0 0% 100%',
      cardBorder: '195 20% 85%',
      buttonPrimary: '195 85% 45%',
      buttonPrimaryText: '0 0% 100%',
      buttonSecondary: '195 15% 75%',
      buttonSecondaryText: '200 30% 20%',
      headingColor: '200 30% 20%',
      bodyTextColor: '200 20% 35%',
    },
  },
  {
    id: 'rose',
    name: 'Rose Garden',
    type: 'light',
    colors: {
      pageBackground: '340 40% 96%',
      heroBackground: '340 50% 92%',
      heroText: '340 30% 20%',
      heroAccent: '350 75% 55%',
      cardBackground: '0 0% 100%',
      cardBorder: '340 20% 85%',
      buttonPrimary: '350 75% 55%',
      buttonPrimaryText: '0 0% 100%',
      buttonSecondary: '340 15% 75%',
      buttonSecondaryText: '340 30% 20%',
      headingColor: '340 30% 20%',
      bodyTextColor: '340 20% 35%',
    },
  },
  {
    id: 'mint',
    name: 'Fresh Mint',
    type: 'light',
    colors: {
      pageBackground: '160 40% 96%',
      heroBackground: '160 50% 92%',
      heroText: '160 30% 20%',
      heroAccent: '165 70% 45%',
      cardBackground: '0 0% 100%',
      cardBorder: '160 20% 85%',
      buttonPrimary: '165 70% 45%',
      buttonPrimaryText: '0 0% 100%',
      buttonSecondary: '160 15% 75%',
      buttonSecondaryText: '160 30% 20%',
      headingColor: '160 30% 20%',
      bodyTextColor: '160 20% 35%',
    },
  },
];

export const getThemeById = (id: string): ThemeConfig | undefined => {
  return PREDEFINED_THEMES.find(theme => theme.id === id);
};

export const getDarkThemes = (): ThemeConfig[] => {
  return PREDEFINED_THEMES.filter(theme => theme.type === 'dark');
};

export const getLightThemes = (): ThemeConfig[] => {
  return PREDEFINED_THEMES.filter(theme => theme.type === 'light');
};
