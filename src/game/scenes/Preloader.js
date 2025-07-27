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

    // Town tiles
    this.load.image('base_tiles_0', '1_Terrains_and_Fences_32x32.png');
    this.load.image('base_tiles_1', '5_Floor_Modular_Buildings_32x32.png');
    this.load.image('base_tiles_2', '7_Villas_32x32.png');
    this.load.image('base_tiles_3', '9_Shopping_Center_and_Markets_32x32.png');
    this.load.image('base_tiles_4', '10_Vehicles_32x32.png');
    this.load.image('base_tiles_5', '11_Camping_32x32.png');
    this.load.image('base_tiles_6', '13_School_32x32.png');
  
    // diner tiles
    this.load.image('diner_tiles_0', 'Kitchen-1.png');
    this.load.image('diner_tiles_1', 'Inside_A2.png');
    this.load.image('diner_tiles_2', 'Inside_A4.png');
    this.load.image('diner_tiles_3', 'Inside_B.png');
    this.load.image('diner_tiles_4', 'interior.png');
    this.load.image('diner_tiles_5', 'fridge.png');

    // load the JSON file
    this.load.tilemapTiledJSON('town_tilemap', 'dream_world.json');
    this.load.tilemapTiledJSON('diner_tilemap', 'diner.json');

    this.load.spritesheet('player', 'sprites/girl_48.png', { frameWidth: 48, frameHeight: 48 })
  }

  create() {
    //  When all the assets have loaded, it's often worth creating global objects here that the rest of the game can use.
    //  For example, you can define global animations here, so we can use them in other scenes.
    this.anims.create({
      key: 'walk_down',
      frames: this.anims.generateFrameNumbers('player', { frames: [78, 79, 80, 81, 82, 83, 84, 85, 86] }),
      frameRate: 10,
      repeat: -1,
    });
    this.anims.create({
      key: 'walk_left',
      frames: this.anims.generateFrameNumbers('player', { frames: [69, 70, 71, 72, 73, 74, 75, 76, 77] }),
      frameRate: 10,
      repeat: -1,
    });
    this.anims.create({
      key: 'walk_right',
      frames: this.anims.generateFrameNumbers('player', { frames: [87, 88, 89, 90, 91, 92, 93, 94, 95] }),
      frameRate: 10,
      repeat: -1,
    });
    this.anims.create({
      key: 'walk_up',
      frames: this.anims.generateFrameNumbers('player', { frames: [60, 61, 62, 63, 64, 65, 66, 67, 68] }),
      frameRate: 10,
      repeat: -1,
    });
    this.anims.create({
      key: 'sit_left',
      frames: this.anims.generateFrameNumbers('player', { frames: [223] }),
      frameRate: 2,
      repeat: -1,
    });

    //  Move to the MainMenu. You could also swap this for a Scene Transition, such as a camera fade.
    this.scene.start('MainMenu');
  }
}
