export interface Contact {
  id: number;
  name: string;
  categories: string[];
  position?: { x: number; y: number };
  velocity?: { x: number; y: number };
}

export interface CircleConfig {
  name: string;
  color: string;
  angle: number;
}

export interface AreaBoundary {
  type: 'circle' | 'intersection';
  centerX: number;
  centerY: number;
  radius: number;
  categories?: string[];
}

export interface CircleLayout {
  left: number;
  top: number;
  center: { x: number; y: number };
  config: CircleConfig;
}

export interface Layout {
  circleSize: number;
  circleRadius: number;
  triangleHeight: number;
  circles: Record<string, CircleLayout>;
} 