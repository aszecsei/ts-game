export interface Screen {
  update(deltaTime: number): void;
  draw(ctx: WebGLRenderingContext, deltaTime: number): void;
}
