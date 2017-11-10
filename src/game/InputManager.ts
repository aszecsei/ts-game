import * as Collections from 'typescript-collections';

export enum Key {
  Enter = 13,
  ESC = 27,
  SPACE = 32,
  LEFT = 37,
  UP = 38,
  RIGHT = 39,
  DOWN = 40,
  A = 65,
  D = 68,
  S = 83,
  W = 87
}

export class InputManager {
  private static _pressed = new Collections.Set<Key>();
  private static _lastPressed = new Collections.Set<Key>();

  static isDown(key: Key): boolean {
    return InputManager._pressed.contains(key);
  }
  static pressed(key: Key): boolean {
    return InputManager._pressed.contains(key) && !InputManager._lastPressed.contains(key);
  }
  static released(key: Key): boolean {
    return !InputManager._pressed.contains(key) && InputManager._lastPressed.contains(key);
  }
  static isUp(key: Key): boolean {
    return !InputManager._pressed.contains(key);
  }
  static setKeyDown(event: KeyboardEvent) {
    InputManager._pressed.add(event.keyCode);
  }
  static setKeyUp(event: KeyboardEvent) {
    InputManager._pressed.remove(event.keyCode);
  }
  static flush() {
    InputManager._lastPressed = $.extend({}, InputManager._pressed);
  }
}
