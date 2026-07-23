import { colors } from "./colors";
import { spacing } from "./spacing";
import { typography } from "./typography";
import { radius } from "./radius";
import { shadows } from "./shadows";
import { sizes } from "./sizes";

export const theme = {
  colors,
  spacing,
  typography,
  radius,
  shadows,
  sizes,
} as const;

export type Theme = typeof theme;
