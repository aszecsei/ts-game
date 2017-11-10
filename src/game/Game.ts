import { InputManager, Key } from './InputManager';
import { remote } from 'electron';
import { Screen } from './Screen';

const debug = true;

export class Game {
  width: number;
  height: number;
  private ctx: CanvasRenderingContext2D;
  private fpsList = [0];
  private currentScreen: Screen;
  private last: number = -1;
  constructor(ctx: CanvasRenderingContext2D) {
    let s = remote.screen.getPrimaryDisplay();
    this.width = s.workAreaSize.width;
    this.height = s.workAreaSize.height;
    this.ctx = ctx;

    window.addEventListener('keyup', InputManager.setKeyUp);
    window.addEventListener('keydown', InputManager.setKeyDown);

    this.ctx.canvas.width = this.width;
    this.ctx.canvas.height = this.height;

    if (window.devicePixelRatio) {
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    }
  }
  Start() {
    window.requestAnimationFrame(this.GameLoop);
  }

  GameLoop = (ts: number) => {
    this.ctx.clearRect(0,0, this.width, this.height);
    if (InputManager.isDown(Key.ESC)) {
      remote.app.quit();
    }
    let delta = 0;
    if (this.last !== -1) {
      delta = ts - this.last;
    }
    this.last = ts;

    if (this.currentScreen) {
      this.currentScreen.update(delta);
      this.currentScreen.draw(this.ctx, delta);
    }

    // FPS Counter
    if (debug) {
      this.fpsList.push(delta);
      if (this.fpsList.length > 10) {
        this.fpsList.shift();
        this.ctx.fillStyle = 'white';
        this.ctx.font = '12px Arial';
        const avgFPS = this.fpsList.reduce((x,y) => x + y, 0) / 10;
        this.ctx.fillText('FPS: ' + (1000 / avgFPS).toFixed(3), 50, 50);
        console.log('FPS: ' + (1000 / avgFPS).toFixed(3));
      }
    }

    InputManager.flush();
    window.requestAnimationFrame(this.GameLoop);
  }
}
