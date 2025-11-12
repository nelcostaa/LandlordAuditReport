// Traffic Light Indicator Component - Professional SVG Circles
import { View, Svg, Circle } from '@react-pdf/renderer';
import { COLORS } from '@/lib/pdf/styles';

const COLOR_MAP = {
  red: COLORS.red,
  orange: COLORS.orange,
  green: COLORS.green,
};

interface TrafficLightProps {
  color: 'red' | 'orange' | 'green';
  style?: any;
  size?: number; // Circle diameter in points
}

const DEFAULT_SIZE = 12;

export const TrafficLight = ({ color, style, size = DEFAULT_SIZE }: TrafficLightProps) => {
  const radius = (size / 2) - 1; // Slight padding for clean edges
  const center = size / 2;
  
  return (
    <View style={[style, { width: size, height: size, alignItems: 'center', justifyContent: 'center' }]}>
      <Svg height={size} width={size}>
        <Circle 
          cx={center} 
          cy={center} 
          r={radius} 
          fill={COLOR_MAP[color]} 
        />
      </Svg>
    </View>
  );
};

