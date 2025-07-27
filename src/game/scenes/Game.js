import { EventBus } from '../EventBus';
import { Scene } from 'phaser';

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

export class Game extends Scene {
  idx = 0;
  dialogConfig;
  dependencies = 1;

  constructor() {
    super('Game');
  }

  create() {
    this.map = this.make.tilemap({ key: 'town_tilemap' });
    const terrainTiles = this.map.addTilesetImage(
      '1_Terrains_and_Fences_32x32',
      'base_tiles_0'
    );
    const campTiles = this.map.addTilesetImage(
      '11_Camping_32x32',
      'base_tiles_5'
    );
    const storeTiles = this.map.addTilesetImage(
      '5_Floor_Modular_Buildings_32x32',
      'base_tiles_1'
    );
    const buildingTiles = this.map.addTilesetImage(
      '7_Villas_32x32',
      'base_tiles_2'
    );
    const schoolTiles = this.map.addTilesetImage(
      '13_School_32x32',
      'base_tiles_6'
    );
    const shopTiles = this.map.addTilesetImage(
      '9_Shopping_Center_and_Markets_32x32',
      'base_tiles_3'
    );
    const shopCartTiles = this.map.addTilesetImage(
      '10_Vehicles_32x32',
      'base_tiles_4'
    );

    const floorLayer = this.map.createLayer('Floor', [terrainTiles, campTiles]);
    const floorDecoLayer = this.map.createLayer('Ground Objects', [
      terrainTiles,
      campTiles,
      schoolTiles,
      shopCartTiles,
      buildingTiles,
    ]);
    const buildingLayer = this.map.createLayer('Buildings', [
      storeTiles,
      shopTiles,
      campTiles,
      buildingTiles,
      schoolTiles,
    ]);
    const skyLayer = this.map.createLayer('Sky objects', [
      terrainTiles,
      campTiles,
      buildingTiles,
      storeTiles,
      shopTiles,
    ]);

    floorDecoLayer.setCollisionByProperty({ collides: true });
    buildingLayer.setCollisionByProperty({ collides: true });

    // Set a depth in order for the sky layer to be above
    // player
    skyLayer.setDepth(1);

    this.objLayer = this.map.getObjectLayer('Obj Layer');

    const spawnPoint = this.map.findObject(
      'Obj Layer',
      obj => obj.name === 'Spawn Point'
    );

    this.player = this.physics.add.sprite(spawnPoint.x, spawnPoint.y, 'player');
    this.player.setCollideWorldBounds(true);
    this.physics.add.collider(this.player, floorLayer);
    this.physics.add.collider(this.player, floorDecoLayer);
    this.physics.add.collider(this.player, buildingLayer);

    this.anims.create({
      key: 'walk_down',
      frames: this.anims.generateFrameNames('player', {
        prefix: 'walk_down_',
        start: 1,
        end: 9,
      }),
      frameRate: 10,
      repeat: -1,
    });
    this.anims.create({
      key: 'walk_left',
      frames: this.anims.generateFrameNames('player', {
        prefix: 'walk_left_',
        start: 1,
        end: 9,
      }),
      frameRate: 10,
      repeat: -1,
    });
    this.anims.create({
      key: 'walk_right',
      frames: this.anims.generateFrameNames('player', {
        prefix: 'walk_right_',
        start: 1,
        end: 9,
      }),
      frameRate: 10,
      repeat: -1,
    });
    this.anims.create({
      key: 'walk_up',
      frames: this.anims.generateFrameNames('player', {
        prefix: 'walk_up_',
        start: 1,
        end: 9,
      }),
      frameRate: 10,
      repeat: -1,
    });

    this.cursors = this.input.keyboard.createCursorKeys();
    this.keys = this.input.keyboard.addKeys('W,S,A,D');

    this.cameras.main.setZoom(0.6).zoomTo(1, 1000, 'Back', true, this.onCameraZoom);

    // Constrain the camera so that it isn't allowed to move outside the width/height of tilemap
    this.cameras.main.startFollow(this.player);
    this.cameras.main.setBounds(
      0,
      0,
      this.map.widthInPixels,
      this.map.heightInPixels,
      true
    );
    this.physics.world.setBounds(
      0,
      0,
      this.map.widthInPixels,
      this.map.heightInPixels
    );

    this.dialogConfig = configDialogSize(this.game.canvas);

    this.minimap = this.cameras
      .add()
      .setOrigin(0.9, 0)
      .setZoom(0.1)
      .setName('mini');

    EventBus.on('phaser-jsx-done', this.onEventDone, this);
  }

  update() {
    const speed = 300;
    this.player.setVelocity(0);

    if (this.keys.A.isDown || this.cursors.left.isDown) {
      this.player.setVelocityX(-speed);
      this.player.anims.play('walk_left', true);
    } else if (this.keys.D.isDown || this.cursors.right.isDown) {
      this.player.setVelocityX(speed);
      this.player.anims.play('walk_right', true);
    } else if (this.keys.W.isDown || this.cursors.up.isDown) {
      this.player.setVelocityY(-speed);
      this.player.anims.play('walk_up', true);
    } else if (this.keys.S.isDown || this.cursors.down.isDown) {
      this.player.setVelocityY(speed);
      this.player.anims.play('walk_down', true);
    }
    if (
      this.cursors.left.isUp &&
      this.cursors.right.isUp &&
      this.cursors.up.isUp &&
      this.cursors.down.isUp &&
      this.keys.W.isUp &&
      this.keys.A.isUp &&
      this.keys.S.isUp &&
      this.keys.D.isUp
    ) {
      this.player.setVelocity(0);
      this.player.anims.stop();
    }
  }

  runStateMachine() {
    // console.log(`SM idx: ${this.idx}`);
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

  onCameraZoom(camera, complete) {
    if (complete === 1) {
      this.enableTint();
      EventBus.emit('current-scene-ready', this);
    }
  }

  // changeScene() {
  //   this.scene.start('GameOver');
  // }

  enableTint() {
    let diner;
    this.objLayer.objects.forEach(e => {
      if (e.name === 'Market') {
        const points = e.polygon.map(({ x, y }) => [x, y]).flat();
        diner = this.add.polygon(e.x, e.y, points, 0xDCDCDC, 0.5).setOrigin(0.5, 0);
      }
    });
    this.physics.add.existing(diner);
    diner.body.setImmovable(true);
    this.physics.add.collider(this.player, diner, () => {
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
