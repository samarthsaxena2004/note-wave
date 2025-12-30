// Create this file: src/types/force-graph.d.ts
declare module 'react-force-graph-3d' {
  import { Component } from 'react';

  export interface ForceGraphProps {
    graphData?: {
      nodes: any[];
      links: any[];
    };
    nodeLabel?: string | ((node: any) => string);
    nodeAutoColorBy?: string | ((node: any) => string);
    onNodeClick?: (node: any, event: MouseEvent) => void;
    backgroundColor?: string;
    nodeRelSize?: number;
    linkWidth?: number | string | ((link: any) => number);
    linkOpacity?: number;
    linkDirectionalArrowLength?: number;
    linkDirectionalArrowRelPos?: number;
    linkCurvature?: number;
    showNavInfo?: boolean;
    ref?: any;
  }

  export class ForceGraph3D extends Component<ForceGraphProps> {}
}