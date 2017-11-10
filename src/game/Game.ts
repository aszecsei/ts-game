import { InputManager, Key } from './InputManager';
import { remote } from 'electron';
import { Screen } from './Screen';
import $ from 'jquery';

const debug = true;

export class Game {
  private static _instance: Game;
  private static _windowedHeight = 720;
  private static _windowedWidth = 1080;
  private static _isFullscreen = false;
  width: number;
  height: number;
  ctx: CanvasRenderingContext2D;
  private fpsList = [0];
  private currentScreen: Screen;
  private last: number = -1;
  private constructor(ctx: CanvasRenderingContext2D) {
    let s = remote.getCurrentWindow().getSize();
    this.width = s[0];
    this.height = s[1];
    this.ctx = ctx;

    window.addEventListener('keyup', InputManager.setKeyUp);
    window.addEventListener('keydown', InputManager.setKeyDown);

    this.ctx.canvas.width = this.width;
    this.ctx.canvas.height = this.height;

    if (window.devicePixelRatio) {
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    }
  }
  static Instance(): Game {
    if (!Game._instance) {
      const ctx = ($('#canvas')[0] as HTMLCanvasElement).getContext('2d') as CanvasRenderingContext2D;
      Game._instance = new Game(ctx);
    }
    return Game._instance;
  }
  static Resize(width: number, height: number) {
    Game._windowedHeight = height;
    Game._windowedWidth = width;
    Game.Redraw();
  }
  static ToggleFullscreen() {
    Game._isFullscreen = !Game._isFullscreen;
    Game.Redraw();
  }
  private static Redraw() {
    if (Game._isFullscreen) {
      Game._instance.width = remote.screen.getPrimaryDisplay().size.width;
      Game._instance.height = remote.screen.getPrimaryDisplay().size.height;
      remote.getCurrentWindow().setFullScreen(true);
    } else {
      Game._instance.width = Game._windowedWidth;
      Game._instance.height = Game._windowedHeight;
      remote.getCurrentWindow().setSize(Game._instance.width, Game._instance.height, true);
      remote.getCurrentWindow().setFullScreen(false);
    }
    remote.getCurrentWindow().center();
    const scale = window.devicePixelRatio || 1;
    Game._instance.ctx.canvas.width = Game._instance.width * scale;
    Game._instance.ctx.canvas.height = Game._instance.height * scale;
    $(Game._instance.ctx.canvas).width(Game._instance.width);
    $(Game._instance.ctx.canvas).height(Game._instance.height);
    Game._instance.ctx.scale(scale, scale);
  }

  Start() {
    Game.Redraw();
    window.requestAnimationFrame(this.GameLoop);
  }

  GameLoop = (ts: number) => {
    this.ctx.clearRect(0,0, this.width, this.height);
    if (InputManager.isDown(Key.ESC)) {
      remote.app.quit();
    }
    if (InputManager.pressed(Key.SPACE)) {
      Game.ToggleFullscreen();
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
        this.ctx.fillText('FPS: ' + (1000 / avgFPS).toFixed(3), 5, 17);
      }
    }

    InputManager.flush();
    window.requestAnimationFrame(this.GameLoop);
  }
}
