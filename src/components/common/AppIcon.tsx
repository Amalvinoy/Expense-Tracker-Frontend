import React from 'react';
import { StyleProp, TextStyle } from 'react-native';
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { useAppTheme } from '@/hooks/useAppTheme';

export type IconFamily = 'ionicons' | 'material' | 'feather';

export type IconSize = 'sm' | 'md' | 'lg' | 'xl' | number;

const sizeMap: Record<'sm' | 'md' | 'lg' | 'xl', number> = {
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
};

export interface AppIconProps {
  name: string;
  size?: IconSize;
  color?: string;
  family?: IconFamily;
  style?: StyleProp<TextStyle>;
}

export const AppIcon: React.FC<AppIconProps> = ({
  name,
  size = 'md',
  color,
  family = 'material',
  style,
}) => {
  const { colors } = useAppTheme();
  const resolvedColor = color ?? colors.textPrimary;
  const pixelSize = typeof size === 'number' ? size : sizeMap[size] || 20;

  switch (family) {
    case 'ionicons':
      return <Ionicons name={name as any} size={pixelSize} color={resolvedColor} style={style} />;
    case 'feather':
      return <Feather name={name as any} size={pixelSize} color={resolvedColor} style={style} />;
    case 'material':
    default:
      return <MaterialCommunityIcons name={name as any} size={pixelSize} color={resolvedColor} style={style} />;
  }
};

