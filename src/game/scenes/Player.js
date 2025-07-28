export default class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, texture, scale = 1) {
    const spawnPoint = scene.map.findObject(
      'Obj Layer',
      obj => obj.name === 'Spawn Point'
    );
    super(scene, spawnPoint.x * scale, spawnPoint.y * scale, texture);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setCollideWorldBounds(true);
  
    this.graphics = scene.add.graphics();
    this.graphics.lineStyle(2, 0xff0000, 1);
  
    // Resize physics body
    // this.body.setSize(0.45 * this.width, 0.45 * this.height);
    // this.body.setOffset(0.30 * this.width, 0.55 * this.height);
  
      // Resize player
    this.setScale(scale);
    // Update body size and offset after scaling
    const bodyWidth = this.width * 0.35;
    const bodyHeight = this.height * 0.3;
    this.body.setSize(bodyWidth, bodyHeight);

    const offsetX = bodyWidth; // No horizontal offset
    const offsetY = this.height - bodyHeight; // Move the body to the bottom
    this.body.setOffset(offsetX, offsetY);
  }

  handleMovement(keys) {
    const speed = 300;
    this.setVelocity(0);

    this.graphics.clear();
    this.graphics.strokeRect(
      this.body.x,
      this.body.y,
      this.body.width,
      this.body.height
    );

    if (keys.left.isDown) {
      this.setVelocityX(-speed);
      this.anims.play('walk_left', true);
    } else if (keys.right.isDown) {
      this.setVelocityX(speed);
      this.anims.play('walk_right', true);
    } else if (keys.up.isDown) {
      this.setVelocityY(-speed);
      this.anims.play('walk_up', true);
    } else if (keys.down.isDown) {
      this.setVelocityY(speed);
      this.anims.play('walk_down', true);
    }
    const { x, y } = this.body.velocity;
    if (!x && !y) {
      this.anims.stop();
    }
  }

  addCollidingLayer(layer) {
    this.scene.physics.add.collider(this, layer);
  }
}
