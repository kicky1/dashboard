import * as React from 'react';
import type { SvgProps } from 'react-native-svg';
import Svg, { Path } from 'react-native-svg';

export function Expenses({ color = '#000', ...props }: SvgProps) {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" {...props}>
      <Path
        d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H8v-2h3V8H8V6h3c1.1 0 2 .9 2 2v6c0 1.1-.9 2-2 2zm5-4h-3v2h3v2h-3c-1.1 0-2-.9-2-2V8c0-1.1.9-2 2-2h3v2h-3v2h3v2z"
        fill={color}
      />
    </Svg>
  );
}
