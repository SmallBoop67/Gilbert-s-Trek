class Platformer extends Phaser.Scene {
    constructor() {
        super("platformerScene");
    }

    init() {
        // variables and settings
        this.ACCELERATION = 400;
        this.DRAG = 500;    // DRAG < ACCELERATION = icy slide
        this.physics.world.gravity.y = 1500;
        this.JUMP_VELOCITY = -600;
        this.PARTICLE_VELOCITY = 50;
        this.SCALE = 2.0;
        this.score = 0;
        this.isDead = false;

        
    }

    create() {
        // Create a new tilemap game object which uses 18x18 pixel tiles, and is
        // 45 tiles wide and 25 tiles tall.
        this.map = this.add.tilemap("platformer-level-1");

        // Add a tileset to the map
        // First parameter: name we gave the tileset in Tiled
        // Second parameter: key for the tilesheet (from this.load.image in Load.js)
        this.tileset = this.map.addTilesetImage("kenny_tilemap_packed", "tilemap_tiles");

        // Create a layer
        this.groundLayer = this.map.createLayer("Ground-n-Platforms", this.tileset, 0, 0);

        this.spikeLayer = this.map.createLayer("Spikes", this.tileset, 0, 0);

        // Make it collidable
        this.groundLayer.setCollisionByProperty({
            
            collides: true
        });

        this.spikeLayer.setCollisionByProperty({
            kills: true
        });

                // Find coins in the "Objects" layer in Phaser
        // Look for them by finding objects with the name "coin"
        // Assign the coin texture from the tilemap_sheet sprite sheet
        // Phaser docs:
        // https://newdocs.phaser.io/docs/3.80.0/focus/Phaser.Tilemaps.Tilemap-createFromObjects

        this.coins = this.map.createFromObjects("Objects", {
            name: "coin",
            key: "tilemap_sheet",
            frame: 151
        });

        this.flag = this.map.createFromObjects("Objects", {
            name: "flag",
            key: "tilemap_sheet",
            frame: 112
        });

 
        

                // Since createFromObjects returns an array of regular Sprites, we need to convert 
        // them into Arcade Physics sprites (STATIC_BODY, so they don't move) 
        this.physics.world.enable(this.coins, Phaser.Physics.Arcade.STATIC_BODY);

        this.physics.world.enable(this.flag, Phaser.Physics.Arcade.STATIC_BODY);

        this.flagGroup = this.add.group(this.flag);



        // Create a Phaser group out of the array this.coins
        // This will be used for collision detection below.
        this.coinGroup = this.add.group(this.coins);
        

        // set up player avatar
        my.sprite.player = this.physics.add.sprite(30, 370, "platformer_characters", "tile_0000.png");
        my.sprite.player.setCollideWorldBounds(true);
        my.sprite.enemy = this.physics.add.sprite(600, 370, "platformer_characters", "tile_0015.png");
        my.sprite.enemy.setCollideWorldBounds(true);

        my.sprite.enemyUpDown = this.physics.add.sprite(950, 70, "platformer_characters", "tile_0011.png");
        my.sprite.enemyUpDown.setCollideWorldBounds(true);
        my.sprite.enemyUpDown.body.setAllowGravity(false); // ignore gravity so it can move up
        my.sprite.enemyUpDown.setVelocityY(80);

        this.physics.add.overlap(my.sprite.player, my.sprite.enemyUpDown, () => {
            this.playerHitSpike(my.sprite.player, null);
        }, null, this);

        my.sprite.enemyUpDown2 = this.physics.add.sprite(1060, 70, "platformer_characters", "tile_0011.png");
        my.sprite.enemyUpDown2.setCollideWorldBounds(true);
        my.sprite.enemyUpDown2.body.setAllowGravity(false); // ignore gravity so it can move up
        my.sprite.enemyUpDown2.setVelocityY(80);

        this.physics.add.overlap(my.sprite.player, my.sprite.enemyUpDown2, () => {
            this.playerHitSpike(my.sprite.player, null);
        }, null, this);

        my.sprite.enemyUpDown3 = this.physics.add.sprite(1170, 70, "platformer_characters", "tile_0011.png");
        my.sprite.enemyUpDown3.setCollideWorldBounds(true);
        my.sprite.enemyUpDown3.body.setAllowGravity(false); // ignore gravity so it can move up
        my.sprite.enemyUpDown3.setVelocityY(80);

        this.physics.add.overlap(my.sprite.player, my.sprite.enemyUpDown3, () => {
            this.playerHitSpike(my.sprite.player, null);
        }, null, this);

        // Enable collision handling
        this.physics.add.collider(my.sprite.player, this.groundLayer);
        this.physics.add.collider(my.sprite.enemy, this.groundLayer);

        this.physics.add.overlap(my.sprite.player, my.sprite.enemy, () => {
            this.playerHitSpike(my.sprite.player, null);
        }, null, this);

        this.physics.add.collider(
            my.sprite.player,
            this.spikeLayer,
            this.playerHitSpike,
            null,
            this
        );

        this.physics.add.overlap(
            my.sprite.player,
            this.flagGroup,
            this.playerReachedFlag,
            null,
            this
        );

        this.spark = this.add.particles(500, 300, 'kenny-particles', {
            frame: "star_09.png",
            speed: {min: 100, max: 100},
            lifespan: 450,
            scale: {start: 0.1, end: 0},
            blendMode: 'ADD',
            quantity: 1,
            duration: 75,
            emitting: false
        });

        this.coinSound = this.sound.add('coinSound', { volume: 0.4 });
        this.fnaf = this.sound.add('fnaf', { volume: 0.8 });
        this.jump = this.sound.add('jump', { volume: 0.2 });
        this.death = this.sound.add('death', { volume: 0.7 });
        this.fall = this.sound.add('fall', { volume: 0.5 });

        this.music = this.sound.add('song', { volume: 0.8, loop: true });
        this.music.play();


        // TODO: Add coin collision handler
                // Handle collision detection with coins
        this.physics.add.overlap(my.sprite.player, this.coinGroup, (obj1, obj2) => {
            obj2.destroy(); // remove coin on overlap
            this.score += 1;

            this.spark.setPosition(obj2.x, obj2.y);
            this.spark.explode(10);

            this.coinSound.play();


        });

        // set up Phaser-provided cursor key input
        cursors = this.input.keyboard.createCursorKeys();

        this.rKey = this.input.keyboard.addKey('R');

        // debug key listener (assigned to D key)
        this.input.keyboard.on('keydown-D', () => {
            this.physics.world.drawDebug = this.physics.world.drawDebug ? false : true
            this.physics.world.debugGraphic.clear()
        }, this);

        my.vfx.walking = this.add.particles(0, 0, "kenny-particles", {
            frame: ['smoke_03.png', 'smoke_09.png'],
            // TODO: Try: add random: true
            scale: {start: 0.03, end: 0.1},
            // TODO: Try: maxAliveParticles: 8,
            lifespan: 350,
            // TODO: Try: gravityY: -400,
            alpha: {start: 1, end: 0.1}, 
        });

        my.vfx.walking.stop();
        

        this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
        this.cameras.main.startFollow(my.sprite.player, true, 0.25, 0.25); // (target, [,roundPixels][,lerpX][,lerpY])
        this.cameras.main.setDeadzone(100, 100);
        this.cameras.main.setZoom(this.SCALE);
        this.cameras.main.followOffset.set(-200, 0);
        
        my.sprite.player.setMaxVelocity(300, 1000);



    }

    update() {
        const speed = 70; // adjust as needed
        if (my.sprite.enemy.x < my.sprite.player.x) {
            my.sprite.enemy.setVelocityX(speed);
            my.sprite.enemy.setFlipX(true); // facing right
        } else {
            my.sprite.enemy.setVelocityX(-speed);
            my.sprite.enemy.setFlipX(false); // facing left
        }
        const upSpeed = 120;
        const downSpeed = -80;
        const topLimit = 70;    
        const bottomLimit = 170; 

        if (my.sprite.enemyUpDown.y <= topLimit) {
            my.sprite.enemyUpDown.setVelocityY(upSpeed);
             my.sprite.enemyUpDown.setTexture("platformer_characters", "tile_0012.png");

        } else if (my.sprite.enemyUpDown.y >= bottomLimit) {
            my.sprite.enemyUpDown.setVelocityY(downSpeed);
             my.sprite.enemyUpDown.setTexture("platformer_characters", "tile_0011.png");

        }

        if (my.sprite.enemyUpDown2.y <= topLimit) {
            my.sprite.enemyUpDown2.setVelocityY(upSpeed);
             my.sprite.enemyUpDown2.setTexture("platformer_characters", "tile_0012.png");

        } else if (my.sprite.enemyUpDown2.y >= bottomLimit) {
            my.sprite.enemyUpDown2.setVelocityY(downSpeed);
             my.sprite.enemyUpDown2.setTexture("platformer_characters", "tile_0011.png");

        }

        if (my.sprite.enemyUpDown3.y <= topLimit) {
            my.sprite.enemyUpDown3.setVelocityY(upSpeed);
             my.sprite.enemyUpDown3.setTexture("platformer_characters", "tile_0012.png");

        } else if (my.sprite.enemyUpDown3.y >= bottomLimit) {
            my.sprite.enemyUpDown3.setVelocityY(downSpeed);
             my.sprite.enemyUpDown3.setTexture("platformer_characters", "tile_0011.png");

        }
        if(cursors.left.isDown) {
            my.sprite.player.setAccelerationX(-this.ACCELERATION);
            my.sprite.player.resetFlip();
            my.sprite.player.anims.play('walk', true);
            // TODO: add particle following code here
            my.vfx.walking.startFollow(my.sprite.player, my.sprite.player.displayWidth/2-10, my.sprite.player.displayHeight/2-5, false);

            my.vfx.walking.setParticleSpeed(this.PARTICLE_VELOCITY, 0);

            // Only play smoke effect if touching the ground

            if (my.sprite.player.body.blocked.down) {

                my.vfx.walking.start();

            }

        } else if(cursors.right.isDown) {
            my.sprite.player.setAccelerationX(this.ACCELERATION);
            my.sprite.player.setFlip(true, false);
            my.sprite.player.anims.play('walk', true);
            // TODO: add particle following code here
            my.vfx.walking.startFollow(my.sprite.player, my.sprite.player.displayWidth/2-10, my.sprite.player.displayHeight/2-5, false);

            my.vfx.walking.setParticleSpeed(this.PARTICLE_VELOCITY, 0);

            // Only play smoke effect if touching the ground

            if (my.sprite.player.body.blocked.down) {

                my.vfx.walking.start();

            }
        } else {
            // Set acceleration to 0 and have DRAG take over
            my.sprite.player.setAccelerationX(0);
            my.sprite.player.setDragX(this.DRAG);
            my.sprite.player.anims.play('idle');
            // TODO: have the vfx stop playing
            my.vfx.walking.stop();
        }

        // player jump
        // note that we need body.blocked rather than body.touching b/c the former applies to tilemap tiles and the latter to the "ground"
        if(!my.sprite.player.body.blocked.down) {
            my.sprite.player.anims.play('jump');
        }
        if(my.sprite.player.body.blocked.down && Phaser.Input.Keyboard.JustDown(cursors.up)) {
            my.sprite.player.body.setVelocityY(this.JUMP_VELOCITY);
            this.jump.play();
        
        }

        if(Phaser.Input.Keyboard.JustDown(this.rKey)) {
            this.scene.restart();
        }
    }

    playerReachedFlag(player, flag) {

        this.physics.pause();

        player.setAcceleration(0);
        player.setVelocity(0, 0);

        this.fnaf.play();


        this.add.text(
            this.cameras.main.worldView.x + 220,
            this.cameras.main.worldView.y + 30,
            "YOU WIN!",
            {
                fontSize: '32px',
                color: '#16c806'
            }
        );

        this.add.text(
            this.cameras.main.worldView.x + 220,
            this.cameras.main.worldView.y + 80,
            "Coins Collected: " + this.score,
            {
                fontSize: '24px',
                color: '#e9e9e9'
            }
        );

        this.add.text(
            this.cameras.main.worldView.x + 220,
            this.cameras.main.worldView.y + 110,
            "Made by Ethan Kwak",
            {
                fontSize: '24px',
                color: '#e9e9e9'
            }
        );
        this.add.text(
            this.cameras.main.worldView.x + 220,
            this.cameras.main.worldView.y + 160,
            "Music from http://youtube.com/watch?v=p8moocGzQJ4",
            {
                fontSize: '24px',
                color: '#e9e9e9'
            }
        );
    }

    playerHitSpike(player, spike) {
        if (this.isDead) return; // prevent multiple triggers
        this.isDead = true;

        this.physics.pause();
        this.death.play();
        this.music.stop();

        player.setTint(0xff0000);

        this.time.delayedCall(1500, () => {
            this.scene.restart();
        });
    }
}