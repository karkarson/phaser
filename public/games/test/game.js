const DEFAULT_WIDTH = 640
const DEFAULT_HEIGHT = 960
const MAX_WIDTH = 1290
const MAX_HEIGHT = 1920
let SCALE_MODE = 'SMOOTH' // FIT OR SMOOTH

class Player extends Phaser.Physics.Arcade.Sprite {
	constructor(scene, x, y) {
		super(scene, x, y, 'dude')

		scene.add.existing(this)
		scene.physics.add.existing(this)

		this.setCollideWorldBounds(true)

		scene.anims.create({
			key: 'left',
			frames: scene.anims.generateFrameNumbers('dude', { start: 0, end: 3 }),
			frameRate: 10,
			repeat: -1
		})

		scene.anims.create({
			key: 'turn',
			frames: [{ key: 'dude', frame: 4 }],
			frameRate: 20
		})

		scene.anims.create({
			key: 'right',
			frames: scene.anims.generateFrameNumbers('dude', { start: 5, end: 8 }),
			frameRate: 10,
			repeat: -1
		})
	}

	update(cursors) {
		if (cursors.left.isDown) {
			this.setVelocityX(-160 * 2)

			this.anims.play('left', true)
		} else if (cursors.right.isDown) {
			this.setVelocityX(160 * 2)

			this.anims.play('right', true)
		} else {
			this.setVelocityX(0)

			this.anims.play('turn')
		}

		if (cursors.up.isDown && this.body.touching.down) {
			this.setVelocityY(-330 * 1.5)
		}
	}
}


class PreloadScene extends Phaser.Scene {
	constructor() {
		super({ key: 'PreloadScene' })
	}

	preload() {
		this.load.crossOrigin = 'anonymous'
		//this.load.baseURL = 'assets/img/'
		this.load.baseURL = 'https://labs.phaser.io/src/games/firstgame/assets/'
		this.load.image('sky', 'sky.png')
		this.load.image('ground', 'platform.png')
		this.load.image('star', 'star.png')
		this.load.image('bomb', 'bomb.png')
		this.load.spritesheet('dude', 'dude.png', { frameWidth: 32, frameHeight: 48 })
	}

	create() {
		this.scene.start('MainScene')
	}
}

class MainScene extends Phaser.Scene {
	fpsText
	cursors
	player

	constructor() {
		super({ key: 'MainScene' })
	}

	create() {
		const world = {
			width: 1290, // the width of 2 ground platforms
			height: 1920 // the hight of the game
		}

		// the width and height of the world map
		this.cameras.main.setBounds(0, 0, world.width, world.height)
		this.physics.world.setBounds(0, 0, world.width, world.height)

		// draw safe area
		let safeArea = this.add
			.rectangle(
				this.cameras.main.width / 2 - +this.game.config.width / 2,
				this.cameras.main.height - +this.game.config.height,
				+this.game.config.width,
				+this.game.config.height,
				0xff00ff,
				0.08
			)
			.setStrokeStyle(4, 0xff00ff, 0.25)
			.setOrigin(0)
			.setDepth(2)
			.setScrollFactor(0)

		// draw the sky
		let sky = this.add
			.tileSprite(0, 0, this.cameras.main.width, this.cameras.main.height, 'sky')
			.setOrigin(0)
			// take the full height
			.setScale(Math.max(this.cameras.main.height / 600, 1))
			.setScrollFactor(0)

		// add all platforms
		let platforms = this.physics.add.staticGroup()
		platforms
			.create(400, 800, 'ground')
			.setScale(2)
			.refreshBody()
			.setOrigin(0.5, 1)
		platforms
			.create(1200, 800, 'ground')
			.setScale(2)
			.refreshBody()
			.setOrigin(0.5, 1)
		platforms.create(600, 632, 'ground')
		platforms.create(50, 482, 'ground')
		platforms.create(750, 453, 'ground')
		platforms.create(1150, 312, 'ground')
		platforms.refresh()

		// add the player
		this.player = new Player(this, 450, 450)

		// add the stars
		let stars = this.physics.add.group({
			key: 'star',
			repeat: 22,
			setXY: { x: 12, y: 0, stepX: 70 }
		})
		stars.children.iterate((child) => {
			child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8))
			child.setInteractive().on('pointerdown', () => {
				console.log('star body', child.body)
				console.log('you hit a star')
			})
		})

		// add the score text
		let score = 0
		// this is fixed to the safeArea
		let scoreTextSafeArea = this.add
			.text(safeArea.x + 16, safeArea.y + 16, 'score: 0', { fontSize: '32px', fill: '#000' })
			.setOrigin(0)
			.setScrollFactor(0)
		// this is fixed to the safeArea
		let scoreText = this.add
			.text(16, 16, 'score: 0', { fontSize: '32px', fill: '#000' })
			.setOrigin(0)
			.setScrollFactor(0)

		// collect a star
		const collectStar = (player, star) => {
			star.disableBody(true, true)
			score += 10
			scoreText.setText('Score: ' + score)
			scoreTextSafeArea.setText('Score: ' + score)
		}

		// add collider and overlap
		this.physics.add.collider(this.player, platforms)
		this.physics.add.collider(stars, platforms)
		this.physics.add.overlap(this.player, stars, collectStar)

		// add cursors
		this.cursors = this.input.keyboard.createCursorKeys()

		// camera should follow the player
		this.cameras.main.startFollow(this.player, true)

		// the resize function
		const resize = () => {
			// update position of safe area
			safeArea.x = this.cameras.main.width / 2 - +this.game.config.width / 2
			safeArea.y = this.cameras.main.height - +this.game.config.height

			// adjust the score text
			scoreTextSafeArea.x = safeArea.x + 16
			scoreTextSafeArea.y = safeArea.y + 16
			scoreText.x = 16
			scoreText.y = 16

			// adjust sky
			sky.width = this.cameras.main.width
			sky.height = this.cameras.main.height
			sky.setScale(Math.max(this.cameras.main.height / 600, 1))
		}

		this.scale.on('resize', (gameSize, baseSize, displaySize, resolution) => {
			console.log('resize "this.scale.on"')
			this.cameras.resize(gameSize.width, gameSize.height)
			resize()
		})
		console.log('resize in scene')
		resize()
	}

	update() {
		this.player.update(this.cursors)
	}
}

const config = {
	backgroundColor: '#ffffff',
	// please check if the parent matched the id in your index.html file
	parent: 'phaser-game',
	scale: {
		// we do scale the game manually in resize()
		mode: Phaser.Scale.NONE,
		width: DEFAULT_WIDTH,
		height: DEFAULT_HEIGHT
	},
	height: DEFAULT_HEIGHT,
	scene: [PreloadScene, MainScene],
	physics: {
		default: 'arcade',
		arcade: {
			debug: true,
			gravity: { y: 600 }
		}
	}
}

window.addEventListener('load', () => {
	const game = new Phaser.Game(config)

	const resize = () => {
		const w = window.innerWidth
		const h = window.innerHeight

		let width = DEFAULT_WIDTH
		let height = DEFAULT_HEIGHT
		let maxWidth = MAX_WIDTH
		let maxHeight = MAX_HEIGHT
		let scaleMode = SCALE_MODE

		let scale = Math.min(w / width, h / height)
		let newWidth = Math.min(w / scale, maxWidth)
		let newHeight = Math.min(h / scale, maxHeight)

		let defaultRatio = DEFAULT_WIDTH / DEFAULT_HEIGHT
		let maxRatioWidth = MAX_WIDTH / DEFAULT_HEIGHT
		let maxRatioHeight = DEFAULT_WIDTH / MAX_HEIGHT

		// smooth scaling
		let smooth = 1
		if (scaleMode === 'SMOOTH') {
			const maxSmoothScale = 1.15
			const normalize = (value, min, max) => {
				return (value - min) / (max - min)
			}
			if (width / height < w / h) {
				smooth =
					-normalize(newWidth / newHeight, defaultRatio, maxRatioWidth) / (1 / (maxSmoothScale - 1)) + maxSmoothScale
			} else {
				smooth =
					-normalize(newWidth / newHeight, defaultRatio, maxRatioHeight) / (1 / (maxSmoothScale - 1)) + maxSmoothScale
			}
		}

		// resize the game
		game.scale.resize(newWidth * smooth, newHeight * smooth)

		// scale the width and height of the css
		game.canvas.style.width = newWidth * scale + 'px'
		game.canvas.style.height = newHeight * scale + 'px'

		// center the game with css margin
		game.canvas.style.marginTop = `${(h - newHeight * scale) / 2}px`
		game.canvas.style.marginLeft = `${(w - newWidth * scale) / 2}px`
	}
	window.addEventListener('resize', event => {
		console.log('resize event')
		resize()
	})
	console.log('resize at start')
	resize()
})
