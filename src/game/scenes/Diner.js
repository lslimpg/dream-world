import { EventBus } from '../EventBus';
import { Scene } from 'phaser';
import Player from './Player';

const States = {
  IDLE: 'IDLE',
  PLAYING_ANIMATION: 'PLAYING_ANIMATION',
}

function handleTransitionFromSit(gameObject, player, keys, cursors) {
  player.body.updateFromGameObject(); // Update the physics body
  let tileX = gameObject.sitTile.x;
  let tileY = gameObject.sitTile.y;
  let input = getPlayerInputMovement(player, keys, cursors);
  // console.log('Input:', input);
  let nextTile = gameObject.map.getTileAt(tileX + input.x, tileY + input.y, false, gameObject.counterTopLayer);
  // console.log('Next tile:', nextTile);
  if (!nextTile || !nextTile.properties.collides) {
    console.log('Next tile found:', nextTile);
    nextTile = gameObject.map.getTileAt(tileX + input.x, tileY + input.y, false, gameObject.floorLayer);
    console.log('Next tile:', nextTile);
    if (!nextTile) {
      console.log('No next tile found, returning to idle state');
      gameObject.state = States.IDLE;
      return;
    }
    player.setPosition(nextTile.getCenterX(), nextTile.getCenterY());
    gameObject.state = States.IDLE;
    gameObject.repeatingTimer.remove();
  }
}

function createMap(scene) {
  scene.map = scene.make.tilemap({ key: 'diner_tilemap' });
  const floorTiles = scene.map.addTilesetImage('Inside_A2', 'diner_tiles_1');
  const wallTiles = scene.map.addTilesetImage('Inside_A4', 'diner_tiles_2');
  const dinerTiles0 = scene.map.addTilesetImage('Inside_B', 'diner_tiles_3');
  const dinerTiles1 = scene.map.addTilesetImage('interior', 'diner_tiles_4');
  const fridgeTiles = scene.map.addTilesetImage('fridge', 'diner_tiles_5');

  scene.floorLayer = scene.map.createLayer('Floor', [floorTiles, wallTiles]);
  scene.counterTopLayer = scene.map.createLayer('Countertop', [dinerTiles0, dinerTiles1, fridgeTiles]);
  scene.applianceLayer = scene.map.createLayer('Appliances', [dinerTiles0, dinerTiles1, wallTiles]);
  scene.windowLayer = scene.map.createLayer('Wall', [wallTiles, dinerTiles0, dinerTiles1]);
  scene.shelfLayer = scene.map.createLayer('Shelf', [dinerTiles0, dinerTiles1, fridgeTiles]);

  // Set collision for the layers
  scene.counterTopLayer.setCollisionByProperty({ collides: true });
  scene.windowLayer.setCollisionByProperty({ collides: true });
  scene.shelfLayer.setDepth(1);
}

function rescaleMap(scene) {
  const canvasWidth = scene.cameras.main.width;
  const canvasHeight = scene.cameras.main.height;
  const tilemapWidth = scene.map.widthInPixels; // or tilemap.widthInTiles * tileWidth
  const tilemapHeight = scene.map.heightInPixels; // or tilemap.heightInTiles * tileHeight
  const scaleX = canvasWidth / tilemapWidth;
  const scaleY = canvasHeight / tilemapHeight;

  scene.scaleMax = Math.max(scaleX, scaleY);

  // Resize game map
  scene.map.widthInPixels *= scene.scaleMax;
  scene.map.heightInPixels *= scene.scaleMax;
}

function setupCamera(scene) {
  // Constrain the camera so that it isn't allowed to move outside the width/height of tilemap
  scene.cameras.main.startFollow(scene.player);
  scene.cameras.main.setBounds(
    0,
    0,
    scene.map.widthInPixels,
    scene.map.heightInPixels,
    true
  );
}

export class Diner extends Scene {
  constructor() {
    super('diner');
  }

  create() {
    this.state = States.IDLE;
  
    createMap(this);
    rescaleMap(this);
    // Resize the world
    this.map.layers.forEach(layer => {
      layer.tilemapLayer.setScale(this.scaleMax);
    });
  
    this.objLayer = this.map.getObjectLayer('Obj Layer');
    this.player = new Player(this, 'player', this.scaleMax);
    this.player.addCollidingLayer(this.counterTopLayer);
    this.player.addCollidingLayer(this.windowLayer);
  
    setupCamera(this);

    this.physics.world.setBounds(
      0,
      0,
      this.map.widthInPixels,
      this.map.heightInPixels
    );
  
    this.cursors = this.input.keyboard.addKeys({
      up: 'W', down: 'S', left: 'A', right: 'D',
    });

    EventBus.emit('current-scene-ready', this);
  }

  update() {
    const speed = 300;
    this.player.handleMovement(this.cursors);
  }

  onCollideWithCounterTop(player, tile) {
    if (tile.properties.sitFaceLeft) {
      this.state = States.PLAYING_ANIMATION;
      // Get the tile's grid coordinates
      const tileX = tile.x;
      const tileY = tile.y;
      console.log(`Tile grid coordinates: (${tileX}, ${tileY})`);
      const sitTile = this.counterTopLayer.findTile(
        tile => tile.properties.sitLeftTile, null, tile.x - 1, tile.y - 1, 3, 3);
      if (sitTile) {
        console.log('Sit tile coordinates:', sitTile.getCenterX(), sitTile.getCenterY());
        player.setPosition(sitTile.getCenterX(), sitTile.getCenterY());
        player.anims.play('sit_left', false);
        this.sitTile = {x: sitTile.x, y: sitTile.y};
        console.log(`Sit tile grid coordinates: (${this.sitTile.x}, ${this.sitTile.y})`);
        this.repeatingTimer = this.time.addEvent({
          delay: 500,
          callback: () => {
            handleTransitionFromSit(this, player, this.keys, this.cursors);
          },
          callbackScope: this,
          loop: true,
        });
      }
    }
  }
}