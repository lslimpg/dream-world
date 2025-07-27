import { EventBus } from '../EventBus';
import { Scene } from 'phaser';

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

export class Diner extends Scene {
  constructor() {
    super('diner');
  }

  create() {
    this.state = States.IDLE;

    this.map = this.make.tilemap({ key: 'diner_tilemap' });
    const floorTiles = this.map.addTilesetImage('Inside_A2', 'diner_tiles_1');
    const wallTiles = this.map.addTilesetImage('Inside_A4', 'diner_tiles_2');
    const dinerTiles0 = this.map.addTilesetImage('Inside_B', 'diner_tiles_3');
    const dinerTiles1 = this.map.addTilesetImage('interior', 'diner_tiles_4');
    const fridgeTiles = this.map.addTilesetImage('fridge', 'diner_tiles_5');

    const floorLayer = this.map.createLayer('Floor', [floorTiles, wallTiles]);
    const counterTopLayer = this.map.createLayer('Countertop', [dinerTiles0, dinerTiles1, fridgeTiles]);
    const applianceLayer = this.map.createLayer('Appliances', [dinerTiles0, dinerTiles1, wallTiles]);
    const windowLayer = this.map.createLayer('Wall', [wallTiles, dinerTiles0, dinerTiles1]);
    const shelfLayer = this.map.createLayer('Shelf', [dinerTiles0, dinerTiles1, fridgeTiles]);

    // Set collision for the layers
    counterTopLayer.setCollisionByProperty({ collides: true });
    windowLayer.setCollisionByProperty({ collides: true });
    shelfLayer.setDepth(1);
  
    // Get the scaling factor
    const canvasWidth = this.cameras.main.width;
    const canvasHeight = this.cameras.main.height;
    const tilemapWidth = this.map.widthInPixels; // or tilemap.widthInTiles * tileWidth
    const tilemapHeight = this.map.heightInPixels; // or tilemap.heightInTiles * tileHeight
    const scaleX = canvasWidth / tilemapWidth;
    const scaleY = canvasHeight / tilemapHeight;

    let scaleMax = Math.max(scaleX, scaleY);
    console.log(`Scalemax: ${scaleMax}`);
    this.scaleMax = scaleMax;
    // Resize the world
    this.map.layers.forEach(layer => {
      layer.tilemapLayer.setScale(scaleMax);
    });
  
    this.objLayer = this.map.getObjectLayer('Obj Layer');

    const spawnPoint = this.map.findObject(
      'Obj Layer',
      obj => obj.name === 'Spawn Point'
    );

    this.player = this.physics.add.sprite(spawnPoint.x * scaleMax, spawnPoint.y * scaleMax, 'player');

    this.player.setCollideWorldBounds(true);

    // Set the collision for the player
    this.physics.add.collider(this.player, counterTopLayer, () => console.log('Collided with countertop'), null, this);
    this.physics.add.collider(this.player, windowLayer, () => console.log('Collided with window'), null, this);
    
    // Resize player
    this.player.setScale(scaleMax);
    // Update body size and offset after scaling
    const bodyWidth = this.player.width * 0.35;
    const bodyHeight = this.player.height * 0.3;
    this.player.body.setSize(bodyWidth, bodyHeight);

    const offsetX = bodyWidth; // No horizontal offset
    const offsetY = this.player.height - bodyHeight; // Move the body to the bottom
    this.player.body.setOffset(offsetX, offsetY);

    // Resize game map
    this.map.widthInPixels *= scaleMax;
    this.map.heightInPixels *= scaleMax;

    this.debugGraphics = this.add.graphics();
    this.debugGraphics.lineStyle(2, 0xff0000, 1); // Red outline
    // Highlight collision tiles for debugging
    counterTopLayer.renderDebug(this.debugGraphics, {
      tileColor: null, // Non-colliding tiles will not be highlighted
      collidingTileColor: new Phaser.Display.Color(255, 0, 0, 100), // Red for colliding tiles
      faceColor: new Phaser.Display.Color(0, 255, 0, 100), // Green for colliding face edges
    });

    windowLayer.renderDebug(this.debugGraphics, {
      tileColor: null,
      collidingTileColor: new Phaser.Display.Color(0, 0, 255, 100), // Blue for colliding tiles
      faceColor: new Phaser.Display.Color(255, 255, 0, 100), // Yellow for colliding face edges
    });

    this.cursors = this.input.keyboard.createCursorKeys();
    this.keys = this.input.keyboard.addKeys('W,S,A,D');

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

    EventBus.emit('current-scene-ready', this);
  }

  update() {
    const speed = 300;
    // Clear previous debug graphics
    this.debugGraphics.clear();
    if (this.player.body) {
      this.debugGraphics.strokeRect(
        this.player.body.x, // Body's x position
        this.player.body.y, // Body's y position
        this.player.body.width, // Body's width
        this.player.body.height // Body's height
      );
    }
    if (this.state === States.PLAYING_ANIMATION) {
      return;
    }
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