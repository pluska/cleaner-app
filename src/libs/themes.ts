export type ThemeType = 'brand' | 'ranger' | 'noble' | 'high_elf';

export interface Theme {
  id: ThemeType;
  name: string;
  colors: {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    text: string;
    border: string;
    accent: string;
  };
  assets: {
    bgPattern: string;
    buttonTexture: string;
  };
  typography: {
    heading: string;
  };
}

export const themes: Record<ThemeType, Theme> = {
  brand: {
    id: 'brand',
    name: 'SparkClean Brand',
    colors: {
      primary: '#3B82F6', // brand blue
      secondary: '#10B981', // brand green
      background: '#FFFFFF',
      surface: '#F8F9FA',
      text: '#111827', // dark slate
      border: '#E5E7EB',
      accent: '#F59E0B', // gold
    },
    assets: {
      bgPattern: 'none',
      buttonTexture: 'clean',
    },
    typography: {
      heading: 'sans-serif',
    },
  },
  ranger: {
    id: 'ranger',
    name: 'Ranger',
    colors: {
      primary: '#3F6212', // earth green
      secondary: '#854D0E', // wood brown
      background: '#FEFCE8', // parchment
      surface: '#FEF9C3', // light parchment
      text: '#362F2D', // dark brown
      border: '#A16207', // wood border
      accent: '#EAB308', // gold
    },
    assets: {
      bgPattern: 'url("/patterns/wood.png")',
      buttonTexture: 'wood',
    },
    typography: {
      heading: 'serif',
    },
  },
  noble: {
    id: 'noble',
    name: 'Noble',
    colors: {
      primary: '#1E40AF', // royal blue
      secondary: '#475569', // slate
      background: '#F8FAFC', // marble white
      surface: '#FFFFFF',
      text: '#1E293B', // dark slate
      border: '#94A3B8', // silver
      accent: '#F59E0B', // gold
    },
    assets: {
      bgPattern: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)', // Fallback for marble
      buttonTexture: 'stone',
    },
    typography: {
      heading: 'sans-serif',
    },
  },
  high_elf: {
    id: 'high_elf',
    name: 'High Elf',
    colors: {
      primary: '#7C3AED', // magic purple
      secondary: '#DB2777', // pink
      background: '#FDFAFF', // ethereal white
      surface: '#FFFFFF',
      text: '#4C1D95', // deep purple
      border: '#E879F9', // glowing pink
      accent: '#22D3EE', // cyan glow
    },
    assets: {
      bgPattern: 'url("/patterns/stardust.png")',
      buttonTexture: 'crystal',
    },
    typography: {
      heading: 'serif',
    },
  },
};

export const getTheme = (id: string): Theme => {
  return themes[id as ThemeType] || themes.brand;
};
