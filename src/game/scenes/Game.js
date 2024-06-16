import { EventBus } from '../EventBus';
import { Scene } from 'phaser';

const states = [
    {
        key: 'Intro',
        msgs: [
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
            `And so it was, with that thought bringing Jamie deep in reverie, when she jolted
            from it, recalling that she had agreed to a late morning tutoring session for
            a group of her students. Luckily, there's still a good hour to go. She got dressed
            and ready to head to the school where she usually teaches.`
        ]
    },
    {
        key: 'School',
    },
    {
        key: 'Meet Friend',
    },
    {
        key: 'See Grandma',
    },
    {
        key: 'End'
    }
]

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

        this.map = this.make.tilemap({ key: 'tilemap' });
        const terrainTiles = this.map.addTilesetImage('1_Terrains_and_Fences_32x32', 'base_tiles_0');
        const campTiles = this.map.addTilesetImage('11_Camping_32x32', 'base_tiles_5');
        const storeTiles = this.map.addTilesetImage('5_Floor_Modular_Buildings_32x32', 'base_tiles_1');
        const buildingTiles = this.map.addTilesetImage('7_Villas_32x32', 'base_tiles_2');
        const schoolTiles = this.map.addTilesetImage('13_School_32x32', 'base_tiles_6');
        const shopTiles = this.map.addTilesetImage('9_Shopping_Center_and_Markets_32x32', 'base_tiles_3');
        const shopCartTiles = this.map.addTilesetImage('10_Vehicles_32x32', 'base_tiles_4');

        const floorLayer = this.map.createLayer('Floor', [terrainTiles, campTiles]);
        const floorDecoLayer = this.map.createLayer('Ground Objects', [terrainTiles, campTiles, schoolTiles, shopCartTiles, buildingTiles]);
        const buildingLayer = this.map.createLayer('Buildings', [storeTiles, shopTiles, campTiles, buildingTiles]);
        const skyLayer = this.map.createLayer('Sky objects', [campTiles, buildingTiles, storeTiles, shopTiles]);

        // floorLayer.setCollisionByProperty({collides: true});
        floorDecoLayer.setCollisionByProperty({collides: true});
        buildingLayer.setCollisionByProperty({collides: true});

        const spawnPoint = this.map.findObject('Obj Layer', (obj) => obj.name === "Spawn Point")

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

        // Constrain the camera so that it isn't allowed to move outside the width/height of tilethis.map
        this.cameras.main.startFollow(this.player);
        this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels, true);
        this.physics.world.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);

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
        console.log(`SM idx: ${this.idx}`);
        switch(states[this.idx].key) {
            case 'Intro':
                let dialogProp = {
                    msgs: states[this.idx].msgs,
                    width: this.dialogConfig.width,
                    height: this.dialogConfig.height
                }
                this.idx = Math.min(this.idx + 1, states.length - 1);
                EventBus.emit('show-dialog', this, dialogProp);
                break;
            case 'School':
                const objLayer = this.map.getObjectLayer('Obj Layer');
                objLayer.objects.forEach((e) => {
                    if (e.name === 'School') {
                        console.log(e.polygon);
                        const points = e.polygon.map(({x, y}) => ([x, y])).flat();
                        console.log(points);
                        this.schoolHighlight = this.add.polygon(e.x, e.y, points).setOrigin(0, 0);
                        this.schoolHighlight.setStrokeStyle(4, 0xefc53f);
                        this.schoolHighlight.postFX.addGlow(0xffff00, 8, 0, true, 0.05, 24);
                    }
                })
                this.tweens.add({
                    targets: this.schoolHighlight,
                    scaleX: 0.9,
                    scaleY: 0.9,
                    yoyo: true,
                    repeat: -1,
                    ease: 'sine.inout'
                });
                this.physics.add.collider(this.player, this.schoolHighlight, () => {console.log("Collide!")});
                this.idx = Math.min(this.idx + 1, states.length - 1);
                break;
        }
    }

    changeScene ()
    {
        this.scene.start('GameOver');
    }
}
