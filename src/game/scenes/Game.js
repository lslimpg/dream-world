import { EventBus } from '../EventBus';
import { Scene } from 'phaser';

const msgs = [
    `Jamie woke up early on a Saturday morning, and it's still quiet outside.
    The overcast skies further accentuated that stillness and calm, and she
    laid in bed for a few more minutes, fully appreciating the fact she need
    not rush to be anywhere today, and that if she so wished, be alone with her
    thoughts.
    She proceeded to get dressed, and make herself breakfast, which consisted of
    coffee, and toast with butter. As she sat, sipping the coffee and savouring
    the buttered toast, she stared out the window. The sky was just as grey
    as it was when she had woken. "Wouldn't it be nice if it stays this way
    the whole day?", she thought. It would feel as if time stood still`,
];
const states = [
    "Intro",
    "School",
    "Meet friend",
    "See grandma",
    "End"
];

function pickWidthHeight(obj) {
    let {width, height} = obj;
    return {width, height};
}

export class Game extends Scene
{
    idx = 0;
    dialogConfig;

    constructor ()
    {
        super('Game');
    }

    create ()
    {
        // console.log(this.sys.game.canvas)
        // console.log(`Width: ${width}, height: ${height}`);
        // console.log(style);

        const map = this.make.tilemap({ key: 'tilemap' });
        const terrainTiles = map.addTilesetImage('1_Terrains_and_Fences_32x32', 'base_tiles_0');
        const campTiles = map.addTilesetImage('11_Camping_32x32', 'base_tiles_5');
        const storeTiles = map.addTilesetImage('5_Floor_Modular_Buildings_32x32', 'base_tiles_1');
        const buildingTiles = map.addTilesetImage('7_Villas_32x32', 'base_tiles_2');
        const schoolTiles = map.addTilesetImage('13_School_32x32', 'base_tiles_6');
        const shopTiles = map.addTilesetImage('9_Shopping_Center_and_Markets_32x3', 'base_tiles_3');
        const shopCartTiles = map.addTilesetImage('10_Vehicles_32x32', 'base_tiles_4');

        const floorLayer = map.createLayer('Floor', [terrainTiles, campTiles]);
        const floorDecoLayer = map.createLayer('Ground Objects', [terrainTiles, campTiles, schoolTiles, shopCartTiles, buildingTiles]);
        const buildingLayer = map.createLayer('Buildings', [storeTiles, shopTiles, campTiles, buildingTiles]);
        const skyLayer = map.createLayer('Sky objects', [buildingTiles, storeTiles, shopTiles]);

        floorLayer.setCollisionByProperty({collides: true});
        floorDecoLayer.setCollisionByProperty({collides: true});
        buildingLayer.setCollisionByProperty({collides: true});

        const spawnPoint = map.findObject('Characters', (obj) => obj.name === "Spawn Point");

        this.player = this.physics.add.sprite(spawnPoint.x, spawnPoint.y, 'walk');
        this.player.setCollideWorldBounds(true);
        this.physics.add.collider(this.player, floorLayer);
        this.physics.add.collider(this.player, floorDecoLayer);
        this.physics.add.collider(this.player, buildingLayer);

        this.anims.create({
            key: 'walk_down',
            frames: this.anims.generateFrameNames('walk',
            {
                prefix: 'walk_down_',
                start: 1,
                end: 9,
              }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: 'walk_left',
            frames: this.anims.generateFrameNames('walk',
            {
                prefix: 'walk_left_',
                start: 1,
                end: 9,
              }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: 'walk_right',
            frames: this.anims.generateFrameNames('walk',
            {
                prefix: 'walk_right_',
                start: 1,
                end: 9,
              }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: 'walk_up',
            frames: this.anims.generateFrameNames('walk',
            {
                prefix: 'walk_up_',
                start: 1,
                end: 9,
              }),
            frameRate: 10,
            repeat: -1
        });

        this.cursors = this.input.keyboard.createCursorKeys();

        // Constrain the camera so that it isn't allowed to move outside the width/height of tilemap
        this.cameras.main.startFollow(this.player);
        this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels, true);
        this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

        this.dialogConfig = pickWidthHeight(this.game.config);

        EventBus.emit('current-scene-ready', this);
    }

    update ()
    {
        const speed = 100;
        this.player.setVelocity(0);

        if (this.cursors.left.isDown) {
            this.player.setVelocityX(-speed);
            this.player.anims.play('walk_left', true);
        } else if (this.cursors.right.isDown) {
            this.player.setVelocityX(speed);
            this.player.anims.play('walk_right', true);
        } else if (this.cursors.up.isDown) {
            this.player.setVelocityY(-speed);
            this.player.anims.play('walk_up', true);
        } else if (this.cursors.down.isDown) {
            this.player.setVelocityY(speed);
            this.player.anims.play('walk_down', true);
        }
        if (this.cursors.left.isUp && this.cursors.right.isUp &&
            this.cursors.up.isUp && this.cursors.down.isUp) {
                this.player.setVelocity(0);
                this.player.anims.stop();
        }
    }

    runStateMachine ()
    {
        switch(states[this.idx]) {
            case 'Intro':
                console.log(`Entered, idx: ${this.idx}`);
                let dialogProp = {
                    msg: msgs[this.idx],
                    width: this.dialogConfig.width,
                    height: this.dialogConfig.height
                }
                this.idx = Math.min(this.idx + 1, states.length - 1);
                EventBus.emit('show-dialog', this, dialogProp);
                break;
        }
    }

    changeScene ()
    {
        this.scene.start('GameOver');
    }
}
