import { InputManager, Key } from './input_manager';
import { remote } from 'electron';
import { Screen } from './screen';
import $ from 'jquery';

const debug = true;

export class Game {
  private static _instance: Game;
  private static _windowedHeight = 720;
  private static _windowedWidth = 1080;
  private static _isFullscreen = false;
  width: number;
  height: number;
  gl: WebGLRenderingContext;
  private fpsList = [0];
  private currentScreen: Screen;
  private last: number = -1;
  private constructor(gl: WebGLRenderingContext) {
    let s = remote.getCurrentWindow().getSize();
    this.width = s[0];
    this.height = s[1];
    this.gl = gl;

    window.addEventListener('keyup', InputManager.setKeyUp);
    window.addEventListener('keydown', InputManager.setKeyDown);

    this.gl.canvas.width = this.width;
    this.gl.canvas.height = this.height;

    if (debug) {
      $('body').append('<div id="overlay"></div>');
      const overlay = $('#overlay');
      overlay.css('position', 'absolute');
      overlay.css('left', '10px');
      overlay.css('top', '10px');
      overlay.css('background-color', 'rgba(0, 0, 0, 0.7');
      overlay.css('color', 'white');
      overlay.css('font-family', 'monospace');
      overlay.css('padding', '1em');
    }
  }
  static Instance(): Game {
    if (!Game._instance) {
      const gl = ($('#canvas')[0] as HTMLCanvasElement).getContext('webgl');
      Game._instance = new Game(gl);
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
    Game._instance.gl.canvas.width = Game._instance.width * scale;
    Game._instance.gl.canvas.height = Game._instance.height * scale;
    $(Game._instance.gl.canvas).width(Game._instance.width);
    $(Game._instance.gl.canvas).height(Game._instance.height);
  }

  Start() {
    Game.Redraw();
    window.requestAnimationFrame(this.GameLoop);
  }

  GameLoop = (ts: number) => {
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT | this.gl.STENCIL_BUFFER_BIT);
    if (InputManager.isDown(Key.ESCAPE)) {
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
      this.currentScreen.draw(this.gl, delta);
    }

    // FPS Counter
    if (debug) {
      this.fpsList.push(delta);
      if (this.fpsList.length > 10) {
        this.fpsList.shift();
        const avgFPS = this.fpsList.reduce((x,y) => x + y, 0) / 10;
        $('#overlay').text('FPS: ' + (1000 / avgFPS).toFixed(3));
      } else {
        $('#overlay').text('FPS: ...');
      }
    }

    InputManager.flush();
    window.requestAnimationFrame(this.GameLoop);
  }
}
