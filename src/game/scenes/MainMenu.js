import { EventBus } from '../EventBus';
import { Scene } from 'phaser';

export class MainMenu extends Scene {
  logoTween;

  constructor() {
    super('MainMenu');
  }

  create() {
    this.add.image(512, 384, 'background');

    this.add
      .text(512, 200, 'Dream World', {
        fontFamily: 'Georgia Black',
        fontSize: 100,
        color: '#ffff00',
        stroke: '#000000',
        strokeThickness: 8,
        align: 'center',
      })
      .setDepth(100)
      .setOrigin(0.5);

    EventBus.emit('current-scene-ready', this);
  }

  changeScene() {
    this.scene.start('Game');
  }
}
