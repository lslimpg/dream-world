import { EventBus } from "../EventBus";
import { Scene } from "phaser";

const states = [
    {
        key: "Intro",
        msgs: [
            `Jamie woke up early on a Saturday morning, and it's still quiet outside.
            The overcast skies further accentuated that stillness and calm, and she
            laid in bed for a few more minutes, fully appreciating the fact she need
            not rush to be anywhere today, and that if she so wished, be alone with her
            thoughts.
            She proceeded to get dressed, and make herself breakfast, which consisted of
            coffee, and toast with butter. As she sat, sipping the coffee and savouring
            the buttered toast, she stared out the window. The sky was just as grey
            as it was when she had woken. "Wouldn't it be nice if it stays this way?",
            she thought. It would feel as if time stood still.`,
            `And so it was, with that thought bringing Jamie deep in reverie, when she  
            jolted from it, recalling that she had agreed to a late morning tutoring session
            for a group of her students. Luckily, there's still a good hour to go. She got 
            dressed and ready to head to the school where she usually teaches.`,
        ],
    },
    {
        key: "School",
    },
    {
        key: "Afternoon Delight",
        msgs: [
            `It was a fruitful two hours of tutoring, particularly because one of Jamie's
            students finally had a breakthrough with understanding a tricky concept he
            had been struggling all week with. Jubilant, Jamie looked at her watch. It
            was only 1 pm. She still had an hour and a half before her planned meetup
            with Robin.`,
            `The skies had parted while she was inside, and now, a warm yellow glow suffused
            the town's landscape, lending a particular carefree mood to the air around it.
            Feeling light and airy, Jamie decided to while away the time at a brook in the
            woods, and made the trek there with a flask of hot coffee, a book in hand.`,
        ],
    },
    {
        key: "Meet Friend",
        msgs: [
            `It's coming to 3.30 in the afternoon. Jamie gathered her belongings and made
            her way to the town's market, where she and Robin had planned to meet.`,
        ],
    },
    {
        key: "Baking Session",
        msgs: [
            `After getting the ingredients they needed, Jamie and Robin headed back to
            Jamie's home. This afternoon, they had planned to bake curry puffs, and a big
            batch of it to share around.`,
        ],
    },
    {
        key: "See Grandma",
        msgs: [
            `It was a pleasant baking session. Jamie and Robin took turns preparing the ingredients,
            chopping the onions, seasoning the meat, and cooking the filling. Then, they sat at 
            the roundtable chatting and catching up with each other, while kneading the butter dough,
            and wrapping the filling with it`,
            `At the end, Jamie's house was full with the aroma of baked curry puffs.`,
            `Having shared some with Jamie's neighbours, Jamie and Robin got ready to head over
            to have dinner with Jamie's grannie.`,
        ],
    },
    {
        key: "Dinner at Grandma's",
        msgs: [
            `Jamie's grandma, still sprightly, with an ever present hint of a smile, welcomed them in.
            "It's fish porridge tonight, dearies!", she said. "But I've made spicy ground chicken for
            you", she added, as she smiled knowingly at Robin. "Jamie told me you are visiting today,
            and I know you are just ok with porridge".`,
            `After dinner, and when the dishes were done, it's close to 9 pm. Jamie, Robin and Grandma 
            gathered in the living room. It was a chilly evening, and Jamie felt like having stout, so
            she opened a bottle. Robin and Grandma opted for hot herbal tea. Together, they drank and
            munched curry puffs, while filling each other up on the town's gossip.`,
        ],
    },
    {
        key: "End",
        msgs: [
            `It was 10.30 pm. Robin prepared to leave and make her way back to the other side of town. 
            After bidding goodnight to her grandma, Jamie headed home herself, and as she pulled the bed 
            covers over, she reflected over the many simple pleasures today, and thought that it was as 
            perfect as it can be.`,
        ],
    },
];

function pickWidthHeight(obj) {
    let { width, height } = obj;
    return { width, height };
}

export class Game extends Scene {
    idx = 0;
    dialogConfig;
    dependencies = 1;

    constructor() {
        super("Game");
    }

    create() {
        this.map = this.make.tilemap({ key: "tilemap" });
        const terrainTiles = this.map.addTilesetImage(
            "1_Terrains_and_Fences_32x32",
            "base_tiles_0",
        );
        const campTiles = this.map.addTilesetImage(
            "11_Camping_32x32",
            "base_tiles_5",
        );
        const storeTiles = this.map.addTilesetImage(
            "5_Floor_Modular_Buildings_32x32",
            "base_tiles_1",
        );
        const buildingTiles = this.map.addTilesetImage(
            "7_Villas_32x32",
            "base_tiles_2",
        );
        const schoolTiles = this.map.addTilesetImage(
            "13_School_32x32",
            "base_tiles_6",
        );
        const shopTiles = this.map.addTilesetImage(
            "9_Shopping_Center_and_Markets_32x32",
            "base_tiles_3",
        );
        const shopCartTiles = this.map.addTilesetImage(
            "10_Vehicles_32x32",
            "base_tiles_4",
        );

        const floorLayer = this.map.createLayer("Floor", [
            terrainTiles,
            campTiles,
        ]);
        const floorDecoLayer = this.map.createLayer("Ground Objects", [
            terrainTiles,
            campTiles,
            schoolTiles,
            shopCartTiles,
            buildingTiles,
        ]);
        const buildingLayer = this.map.createLayer("Buildings", [
            storeTiles,
            shopTiles,
            campTiles,
            buildingTiles,
            schoolTiles,
        ]);
        const skyLayer = this.map.createLayer("Sky objects", [
            campTiles,
            buildingTiles,
            storeTiles,
            shopTiles,
        ]);

        // floorLayer.setCollisionByProperty({collides: true});
        floorDecoLayer.setCollisionByProperty({ collides: true });
        buildingLayer.setCollisionByProperty({ collides: true });

        this.objLayer = this.map.getObjectLayer("Obj Layer");

        const spawnPoint = this.map.findObject(
            "Obj Layer",
            (obj) => obj.name === "Spawn Point",
        );

        this.player = this.physics.add.sprite(
            spawnPoint.x,
            spawnPoint.y,
            "walk",
        );
        this.player.setCollideWorldBounds(true);
        this.physics.add.collider(this.player, floorLayer);
        this.physics.add.collider(this.player, floorDecoLayer);
        this.physics.add.collider(this.player, buildingLayer);

        this.anims.create({
            key: "walk_down",
            frames: this.anims.generateFrameNames("walk", {
                prefix: "walk_down_",
                start: 1,
                end: 9,
            }),
            frameRate: 10,
            repeat: -1,
        });
        this.anims.create({
            key: "walk_left",
            frames: this.anims.generateFrameNames("walk", {
                prefix: "walk_left_",
                start: 1,
                end: 9,
            }),
            frameRate: 10,
            repeat: -1,
        });
        this.anims.create({
            key: "walk_right",
            frames: this.anims.generateFrameNames("walk", {
                prefix: "walk_right_",
                start: 1,
                end: 9,
            }),
            frameRate: 10,
            repeat: -1,
        });
        this.anims.create({
            key: "walk_up",
            frames: this.anims.generateFrameNames("walk", {
                prefix: "walk_up_",
                start: 1,
                end: 9,
            }),
            frameRate: 10,
            repeat: -1,
        });

        this.cursors = this.input.keyboard.createCursorKeys();

        // Constrain the camera so that it isn't allowed to move outside the width/height of tilemap
        this.cameras.main.startFollow(this.player);
        this.cameras.main.setBounds(
            0,
            0,
            this.map.widthInPixels,
            this.map.heightInPixels,
            true,
        );
        this.physics.world.setBounds(
            0,
            0,
            this.map.widthInPixels,
            this.map.heightInPixels,
        );

        this.dialogConfig = pickWidthHeight(this.game.config);

        this.minimap = this.cameras
            .add(this.dialogConfig.width - 200, 0, 400, 400)
            .setOrigin(0, 0)
            .setZoom(0.1)
            .setName("mini");

        EventBus.on("phaser-jsx-done", this.onEventDone, this);
        EventBus.emit("current-scene-ready", this);
    }

    update() {
        const speed = 100;
        this.player.setVelocity(0);

        if (this.cursors.left.isDown) {
            this.player.setVelocityX(-speed);
            this.player.anims.play("walk_left", true);
        } else if (this.cursors.right.isDown) {
            this.player.setVelocityX(speed);
            this.player.anims.play("walk_right", true);
        } else if (this.cursors.up.isDown) {
            this.player.setVelocityY(-speed);
            this.player.anims.play("walk_up", true);
        } else if (this.cursors.down.isDown) {
            this.player.setVelocityY(speed);
            this.player.anims.play("walk_down", true);
        }
        if (
            this.cursors.left.isUp &&
            this.cursors.right.isUp &&
            this.cursors.up.isUp &&
            this.cursors.down.isUp
        ) {
            this.player.setVelocity(0);
            this.player.anims.stop();
        }
    }

    runStateMachine() {
        console.log(`SM idx: ${this.idx}`);
        switch (states[this.idx].key) {
            case "Intro":
            case "Afternoon Delight":
            case "Dinner at Grandma's":
            case "End":
                this.dependencies = 1;
                this.displayMessage(this.idx);
                break;
            case "School":
                this.dependencies = 1;
                this.displayGlow("School", this.runStateMachine);
                break;
            case "Meet Friend":
                this.dependencies = 2;
                this.displayGlow("Market");
                this.displayMessage(this.idx);
                break;
            case "Baking Session":
                this.dependencies = 2;
                this.displayGlow("Home");
                this.displayMessage(this.idx);
                break;
            case "See Grandma":
                this.dependencies = 2;
                this.displayGlow("Grandma");
                this.displayMessage(this.idx);
                break;
            default:
                console.log("Unexpected");
                break;
        }
        this.idx++;
        if (this.idx == states.length)
            EventBus.removeListener("phaser-jsx-done");
    }

    changeScene() {
        this.scene.start("GameOver");
    }

    displayMessage(idx) {
        let dialogProp = {
            msgs: states[idx].msgs,
            width: this.dialogConfig.width,
            height: this.dialogConfig.height,
        };
        EventBus.emit("show-dialog", this, dialogProp);
    }

    displayGlow(objName) {
        let glow;
        this.objLayer.objects.forEach((e) => {
            if (e.name === objName) {
                // console.log(e.polygon);
                const points = e.polygon.map(({ x, y }) => [x, y]).flat();
                // console.log(points);
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
            ease: "sine.inout",
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
        console.log(this.dependencies);
        console.log(typeof this.runStateMachine);
        if (!this.dependencies) this.runStateMachine();
    }
}
