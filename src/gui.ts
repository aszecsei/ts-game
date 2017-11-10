import $ from 'jquery';
import { Game } from './game/game';

$(function() {
  $('body').html('<canvas id="canvas"></canvas>');
  const qCanvas = $('#canvas');
  qCanvas.css('background', 'black');
  qCanvas.css('margin', '0 0 0 0');
  qCanvas.width('100vw');
  qCanvas.height('100vh');

  const b = $('body, html');
  b.css('margin', 0);
  b.css('padding', 0);
  b.css('overflow', 'hidden');
  b.css('width', '100%');
  b.css('height', '100%');

  Game.Instance().Start();
  (document as any).game = Game.Instance();
});
