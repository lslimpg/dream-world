import { EventBus } from '../EventBus';
import { Scene } from 'phaser';
import Player from './Player';

const states = [
  {
    key: 'Intro',
    msgs: [
      `It's a sunny day when Jamie woke up. Fortunately a new worker today at the
      diner. An airy feeling of hope rose within her, as even though she
      would have preferred it overcast, she's havin along with the light rays
      beaming through. Hopefully, she would hit it off with the new worker. It's
      hard to get help in this neck of the woods.`,
      `She quickly got dressed and headed out, after some light breakfast.`
    ],
  }
];

function configDialogSize(canvas) {
  let parent = canvas.parentElement;
  let { width, height, "margin-top": bottomOffset } = canvas.style || canvas;
  width = parseInt(width);
  height = parseInt(height);
  bottomOffset = parent.clientHeight - height - parseInt(bottomOffset);
  return { width, height, bottomOffset };
}

function createMap(scene) {
   scene.map = scene.make.tilemap({ key: 'town_tilemap' });
    const terrainTiles = scene.map.addTilesetImage(
      '1_Terrains_and_Fences_32x32',
      'base_tiles_0'
    );
    const campTiles = scene.map.addTilesetImage(
      '11_Camping_32x32',
      'base_tiles_5'
    );
    const storeTiles = scene.map.addTilesetImage(
      '5_Floor_Modular_Buildings_32x32',
      'base_tiles_1'
    );
    const buildingTiles = scene.map.addTilesetImage(
      '7_Villas_32x32',
      'base_tiles_2'
    );
    const schoolTiles = scene.map.addTilesetImage(
      '13_School_32x32',
      'base_tiles_6'
    );
    const shopTiles = scene.map.addTilesetImage(
      '9_Shopping_Center_and_Markets_32x32',
      'base_tiles_3'
    );
    const shopCartTiles = scene.map.addTilesetImage(
      '10_Vehicles_32x32',
      'base_tiles_4'
    );

    scene.floorLayer = scene.map.createLayer('Floor', [terrainTiles, campTiles]);
    scene.floorDecoLayer = scene.map.createLayer('Ground Objects', [
      terrainTiles,
      campTiles,
      schoolTiles,
      shopCartTiles,
      buildingTiles,
    ]);
    scene.buildingLayer = scene.map.createLayer('Buildings', [
      storeTiles,
      shopTiles,
      campTiles,
      buildingTiles,
      schoolTiles,
    ]);
    scene.skyLayer = scene.map.createLayer('Sky objects', [
      terrainTiles,
      campTiles,
      buildingTiles,
      storeTiles,
      shopTiles,
    ]);

    scene.floorDecoLayer.setCollisionByProperty({ collides: true });
    scene.buildingLayer.setCollisionByProperty({ collides: true });

    // Set a depth in order for the sky layer to be above
    // player
    scene.skyLayer.setDepth(1);
}

function onCameraZoom(camera, complete, scene) {
  if (complete === 1) {
    scene.enableTint();
    EventBus.emit('current-scene-ready', scene);
  }
}

function setupCamera(scene, player) {
  scene.cameras.main.setZoom(0.6).zoomTo(1, 1000, 'Back', true, (cam, complete) => onCameraZoom(cam, complete, scene));
  
  // Constrain the camera so that it isn't allowed to move outside the width/height of tilemap
  if (player !== null) {
    scene.cameras.main.startFollow(player);
  }
  scene.cameras.main.setBounds(
    0,
    0,
    scene.map.widthInPixels,
    scene.map.heightInPixels,
    true
  );

  scene.minimap = scene.cameras
    .add()
    .setOrigin(0.9, 0)
    .setZoom(0.1)
    .setName('mini');
}

export class Game extends Scene {
  idx = 0;
  dependencies = 1;

  constructor() {
    super('Game');
  }

  create() {
    createMap(this);

    this.objLayer = this.map.getObjectLayer('Obj Layer');

    this.player = new Player(this, 'player');
    this.player.addCollidingLayer(this.floorLayer);
    this.player.addCollidingLayer(this.floorDecoLayer);
    this.player.addCollidingLayer(this.buildingLayer);

    this.physics.world.setBounds(
      0,
      0,
      this.map.widthInPixels,
      this.map.heightInPixels
    );

    setupCamera(this, this.player);
  
    this.cursors = this.input.keyboard.addKeys({
      up: 'W', down: 'S', left: 'A', right: 'D',
    });

    this.dialogConfig = configDialogSize(this.game.canvas);

    EventBus.on('phaser-jsx-done', this.onEventDone, this);
  }

  update() {
    this.player.handleMovement(this.cursors);
  }

  runStateMachine() {
    console.log(`SM idx: ${this.idx}`);
    switch (states[this.idx].key) {
      case 'Intro':
      case 'Afternoon Delight':
      case "Dinner at Grandma's":
      case 'End':
        this.dependencies = 1;
        this.displayMessage(this.idx);
        break;
      case 'School':
        this.dependencies = 1;
        this.displayGlow('School');
        break;
      case 'Meet Friend':
        this.dependencies = 2;
        this.displayGlow('Market');
        this.displayMessage(this.idx);
        break;
      case 'Baking Session':
        this.dependencies = 2;
        this.displayGlow('Home');
        this.displayMessage(this.idx);
        break;
      case 'See Grandma':
        this.dependencies = 2;
        this.displayGlow('Grandma');
        this.displayMessage(this.idx);
        break;
      default:
        console.log('Unexpected');
        break;
    }
    this.idx++;
    if (this.idx == states.length) EventBus.removeListener('phaser-jsx-done');
  }

  // changeScene() {
  //   this.scene.start('GameOver');
  // }

  enableTint() {
    let diner;
    this.objLayer.objects.forEach(e => {
      if (e.name === 'Diner') {
        const points = e.polygon.map(({ x, y }) => [x, y]).flat();
        diner = this.add.polygon(e.x, e.y, points, 0xDCDCDC, 0.5).setOrigin(0, 0);
      }
    });
    this.physics.add.existing(diner);
    diner.body.setImmovable(true);
    // Set body size to match polygon bounds
    diner.body.setSize(diner.width, diner.height);
    diner.body.setOffset(0, 0);
    console.log('Diner:', diner.body.x, diner.body.y, diner.body.width, diner.body.height);
    this.physics.add.collider(this.player, diner.body, () => {
      console.log('collided');
      this.scene.start('diner');
    });
  }
    

  displayMessage(idx) {
    let dialogProp = {
      msgs: states[idx].msgs,
      width: this.dialogConfig.width,
      height: this.dialogConfig.height,
      bottomOffset: this.dialogConfig.bottomOffset,
    };
    EventBus.emit('show-dialog', this, dialogProp);
  }

  displayGlow(objName) {
    console.log('test');
    let glow;
    this.objLayer.objects.forEach(e => {
      if (e.name === objName) {
        const points = e.polygon.map(({ x, y }) => [x, y]).flat();
        glow = this.add.polygon(e.x, e.y, points).setOrigin(0, 0);
        glow.setStrokeStyle(4, 0xefc53f);
        glow.postFX.addGlow(0xffff00, 8, 0, true, 0.05, 24);
      }
    });
    this.tweens.add({
      targets: glow,
      scaleX: 0.9,
      scaleY: 0.9,
      yoyo: true,
      repeat: -1,
      ease: 'sine.inout',
    });
    this.physics.add.existing(glow);
    glow.body.setImmovable(true);
    this.physics.add.collider(this.player, glow, () => {
      glow.destroy();
      this.onEventDone();
    });
  }

  onEventDone() {
    this.dependencies--;
    console.log(`dependencies: ${this.dependencies}`);
    if (!this.dependencies) this.runStateMachine();
  }
}
