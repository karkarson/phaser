// the game itself
var game;

// global game options
var gameOptions = {
	
	// target rotation speed, in degrees per frame
    rotationSpeed: 3,

    // knife throwing duration, in milliseconds
    throwSpeed: 150,

    // minimum angle between two knives
	minAngle: 15, 
	timeLimit : 30,
}

// once the window loads...
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
		scene: [
			introScene,
			gameScene
		]
	}

	// 컨피그를 토대로 새로운 게임을 생성.
	game = new Phaser.Game(gameConfig);
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

		//게임별요소
		this.load.image('splash', 'assets/splash.png');
		this.load.image('help', 'assets/help.png');
		this.load.image("p_icon", "assets/point_icon.png");
		this.load.spritesheet("knife1", "assets/knife.png", {
			frameWidth: 71,
        	frameHeight: 240
		});
		//이벤트 소드 3점
		this.load.spritesheet("knife2", "assets/x_knife.png", {
           frameWidth: 71,
           frameHeight: 240
        });
		
		this.load.image("target", "assets/target.png");
		this.load.image("stage", "assets/stage.png");
		this.load.audio('bg01', 'assets/bg01.mp3');
		this.load.audio('legalHit', 'assets/legal_hit.mp3');
		this.load.audio('noHit', 'assets/no_hit.mp3');
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
		percentText.depth = 3;
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
			progressBar.depth = 3;
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

    create(){
		//도움말 관련 버튼 및 이미지
		this.help = this.add.image(game.config.width / 2, game.config.height / 2, 'help');
		this.help.depth = 10;
		this.help.visible = false;
		
        this.title = this.add.image(game.config.width / 2, game.config.height / 2, 'splash');
        this.title.displayWidth = game.config.width;
        this.title.displayHeight = game.config.height;
        this.title.depth = 2;
		//도움말		
		var helpTxt = this.add.bitmapText(game.config.width / 2, 640, "font", '던져서 꽂아라!\n통나무에 많이 꽂으면 윈!', 30).setOrigin(0.5);
            helpTxt.depth = 2;
			helpTxt.align = 1;
		//배경음 호출
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
			this.score = 0;
			this.sword = null;
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
				this.canThrow = true;
			}, 2000);
			
		}
		create(options){
			this.score = 0;
			this.addstage();
			this.Msg();
			// group to store all rotating knives
			this.knifeGroup = this.add.group();
			// adding the target
			this.target = this.add.sprite(game.config.width / 2, 250, "target");
			this.target.displayWidth = 320;
			this.target.displayHeight = 320;
			this.timeText = this.add.bitmapText(60, 30, "font", `${gameOptions.timeLimit.toString()}:00`, 48);
			
			
			// moving the target on front
			this.target.depth = 1;
			
			// waiting for player input to throw a knife
			this.input.on("pointerdown", this.throwKnife, this);
			
			//point icon
			this.point_icon = this.add.image(560, 52, 'p_icon');
			this.point_icon.displayWidth = 42;
			this.point_icon.displayHeight = 38;
			// score counting
			this.scoreText = this.add.bitmapText(530, 82, "font", this.score, 52).setOrigin(1).setRightAlign(); 
			this.addKnife();
			this.knife = this.add.sprite(game.config.width / 2, game.config.height / 5 * 4, this.sword).play(this.sword);
			this.knife.displayWidth = 30;
			this.knife.displayHeight = 105;
			this.gameDone = false;
			setTimeout(this.startGame.bind(this), 2000);
			// 재시작 여부 판단하여 배경음 플레이
			options.restart && introScene.bgm();
		}

		startGame() {
			window.setTime(gameOptions.timeLimit);
		}

		// method to throw a knife
		addKnife(){
			this.sword = 'knife1'// + Phaser.Math.Between(1);
			var frameName = this.anims.generateFrameNumbers(this.sword);
			this.anims.create({
				key: this.sword,
				frames: frameName,
				frameRate: 16, //재생속도 기본 30
				repeat: -1
			});
			console.log('만들어진칼',this.sword);
		}
		throwKnife(){
			
			// can the player throw?
			if(this.canThrow){
				// player can't throw anymore
				this.canThrow = false;
	
				// tween to throw the knife
				this.tweens.add({
	
					// adding the knife to tween targets
					targets: [this.knife],
	
					// y destination
					y: this.target.y + this.target.width / 2,
	
					// tween duration
					duration: gameOptions.throwSpeed,
	
					// callback scope
					callbackScope: this,
	
					// function to be executed once the tween has been completed
					onComplete: function(tween){
						
						// score
						this.score += 1;
						this.scoreText.text = (this.score).toString();
						//게임상태 전달
						window.gameScore({score : this.score, time : this.timeText.text});
						console.log(`this.score ${this.score}- ${this.timeText.text}`);
						var sound_lhit = this.sound.add('legalHit');
						sound_lhit.play();
						// at the moment, this is a legal hit
						var legalHit = true;
	
						// getting an array with all rotating knives
						var children = this.knifeGroup.getChildren();
						
						// looping through rotating knives
						for (var i = 0; i < children.length; i++){
							// is the knife too close to the i-th knife?
							if(Math.abs(Phaser.Math.Angle.ShortestBetween(this.target.angle, children[i].impactAngle)) < gameOptions.minAngle){
								// this is not a legal hit
								legalHit = false;
								// no need to continue with the loop
								break;
								
							}
						}
	
						// is this a legal hit?
						if(legalHit){
							// player can now throw again
							this.canThrow = true;
							// adding the rotating knife in the same place of the knife just landed on target
							
							this.addKnife();
							console.log('박힌칼',this.sword);
							var knife = this.add.sprite(this.knife.x, this.knife.y, this.sword).play(this.sword);
							knife.displayWidth = 30;
							knife.displayHeight = 105;
							// impactAngle property saves the target angle when the knife hits the target
							knife.impactAngle = this.target.angle;
	
							// adding the rotating knife to knifeGroup group
							this.knifeGroup.add(knife);
	
							// bringing back the knife to its starting position
							this.knife.y = game.config.height / 5 * 4;
							
						}
							
						// in case this is not a legal hit
						else{
							
							//마지막 던지고 명중 안되면 카운터에서 -1
							this.score -= 1;
							this.scoreText.text = (this.score).toString();
							var sound_nhit = this.sound.add('noHit');
								sound_nhit.play();
								this.cameras.main.shake(300);
							console.log("EndGame");
							
							// tween to throw the knife
							this.tweens.add({
	
								// adding the knife to tween targets
								targets: [this.knife],
								
								// y destination
								y: game.config.height + this.knife.height,
	
								// rotation destination, in radians
								rotation: 5,
	
								// tween duration
								duration: gameOptions.throwSpeed * 4,
	
								// callback scope
								callbackScope: this,
								
								// function to be executed once the tween has been completed
								onComplete: function(tween){
								// end game
								//this.scene.end("EndGame");
								this.gameOver();
								this.soundEvent = this.time.delayedCall(1000, this.allStopSound, [], this);
								}
							});
						}
					}
				});
			}
		}
		gameOver() {
			if(!this.gameDone){
				var sound_timeup = this.sound.add('timeup');
				sound_timeup.play();
				console.log("게임오버");
				this.timescore = this.changeFormatTime(this.timeText.text);
				this.endScore = this.score*100 + this.timescore;
				console.log(this.score, '+', this.timescore, "=", this.endScore);
				window.endGame(this.endScore, this.timeText.text);
				//console.log(this.score);
				//종료 대기 메시지		
				var helpTxt = this.add.bitmapText(game.config.width / 2, game.config.height / 2, "font", '다른 유저가 플레이 중\n잠시만 기다려 주세요!', 30).setOrigin(0.5);
				helpTxt.depth = 2;
				helpTxt.align = 1;
				this.soundEvent = this.time.delayedCall(1000, this.allStopSound, [], this);
				this.gameDone = true;
			}
		}

		changeFormatTime(timeFormat) {
			if (timeFormat !== 0) {
				return Math.round(parseInt(timeFormat.replace(":", ""))*0.1);
			} else {
				return 0;
			}
		}

		gameTime(format, time) {
			this.timeText.text = format;
			if (time === 0) {
				this.gameOver();
			}
		}

		allStopSound(){
			this.sound.stopAll();
		}
		addstage() { //배경생성
			this.stage = this.add.sprite(0, 0, "stage");
			this.stage.displayWidth = game.config.width;
			this.stage.setOrigin(0, 0);
		}
		// method to be executed at each frame
		update(){

			// rotating the target
			this.target.angle += gameOptions.rotationSpeed;
	
			// getting an array with all rotating knives
			var children = this.knifeGroup.getChildren();
	
			// looping through rotating knives
			for (var i = 0; i < children.length; i++){
	
				// rotating the knife
				children[i].angle += gameOptions.rotationSpeed;
	
				// turning knife angle in radians
				var radians = Phaser.Math.DegToRad(children[i].angle + 90);
	
				// trigonometry to make the knife rotate around target center
				children[i].x = this.target.x + (this.target.width / 2) * Math.cos(radians);
				children[i].y = this.target.y + (this.target.width / 2) * Math.sin(radians);
			}
	
		}
	}