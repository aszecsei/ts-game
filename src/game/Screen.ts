export interface Screen {
  update(deltaTime: number): void;
  draw(ctx: CanvasRenderingContext2D, deltaTime: number): void;
}
