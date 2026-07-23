export const typography = {
  fontFamily: "Plus Jakarta Sans",

  fontSize: {
    xs: 10,
    sm: 12,
    md: 14,
    lg: 16,
    xl: 18,
    xxl: 20,
    xxxl: 24,
    display: 32,
    hero: 40,
  },

  lineHeight: {
    xs: 14,
    sm: 16,
    md: 20,
    lg: 22,
    xl: 24,
    xxl: 28,
    xxxl: 32,
    display: 36,
    hero: 44,
  },

  fontWeight: {
    regular: "400" as const,
    medium: "500" as const,
    semibold: "600" as const,
    bold: "700" as const,
    extrabold: "800" as const,
  },

  letterSpacing: {
    tight: -0.5,
    snug: -0.3,
    normal: 0.1,
    wide: 0.3,
    wider: 0.5,
    widest: 1,
    xl: 2,
  },
} as const;
