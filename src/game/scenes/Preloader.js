import { Scene } from 'phaser';

export class Preloader extends Scene {
  constructor() {
    super('Preloader');
  }

  init() {
    //  A simple progress bar. This is the outline of the bar.
    this.add.rectangle(512, 384, 468, 32, 0xffff00).setStrokeStyle(1, 0xffffff);

    //  This is the progress bar itself. It will increase in size from the left based on the % of progress.
    const bar = this.add.rectangle(512 - 230, 384, 4, 28, 0xffffff);

    //  Use the 'progress' event emitted by the LoaderPlugin to update the loading bar
    this.load.on('progress', progress => {
      //  Update the progress bar (our bar is 464px wide, so 100% = 464px)
      bar.width = 4 + 460 * progress;
    });
  }

  preload() {
    //  Load the assets for the game - Replace with your own assets
    this.load.setPath('assets');

    this.load.image('background', 'bg.png');

    this.load.image('base_tiles_0', '1_Terrains_and_Fences_32x32.png');
    this.load.image('base_tiles_1', '5_Floor_Modular_Buildings_32x32.png');
    this.load.image('base_tiles_2', '7_Villas_32x32.png');
    this.load.image('base_tiles_3', '9_Shopping_Center_and_Markets_32x32.png');
    this.load.image('base_tiles_4', '10_Vehicles_32x32.png');
    this.load.image('base_tiles_5', '11_Camping_32x32.png');
    this.load.image('base_tiles_6', '13_School_32x32.png');

    // load the JSON file
    this.load.tilemapTiledJSON('tilemap', 'dream_world.json');

    this.load.atlas('walk', 'sprites/walk.png', 'sprites/walk.json');
  }

  create() {
    //  When all the assets have loaded, it's often worth creating global objects here that the rest of the game can use.
    //  For example, you can define global animations here, so we can use them in other scenes.

    //  Move to the MainMenu. You could also swap this for a Scene Transition, such as a camera fade.
    this.scene.start('MainMenu');
  }
}
