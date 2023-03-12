export interface CanvasApi {
  deltaTime?: number;
  context: CanvasRenderingContext2D | null;
  width: number;
  height: number;
}
