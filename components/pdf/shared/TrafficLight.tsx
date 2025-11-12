// Traffic Light Indicator Component - Professional Circles using View borderRadius
import { View } from '@react-pdf/renderer';
import { COLORS } from '@/lib/pdf/styles';

const COLOR_MAP = {
  red: COLORS.red,
  orange: COLORS.orange,
  green: COLORS.green,
};

interface TrafficLightProps {
  color: 'red' | 'orange' | 'green';
  style?: any;
  size?: number;
}

const DEFAULT_SIZE = 12;

export const TrafficLight = ({ color, style, size = DEFAULT_SIZE }: TrafficLightProps) => (
  <View 
    style={[
      {
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: COLOR_MAP[color],
      },
      style
    ]} 
  />
);

