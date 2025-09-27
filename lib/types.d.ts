declare module 'hdbscanjs' {
  interface HDBSCANConfig {
    minPoints: number;
    minClusterSize: number;
    metric: (a: number[], b: number[]) => number;
  }

  class HDBSCAN {
    constructor(config: HDBSCANConfig);
    fit(data: number[][]): number[];
  }

  export default HDBSCAN;
}

declare module 'euclidean-distance' {
  function euclidean(a: number[], b: number[]): number;
  export default euclidean;
}
