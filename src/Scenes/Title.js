class Title extends Phaser.Scene {
    constructor() {
        super("titleScene");
    }

    create() {
        // Background color
        this.cameras.main.setBackgroundColor('#1a1a2e');
        
        // Title text
        this.add.text(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2 - 60,
            "Gilbert's Trek",
            {
                fontSize: '48px',
                color: '#16c806',
                fontStyle: 'bold'
            }
        ).setOrigin(0.5);

        // Press to start text
        this.add.text(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2 + 20,
            "Press ENTER to Start",
            {
                fontSize: '24px',
                color: '#e9e9e9'
            }
        ).setOrigin(0.5);

        // Made by text
        this.add.text(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2 + 60,
            "Made by Ethan Kwak",
            {
                fontSize: '16px',
                color: '#aaaaaa'
            }
        ).setOrigin(0.5);

        // Listen for ENTER key
        this.input.keyboard.on('keydown-ENTER', () => {
            this.scene.start('loadScene');  // go to Load first
        });
    }
}