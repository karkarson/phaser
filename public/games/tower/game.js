// JavaScript Document
/*
베타 디버깅 완료 2019-09-26
- 게임기본 구조 완료 (인트로와 게임씬 분리, 브릿지 파일과 연결부 완료)
- 시간 및 스코어 전달부 완료
- 리스타트 관련 제어단 완료
*/
let game;
let gameOptions = {
	timeLimit: 30,//기본값 30초
	gravity: 1.2,
	crateHeight: 700,
	crateRange: [-200, 200],
	crateSpeed: 800
};
window.onload = function () {
	// 게임설정
	window.introScene = new IntroScene();
	window.gameScene = new GameScene();

	let gameConfig = {
		type: Phaser.CANVAS,
		scale: {
			mode: Phaser.Scale.FIT,
			autoCenter: Phaser.Scale.CENTER_BOTH,
			parent: "thegame",
			width: 640,
			height: 960
		},
		//물리엔진 설정
		physics: {
			default: 'matter',
			matter: {
				debug: false,
				gravity: {
					y: gameOptions.gravity
				}
			},
		},
		scene: [
			introScene,
			gameScene
		]
	}


	// 컨피그를 토대로 새로운 게임을 생성.
	game = new Phaser.Game(gameConfig);
	// 브릿지 파일을 통해 게임 상태 체크.
	setTimeout(window.prepareGame, 1000, true);
	window.focus();
}
//프리로딩 및 타이틀 출력 씬 시작
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
		this.load.image('splash', 'assets/splash.png');
		this.load.image('help', 'assets/help.png');
		this.load.spritesheet("bird1", "assets/bap.png", {
			frameWidth: 77,
			frameHeight: 70
		});
		this.load.spritesheet("bird2", "assets/bee.png", {
			frameWidth: 77,
			frameHeight: 70
		});
		this.load.spritesheet("bird3", "assets/boo.png", {
			frameWidth: 77,
			frameHeight: 70
		});
		this.load.image("ground", "assets/ground.png");
		this.load.image("sky", "assets/sky.png");
		this.load.image("p_icon", "assets/point_icon.png");
		this.load.audio('bg01', 'assets/bg01.mp3');
		this.load.audio('die', 'assets/die_bird.mp3');
		this.load.audio('bc1', 'assets/birdcall1.mp3');
		this.load.audio('bc2', 'assets/birdcall2.mp3');
		this.load.audio('bc3', 'assets/birdcall3.mp3');
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
		
		this.title = this.add.image(game.config.width / 2, game.config.height / 2, 'splash');
		this.title.displayWidth = game.config.width;
		this.title.displayHeight = game.config.height;
		this.title.depth = 1;

		
		//도움말
		var helpTxt = this.add.bitmapText(game.config.width / 2, 640, "font", '뱁새 트리오 뱁비부를 섬 위로\n안전하게 착륙시켜주세요.', 30).setOrigin(0.5);
		helpTxt.depth = 2;
		helpTxt.align = 1;
		this.bgm();
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
//게임씬 시작
class GameScene extends Phaser.Scene {
	constructor() {
		super('game');
		this.bird = null;
		this.score = 0;
		this.collCheck = 0;
	}
	newBird() {
		this.bird = 'bird' + Phaser.Math.Between(1, 3);
		var frameName = this.anims.generateFrameNumbers(this.bird);
		this.anims.create({
			key: this.bird,
			frames: frameName,
			frameRate: 60, //재생속도 기본 30
			repeat: -1
		});
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
			this.canDrop = true;
		}, 2000);
	}

	create(options) {
		//게임생성
		this.score = 0;
		this.matter.world.update30Hz();
		this.timer = 0;
		this.timerEvent = null;
		this.addSky();
		this.addGround();
		this.addMovingCrate();
		this.Msg();
		//포인트 아이콘 출력
		this.point_icon = this.add.image(560, 48, 'p_icon');
		this.point_icon.displayWidth = 42;
		this.point_icon.displayHeight = 38;
		this.timeText = this.add.bitmapText(60, 30, "font", `${gameOptions.timeLimit.toString()}:00`, 52); //시간출력, 52는 폰트사이즈
		this.scoreText = this.add.bitmapText(530, 82, "font", this.score, 52).setOrigin(1).setRightAlign(); //스코어출력, 52는 폰트사이즈
		this.crateGroup = this.add.group();
		this.matter.world.on("collisionstart", this.checkCollision, this);
		// this.setCameras();
		this.input.on("pointerdown", this.dropCrate, this); //디버깅이 완료되면 바로 드랍크레이트 호출로 변경할 것!
		// 타이머 호출
		//this.callTimer = this.time.delayedCall(1000, this.addTimer, [], this);

		//this.callTimer = this.time.delayedCall(1000, this.startGame, [], this);
		setTimeout(this.startGame.bind(this), 2000);
		// 재시작 여부 판단하여 배경음 플레이
		options.restart && introScene.bgm();
	}

	startGame(){
		console.log(`tower startGame ${gameOptions.timeLimit}`);
		window.setTime(gameOptions.timeLimit);
	}
	
	gameTime(format, time) {
		this.timeText.text = format;
		if (time === 0) {
			var sound_timeup = this.sound.add('timeup');
			sound_timeup.play();
			window.endGame(this.score, this.timeText.text);
			this.soundEvent = this.time.delayedCall(1000, this.allStopSound, [], this);
		}
	}

	addSky() { //배경생성
		this.sky = this.add.sprite(0, 0, "sky");
		this.sky.displayWidth = game.config.width;
		this.sky.setOrigin(0, 0);
	}

	addGround() { //지형생성
		this.ground = this.matter.add.sprite(game.config.width / 2, game.config.height, "ground");
		this.ground.setBody({
			type: "rectangle",
			width: this.ground.displayWidth,
			height: this.ground.displayHeight * 2
		});
		this.ground.setOrigin(0.5, 1);
		this.ground.setStatic(true);
	}
	addMovingCrate() {
		this.newBird();
		this.movingCrate = this.add.sprite(game.config.width / 2 - gameOptions.crateRange[0], this.ground.getBounds().top - gameOptions.crateHeight, this.bird).play(this.bird);
		this.tweens.add({
			targets: this.movingCrate,
			x: game.config.width / 2 - gameOptions.crateRange[1],
			duration: gameOptions.crateSpeed,
			yoyo: true,
			repeat: -1
		});
	}
	checkCollision(e, b1, b2) { //충돌체크
	
		if (b1.isCrate && !b1.hit) {
			b1.hit = true;
			this.nextCrate();
		}
		if (b2.isCrate && !b2.hit) {
			//새가 스테이지에 충돌했을때
			b2.hit = true;
			this.nextCrate();
		}
		this.collCheck ++;
		// if(!b1.hit && !b2.hit){
		// 	var timeout;
		// 	if(!this.canDrop){
		// 		timeout = setTimeout(function(){
		// 			console.log(this.canDrop);
		// 			if(!this.canDrop){
		// 				this.canDrop = true;
		// 			}
		// 		}.apply(this), 5000);
		// 	} else {
		// 		timeout && clearTimeout(timeout)
		// 	}
		// }
	}
	//    setCameras() {
	//        this.actionCamera = this.cameras.add(0, 0, game.config.width, game.config.height);
	//        this.actionCamera.ignore([this.sky, this.timeText]);
	//        this.cameras.main.ignore([this.ground, this.movingCrate]);
	//    }

	dropCrate() {
		if (this.canDrop && this.timer < gameOptions.timeLimit) {
			this.canDrop = false;
			this.movingCrate.visible = false;
			this.addFallingCrate();
			//드랍시 사운드 출력
			this.rnd_s = Phaser.Math.Between(1, 3);
			var sound_bc = this.sound.add('bc' + this.rnd_s);
			sound_bc.play();
			//드랍시 점수증가
			this.score += 1;
			this.scoreText.text = (this.score).toString();
			//게임상태 전달
			window.gameScore({score : this.score, time : this.timeText.text});
			console.log(this.score, this.timeText.text);
		}
	}
	addTimer() { //타이머생성
		if (this.timerEvent == null) {
			this.timerEvent = this.time.addEvent({
				delay: 1000,
				callback: this.tick,
				callbackScope: this,
				loop: true
			});
		}
	}

	addFallingCrate() {
		let fallingCrate = this.matter.add.sprite(this.movingCrate.x, this.movingCrate.y, this.bird).play(this.bird);
		fallingCrate.body.isCrate = true;
		fallingCrate.body.hit = false; //버드충돌체크
		this.crateGroup.add(fallingCrate); //버드그룹생성
		this.addMovingCrate();
		//this.cameras.main.ignore(fallingCrate)
		
	
	}
	nextCrate() {
		//this.zoomCamera();
		this.canDrop = true;
		this.movingCrate.visible = true;
		this.collCheck = 0;
	}
	//    zoomCamera() { //새 높이에 따라 카메라 제어
	//        let maxHeight = 0;
	//        this.crateGroup.getChildren().forEach(function (crate) {
	//            if (crate.body.hit) {
	//                maxHeight = Math.max(maxHeight, Math.round((this.ground.getBounds().top - crate.getBounds().top) / crate.displayWidth));
	//            }
	//        }, this);
	//        this.movingCrate.y = this.ground.getBounds().top - maxHeight * this.movingCrate.displayWidth - gameOptions.crateHeight;
	//        let zoomFactor = gameOptions.crateHeight / (this.ground.getBounds().top - this.movingCrate.y);
	//        this.actionCamera.zoomTo(zoomFactor, 500);
	//        let newHeight = game.config.height / zoomFactor;
	//        this.actionCamera.pan(game.config.width / 2, game.config.height / 2 - (newHeight - game.config.height) / 2, 500)
	//    }
	tick() { //타임계산
		this.timer++;
		this.timeText.text = (gameOptions.timeLimit - this.timer).toString()
		if (this.timer >= gameOptions.timeLimit) {
			this.timerEvent.remove();
			this.movingCrate.destroy();
			console.log("게임끝");
			var sound_timeup = this.sound.add('timeup');
			sound_timeup.play();
			//종료 대기 메시지		
			var helpTxt = this.add.bitmapText(game.config.width / 2, game.config.height / 2, "font", '다른 유저가 플레이 중\n잠시만 기다려 주세요!', 30).setOrigin(0.5);
			helpTxt.depth = 2;
			helpTxt.align = 1;
			//게임 종료 시 엔드게임 선언 및 스코어와 시간 전달
			window.endGame(this.score, this.timeText.text);
			console.log(this.score, this.timeText.text);
			this.soundEvent = this.time.delayedCall(1000, this.allStopSound, [], this);
			this.regame();
		}
	}
	allStopSound() {
		this.sound.stopAll();
	}
	removeCrate() {
		if (this.crateGroup.getChildren().length > 0) {
			this.crateGroup.getFirstAlive().destroy();
		} else {
			this.removeEvent.remove();
		}
	}
	regame() {
		this.score = 0;
		this.scene.restart();
		//this.addTimer();
	}
	update() {
		this.crateGroup.getChildren().forEach(function (crate) {
			if (crate.y > game.config.height + crate.displayHeight) {
				crate.destroy();
				var sound_die = this.sound.add('die');
				sound_die.play();
				//버드낙사 시 점수 감점
				if(this.timeText.text === '00:00'){
					console.log('게임종료');
				}else{
					this.score -= 1;
					this.scoreText.text = (this.score).toString();
				}
				//게임상태 전달
				window.gameScore({score : this.score, time : this.timeText.text});
				console.log(this.score, this.timeText.text);
			}
		}, this);
		//console.log('충돌체크지연카운트:',this.collCheck);
		if(this.collCheck > 20){
			this.nextCrate();
		}
	}
}
