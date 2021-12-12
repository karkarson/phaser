// JavaScript Document
let game;
let gameOptions = {
	timeLimit: 60
};
// let rbc;
window.onload = function () {
	// 게임설정
	window.introScene = new IntroScene();
	window.gameScene = new GameScene();

	let gameConfig = {
		type: Phaser.CANVAS,
		scale: {
			mode: Phaser.Scale.Fit,
			autoCenter: Phaser.Scale.CENTER_BOTH,
			parent: "thegame",
			width: 640,
			height: 960
			//갤럭시 일반비율 540*960
		},
		scene: [
			introScene,
			gameScene
		]
	}


	// 컨피그를 토대로 새로운 게임을 생성.
	window.game = game = new Phaser.Game(gameConfig);
	setTimeout(window.prepareGame, 1000, true);
	window.focus();
}

//프리로딩 및 타이틀 출력, 씬 시
class IntroScene extends Phaser.Scene {
	constructor() {
		super("intro");
		
	}

	preload() {
		//버튼 및 사운드, 비트맵 폰트 등의 공용요소
		this.load.image('start_on', '../../commons/assets/btn_start_on.png');
		this.load.image('start_off', '../../commons/assets/btn_start_off.png');
		this.load.image('ready_on', '../../commons/assets/btn_ready_on.png');
		this.load.image('ready_off', '../../commons/assets/btn_ready_off.png');
		this.load.image('btn_help', '../../commons/assets/btn_help.png');
		this.load.image('ready_msg', '../../commons/assets/ready.png');
		this.load.image('go_msg', '../../commons/assets/go.png');
		this.load.audio('ready', '../../commons/assets/ready.mp3');
		this.load.audio('go', '../../commons/assets/go.mp3');
		this.load.audio('timeup', '../../commons/assets/timeup.mp3');
		this.load.bitmapFont("font", "../../commons/assets/font.png", "../../commons/assets/font.fnt");

		//게임별 요소
		this.load.image('help', 'assets/help.png');
		this.load.image('splash', 'assets/splash.png');
		this.load.spritesheet("enemy1", "assets/mole1.png", {
			frameWidth: 360,
			frameHeight: 360
		});
		this.load.spritesheet("enemy2", "assets/mole2.png", {
			frameWidth: 360,
			frameHeight: 360
		});
		this.load.spritesheet("enemy3", "assets/mole3.png", {
			frameWidth: 360,
			frameHeight: 360
		});
		this.load.spritesheet("hit", "assets/hit.png", {
			frameWidth: 360,
			frameHeight: 360
		});
		this.load.spritesheet("boom", "assets/boom.png", {
			frameWidth: 360,
			frameHeight: 360
		});
		this.load.image("hole", "assets/hole.png");
		this.load.image("stage", "assets/stage.png");
		this.load.image("p_icon", "assets/point_icon.png");
		this.load.audio('bg01', 'assets/bg01.mp3');
		this.load.audio('hit', 'assets/hit.mp3');
		this.load.audio('boom', 'assets/boom.mp3');
		this.load.bitmapFont("font", "assets/font.png", "assets/font.fnt");

		//프로그레스바 생성
		var progressBar = this.add.graphics();
		var progressBox = this.add.graphics();
		progressBox.fillStyle(0x222222, 0.8);
		progressBox.fillRect(160, 450, 320, 50);
		//progressBox.setOrigin(0.5, 0.5);
		//로딩텍스트 출력
		var width = this.cameras.main.width;
		var height = this.cameras.main.height;
		var loadingText = this.make.text({
			x: width / 2,
			y: height / 2 - 50,
			text: 'Loading...',
			style: {
				font: '20px monospace',
				fill: '#ffffff'
			}
		});
		loadingText.setOrigin(0.5, 0.5);
		//퍼센트 텍스트 출력
		var percentText = this.make.text({
			x: width / 2,
			y: height / 2 - 5,
			text: '0%',
			style: {
				font: '18px monospace',
				fill: '#ffffff'
			}
		});
		percentText.setOrigin(0.5, 0.5);
		//에셋 텍스트 출력
		var assetText = this.make.text({
			x: width / 2,
			y: height / 2 + 50,
			text: '',
			style: {
				font: '18px monospace',
				fill: '#ffffff'
			}
		});
		assetText.setOrigin(0.5, 0.5);

		this.load.on('progress', function (value) {
			//console.log(value);
			percentText.setText(parseInt(value * 100) + '%');
			progressBar.clear();
			progressBar.fillStyle(0xffffff, 1);
			progressBar.fillRect(170, 460, 300 * value, 30);
		});

		this.load.on('fileprogress', function (file) {
			//console.log(file.src);
			assetText.setText('Loading asset: ' + file.src);
		});

		this.load.on('complete', function () { //로드가 완료되면 프로그레스 삭제
			console.log('로딩완료');
			progressBar.destroy();
			progressBox.destroy();
			loadingText.destroy();
			percentText.destroy();
			assetText.destroy();
			sendPostMessage('app.game.loaded');
		});

	}
	//게임 재시작을 위해 배경음 분리
	bgm() {
		console.log('play sound');
		//BGM시작
		var bgm = this.sound.add('bg01', {
			volume: 0.5,
			loop: true
		});
		bgm.play();
	}
	//게임 시작시 호출 마스터 및 재시작 상태 판단.
	start(master, restart) {
		this.scene.start("game", { restart: restart });
	}
	create() {
		//도움말 관련 버튼 및 이미지
		this.help = this.add.image(game.config.width / 2, game.config.height / 2, 'help');
		this.help.depth = 10;
		this.help.visible = false;

		//window.scene = this;
		this.title = this.add.image(game.config.width / 2, game.config.height / 2, 'splash');
		this.title.displayWidth = game.config.width;
		this.title.displayHeight = game.config.height;
		this.title.depth = 1;
		//도움말
		var helpTxt = this.add.bitmapText(game.config.width / 2, 640, "font", '북금곰 배니를 잡아주세요!\n분홍기린 그라는 때리면 안 돼요.', 30).setOrigin(0.5);
		helpTxt.depth = 2;
		helpTxt.align = 1;
		this.bgm();

	}
	helpToggle() {
		//console.log('토글',this.help.visible);
		//this.help.visible = false || !this.help.visible;
		//console.log('타입', btnPlay.input.enabled);
		if (this.help.visible == false) {
			this.help.visible = true;
			btnPlay.disableInteractive();

			console.log(btnPlay.input.enabled);
		} else if (this.help.visible == true) {
			this.help.visible = false;
			btnPlay.setInteractive();
			console.log(btnPlay.input.enabled);
		}

	}


}
class GameScene extends Phaser.Scene {
	constructor() {
		super("game");
		this.mole = null;
		this.score = 0;
		this.enemy = null;
		this.moleLimit = 15;
		// List of enemies.
		this.enemies = [];
		// 두더지위치.
		this.enemyLocations = [
			[130, 0],
			[310, 0],
			[500, 0],
			[130, 170],
			[310, 170],
			[500, 170],
			[130, 340],
			[310, 340],
			[500, 340]
		];

		// Currently visible enemy.
		this.currentEnemy = -1;
		// Initial enemy on screen time.
		this.enemyDelayStart = 800;
		// 시간이 지날수록 리젠 속도 빨라짐. 기본값 1.
		this.enemyDelayFactor = 1;
		// Calculated on screen time.
		this.enemyDelay = 0;
		// Min delay.
		this.enemyDelayMin = 100;
		// Is enemy killed?
		this.enemyKilled = true;
		//this.emitter = {};
		this.counter = 0;

	}
	Msg() {
		//레디고 출력
		var ready;
		var go;
		setTimeout(() => {
			ready = this.add.image(game.config.width / 2, game.config.height / 2, 'ready_msg');
			var sound_ready = this.sound.add('ready');
			sound_ready.play();

		}, 0);
		setTimeout(() => {
			ready.destroy();
			go = this.add.image(game.config.width / 2, game.config.height / 2, 'go_msg');
			var sound_go = this.sound.add('go');
			sound_go.play();
		}, 1600);
		setTimeout(() => {
			go.destroy();
		}, 2000);
	}
	create(options) {
		this.score = 0;
		this.moleLimit = 15;
		//window.scene = this;
		//게임생성
		this.enemies = [];
		this.timer = 0;
		this.timerEvent = null;
		this.addStage();
		this.Msg();
		//포인트 아이콘 출력
		this.point_icon = this.add.image(560, 51, 'p_icon');
		this.point_icon.displayWidth = 42;
		this.point_icon.displayHeight = 38;
		this.timeText = this.add.bitmapText(60, 30, "font", `${gameOptions.timeLimit.toString()}:00`, 48); //시간출력, 52는 폰트사이즈
		this.scoreText = this.add.bitmapText(520, 78, "font", this.score, 48).setOrigin(1).setRightAlign(); //스코어출력, 52는 폰트사이즈
		this.limitBText = this.add.bitmapText(460, 48, "font", '남은 마릿수', 16).setOrigin(1).setLeftAlign(); //남은 두더지수로 대체
		this.limitText = this.add.bitmapText(460, 74, "font", this.moleLimit + '마리', 22).setOrigin(1).setLeftAlign(); //남은 두더지수로 대체
		this.gameDone = false;
		//this.world.displayHeight = game.config.Height;
		//두더지생성.

		setTimeout(this.startGame.bind(this), 2000);
		options.restart && introScene.bgm();
		for (var i = 0; i < this.enemyLocations.length; i++) {
			var hole = this.add.image(game.config.width / 2, game.config.height / 2, 'hole');
			hole.displayWidth = 180;
			hole.displayHeight = 180;
			hole.x = hole.originalX = this.enemyLocations[i][0];
			hole.y = hole.originalY = this.enemyLocations[i][1];
			hole.y = hole.originalY + hole.height;
		}

	}

	createEnemies() {
		this.enemies = [];
		for (var i = 0; i < this.enemyLocations.length; i++) {
			var mole = 'enemy' + Phaser.Math.Between(1, 3);
			var enemy = this.add.sprite(game.config.width / 2, game.config.height / 2, mole);
			enemy.on('pointerdown', this.clickHandler, this);
			enemy.index = i;
			enemy.displayWidth = 180;
			enemy.displayHeight = 180;
			//enemy.enemyId = i;
			//클릭요소 생성
			//enemy.setInteractive();
			//((n) => this.enemy.on('pointerdown', () => this.clickHandler(n), this))(i);
			//enemy.on('pointerdown', this.clickHandler.bind(this), enemy);
			//enemy.inputEnabled = true;
			//enemy.events.onInputDown.add(clickTarget, enemy);
			enemy.x = enemy.originalX = this.enemyLocations[i][0];
			enemy.y = enemy.originalY = this.enemyLocations[i][1];


			//두더지 안보이게 이동. 마스크 적용해야하므로 당장 적용 불가
			enemy.y = enemy.originalY + enemy.height;
			this.enemies.push(enemy);
		}
	}
	//밀리세컨드 테스트
	startGame() { //게임시작
		this.createEnemies();
		this.enemyDelay = this.enemyDelayStart;
		this.time.addEvent({
			delay: this.enemyDelay,
			callback: this.showEnemy,
			callbackScope: this
		});

		window.setTime(gameOptions.timeLimit);
		// this.addTimer();

	}
	clickHandler(e) {

		//클릭시 이펙트 출력
		var boomani = this.add.sprite(game.config.width / 2, game.config.height / 2, 'boom');
		boomani.displayWidth = 180;
		boomani.displayHeight = 180;
		boomani.setBlendMode(Phaser.BlendModes.ADD);
		boomani.x = this.enemy.x;
		boomani.y = this.enemy.y;
		this.anims.create({
			key: 'moleboom',
			frames: this.anims.generateFrameNumbers('boom', {
				frames: [8, 0, 1, 2, 3, 4, 5, 6, 7, 8]
			}),
			yoyo: false,
			frameRate: 20, //재생속도 기본 30
			hideOnComplete: true
		});
		var hitani = this.add.sprite(game.config.width / 2, game.config.height / 2, 'hit');
		hitani.displayWidth = 180;
		hitani.displayHeight = 180;
		hitani.setBlendMode(Phaser.BlendModes.ADD);
		hitani.x = this.enemy.x;
		hitani.y = this.enemy.y;
		this.anims.create({
			key: 'molehit',
			frames: this.anims.generateFrameNumbers('hit', {
				frames: [8, 0, 1, 2, 3, 4, 5, 6, 7, 8]
			}),
			yoyo: false,
			frameRate: 24, //재생속도 기본 30
			hideOnComplete: true
		});
		if (!this.enemyKilled) {
			if (this.mole == 'enemy1') {
				this.enemyKilled = true;
				this.score += 1;
				this.scoreText.text = (this.score).toString();
				//this.enemy.setTint(0xff0000);
				var sound_hit = this.sound.add('hit');
				sound_hit.play();
				hitani.anims.play('molehit');
				window.gameScore({score : this.score, time : this.timeText.text});
				//this.enemyDelay -= 15;//득점할수록 리젠속도 빨라짐
				this.moleLimit--;
				this.limitText.text = (this.moleLimit + '마리').toString();
			} else if (this.mole == 'enemy2') {
				this.enemyKilled = true;
				this.score += 1;
				this.scoreText.text = (this.score).toString();
				//this.enemy.setTint(0xff0000);
				var sound_hit = this.sound.add('hit');
				sound_hit.play();
				hitani.anims.play('molehit');
				window.gameScore({score : this.score, time : this.timeText.text});
				//this.enemyDelay -= 15;
				this.moleLimit--;
				this.limitText.text = (this.moleLimit + '마리').toString();
			} else if (this.mole == 'enemy3') {
				this.enemyKilled = true;
				this.score -= 1;
				this.scoreText.text = (this.score).toString();
				//this.enemy.setTint(0xff0000);
				var sound_boom = this.sound.add('boom');
				sound_boom.play();
				boomani.anims.play('moleboom');
				this.cameras.main.shake(300);
				window.gameScore({score : this.score, time: this.timeText.text});
				//this.enemyDelay += 40;//실점할수록 리젠속도 느려짐
				this.moleLimit--;
				this.limitText.text = (this.moleLimit + '마리').toString();
			}
		}


	}
	hideEnemy() { //두더지 숨기기
		//if (gameOptions.timeLimit.toString() > this.timer) {
		//if (this.timescore > 0) {
		if (this.moleLimit > 0) {
			this.time.addEvent({
				delay: this.enemyDelay,
				callback: this.showEnemy,
				callbackScope: this
			});
			console.log('딜레이', this.enemyDelay);
			//this.enemy.anims.play('enemy1');
			this.enemies[this.currentEnemy].anims.remove(this.mole);
			console.log('남은두더지', this.moleLimit);
			//} else if(this.moleLimit <= 0) {	
			//	this.enemies[this.currentEnemy].anims.remove(this.mole);
			//		this.gameOver();
		} else if (this.timescore > 0) {
			console.log("게임오버");
			this.enemies[this.currentEnemy].anims.remove(this.mole);
			this.gameOver();
		} else {
			console.log("게임오버");
			this.enemies[this.currentEnemy].anims.remove(this.mole);
			this.gameOver();
		}
	}
	showEnemy() { //두더지 보이기
		this.currentEnemy = Math.floor(Math.random() * this.enemies.length);
		this.enemy = this.enemies[this.currentEnemy];
		this.mole = 'enemy' + Phaser.Math.Between(1, 3);
		this.enemy.setTexture(this.mole, 0);

		//애니메이션 생성.
		var frameName = this.anims.generateFrameNumbers(this.mole, {
			start: 0,
			end: 15
		});
		this.anims.create({
			key: this.mole,
			frames: frameName,
			yoyo: true,
			//frameRate: 40, //재생속도 기본 30
			frameRate: this.enemyDelay / 20, //딜레이계산해서 애니속도 조정
			repeat: -1
		});

		this.time.addEvent({
			delay: this.enemyDelay,
			callback: this.hideEnemy,
			callbackScope: this
		});
		if (this.enemyDelay > this.enemyDelayMin) {
			this.enemyDelay *= this.enemyDelayFactor;
		};
		this.enemy.anims.play(this.mole);
		this.enemy.once('animationcomplete', function () {
			this.enemyKilled = true;
			this.enemy.disableInteractive();
		}, this)
		if (this.enemy.anims.isPlaying) {
			this.enemyKilled = false;
			this.enemy.setInteractive();
		}

	}
	addStage() { //배경생성
		this.world = this.add.image(0, 0, "stage");
		this.world.displayWidth = game.config.width;
		this.world.setOrigin(0, 0);
	}

	gameTime(format, time) {
		this.timeText.text = format;
		if (time === 0) {
			this.gameOver();
		}
	}
	gameOver() {
		//this.timeText.text = format;
		if (!this.gameDone) {
			this.timescore = this.changeFormatTime(this.timeText.text);
			this.endScore = this.score * 100 + this.timescore;
			console.log(this.score * 100, '+', this.timescore, "=", this.endScore);
			var sound_timeup = this.sound.add('timeup');
			sound_timeup.play();
			window.endGame(this.endScore, this.timeText.text);
			this.soundEvent = this.time.delayedCall(1000, this.allStopSound, [], this);
			this.gameDone = true;
		}
		
	}

	changeFormatTime(timeFormat) {
		console.log(timeFormat)
		if (timeFormat !== 0) {
			return Math.round(parseInt(timeFormat.replace(":", "")) * 0.1);
		} else {
			return 0;
		}
	}

	allStopSound() {
		this.sound.stopAll();
		//종료 대기 메시지		
		var helpTxt = this.add.bitmapText(game.config.width / 2, game.config.height / 2, "font", '다른 유저가 플레이 중\n잠시만 기다려 주세요!', 30).setOrigin(0.5);
		helpTxt.depth = 2;
		helpTxt.align = 1;
	}
	update() {
	}
	render() {
	}
}
