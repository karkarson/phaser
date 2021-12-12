// JavaScript Document
let game;
let gameOptions = {
	rotationTime: 3000
}
// let rbc;
window.onload = function () {
	// 게임설정
	window.introScene = new IntroScene();
	window.gameScene = new GameScene();
	window.waitScene = new WaitScene();

	let gameConfig = {
		type: Phaser.CANVAS,
		scale: {
			mode: Phaser.Scale.FIT,
			autoCenter: Phaser.Scale.CENTER_BOTH,
			parent: "thegame",
			width: 640,
			height: 960
		},
		scene: [
			introScene,
			gameScene,
			waitScene
		]
	}


	// 컨피그를 토대로 새로운 게임을 생성.
	game = new Phaser.Game(gameConfig);
	setTimeout(window.prepareGame, 1000, true);
	window.focus();
}


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
		this.load.image("bottle", "assets/pic_bottle.png");
		this.load.image('help', 'assets/help.png');
		this.load.image("stage", "assets/stage.png");
		this.load.audio('bg01', 'assets/bg01.mp3');
		this.load.audio('bottle', 'assets/bottle.mp3');
		this.load.image('splash', 'assets/splash.png');

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
	//게임 시작시 호출 마스터 및 재시작 상태 판단.
	start(master, restart) {
		this.scene.start(master ? "game" : "wait", { restart: restart });
	}
	create() {
		//도움말 관련 버튼 및 이미지
		this.help = this.add.image(game.config.width / 2, game.config.height / 2, 'help');
		this.help.depth = 10;
		this.help.visible = false;

		this.title = this.add.image(game.config.width / 2, game.config.height / 2, 'splash');
		this.title.displayWidth = game.config.width;
		this.title.displayHeight = game.config.height;
		this.title.depth = 1;
		//BGM시작
		var bgm = this.sound.add('bg01', {
			volume: 0.5,
			loop: true
		});
		bgm.play();
		//도움말
		var helpTxt = this.add.bitmapText(game.config.width / 2, 640, "font", '소주병을 돌려 벌칙을 받아라!\n본 게임은 방장만 진행됩니다.', 30).setOrigin(0.5);
		helpTxt.depth = 2;
		helpTxt.align = 1;
	}
	helpToggle(){
		//console.log('토글',this.help.visible);
		//this.help.visible = false || !this.help.visible;
		//console.log('타입', btnPlay.input.enabled);
		if(this.help.visible == false){
			this.help.visible = true;
			btnPlay.disableInteractive();
			
			console.log(btnPlay.input.enabled);
		} else if(this.help.visible == true){
			this.help.visible = false;
			btnPlay.setInteractive();
			console.log(btnPlay.input.enabled);
		}
		
	} 
}
class GameScene extends Phaser.Scene {
	constructor() {
		super("game");
		this.bottle = null;
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
			this.canClick= true;
		}, 2000);
	}
	create() {
		this.canClick =false;
		this.addstage();
		this.Msg();
		
		this.bottle = this.add.image(this.game.canvas.width / 2, this.game.canvas.height / 2, "bottle");
		this.bottle.displayWidth = 480;
		this.bottle.displayHeight = 480;
		//this.bottle.on("pointerdown", this.spinWheel);
		//this.bottle.setInteractive();


		this.input.on('pointerdown', function () {
			if(this.canClick){
				this.rnd_degrees();
			}
		}, this);
	}
	rnd_degrees() {
		var rounds = Phaser.Math.Between(2, 4);
		var degrees = Phaser.Math.Between(0, 360);
		//console.log("r",rounds);
		//console.log("d",degrees);
		var tween = this.tweens.add({
			// adding the wheel to tween targets
			targets: [this.bottle],
			// angle destination
			angle: 360 * rounds + degrees,
			// tween duration
			duration: gameOptions.rotationTime,
			// tween easing
			ease: "Cubic.easeOut",

			// callback scope
			//callbackScope: this,
			paused: true,
			onStart: this.onStartHandler,
			onStartParams: [this.bottle]
		});
		tween.play();
		var sound_bottle = this.sound.add('bottle');
		sound_bottle.play();
	}
	addstage() { //배경생성
		this.stage = this.add.sprite(0, 0, "stage");
		this.stage.displayWidth = game.config.width;
		this.stage.setOrigin(0, 0);
	}

	update() { }
	//디버깅 출력
	render() { }
	//이하 특정게임용 추가 함수
}
class WaitScene extends Phaser.Scene {
	constructor() {
		super("wait");
	}
	addstage() { //배경생성
		this.stage = this.add.sprite(0, 0, "stage");
		this.stage.displayWidth = game.config.width;
		this.stage.setOrigin(0, 0);
	}
	create() {
		this.addstage();
		//안내메시지
		var helpTxt = this.add.bitmapText(game.config.width / 2, game.config.height / 2, "font", '본 게임은 방장만 진행됩니다.\n방장 화면에 집중하세요!.', 30).setOrigin(0.5);
		helpTxt.depth = 2;
		helpTxt.align = 1;
	}
}
