// Fallback for using MaterialIcons on Android and web.

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { SymbolWeight } from 'expo-symbols';
import { ComponentProps } from 'react';
import { OpaqueColorValue, type StyleProp, type TextStyle } from 'react-native';

type MaterialIconName = ComponentProps<typeof MaterialIcons>['name'];

const MAPPING: Record<string, MaterialIconName> = {
  'house.fill': 'home',
  'paperplane.fill': 'send',
  'chevron.left.forwardslash.chevron.right': 'code',
  'chevron.right': 'chevron-right',
  'calendar': 'calendar-month',
  'doc.text': 'description',
  'cart.fill': 'shopping-cart',
  'note.text': 'sticky-note-2',
  'banknote.fill': 'local-atm',
  'gearshape.fill': 'settings',
  'checkmark.circle.fill': 'check-circle',
  'exclamationmark.triangle.fill': 'warning',
  'plus': 'add',
  'checkmark': 'check',
  'list.bullet': 'list',
  'clock': 'schedule',
  'circle': 'circle',
  'square.grid.2x2': 'grid-view',
  'xmark': 'close',
  'trash': 'delete',
  'basket': 'shopping-basket',
  'pencil': 'edit',
  'plus.circle': 'add-circle',
  'cart': 'shopping-cart',
  'magnifyingglass': 'search',
  'doc.fill': 'description',
  'arrow.down.circle': 'download',
  'folder': 'folder',
  'chart.bar': 'bar-chart',
  'shippingbox.fill': 'local-shipping',
  'fork.knife': 'restaurant',
  'flame': 'local-fire-department',
};

/**
 * An icon component that uses native SF Symbols on iOS, and Material Icons on Android and web.
 * This ensures a consistent look across platforms, and optimal resource usage.
 * Icon `name`s are based on SF Symbols and require manual mapping to Material Icons.
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: string;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  return <MaterialIcons color={color} size={size} name={MAPPING[name] ?? 'help-outline'} style={style} />;
}
