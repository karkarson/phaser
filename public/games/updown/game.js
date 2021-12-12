let game;
var gameOptions = {
	timeLimit: 10,
	rules: {
		random: 15,
		type: 4
	}
};
// let rbc;
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

		this.load.image("stage", "assets/stage.png");
		this.load.audio('bg01', 'assets/bg.mp3');

		//up&down button
		this.load.image('upBtn', 'assets/btn_up.png');
		this.load.image('downBtn', 'assets/btn_down.png');
		this.load.image('tieBtn', 'assets/btn_tie.png');
		this.load.image("retryBtn", "assets/btn_retry.png");

		// textimage 로드 
		this.load.image('cardFalse', 'assets/cardFalse.png');
		this.load.image('cardTrue', 'assets/cardTrue.png');
		this.load.image('turn', 'assets/turn.png');
		this.load.image('waiting', 'assets/waiting.png');
		this.load.image('wrong', 'assets/wrong.png');

		this.load.image('cardBack', 'assets/card_back.png');

		this.load.image('cardIcon', 'assets/icon_card.png');
		this.load.image('clockIcon', 'assets/icon_clock.png');

		this.load.image('shine', 'assets/shine.png');
		this.load.image('twinkle', 'assets/twinkle.png');

		//음성 로드
		this.load.audio('successSound', "assets/success.mp3");
		this.load.audio('failSound',"assets/fail.mp3");
		this.load.audio("turnSound", "assets/turn.mp3");
		this.load.audio("flipSound","assets/cardFlip.mp3");

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
			percentText.setText(parseInt(value * 100) + '%');
			progressBar.clear();
			progressBar.fillStyle(0xffffff, 1);
			progressBar.fillRect(170, 460, 300 * value, 30);
		});

		this.load.on('fileprogress', function (file) {
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

		// 카드 이미지 로드
		this.load.atlas('cards', 'assets/card_set.png', 'assets/card_set.json');
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
		this.gameDone = false;
		this.scene.start("game", {
			restart: restart
		});
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
		var helpTxt = this.add.bitmapText(game.config.width / 2, 640, "font", '당신의 촉을 믿어봐! \n다음 카드는 업? 다운? 타이? 맞춰보세요', 30).setOrigin(0.5);
		helpTxt.depth = 2;
		helpTxt.align = 1;
		this.bgm();
	}

	helpToggle() {
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
		this.score = 0;
		this.startFlag = false;
		this.myTurn = true;
		this.flipNumber = 'B3';

		this.cardList = [];
		this.beforeCard= '';
	}

	Msg() {
		// 준비 메시지 출력 
		let ready;
		let go;
		setTimeout(() => {
			//레디 음성과 이미지 출력
			ready = this.add.image(game.config.width / 2, game.config.height / 2, 'ready_msg');
			ready.depth = 999;
			const sound_ready = this.sound.add('ready');
			sound_ready.play();
		}, 0);

		setTimeout(() => {
			////고 음성과 이미지 출력
			ready.destroy();
			go = this.add.image(game.config.width / 2, game.config.height / 2, 'go_msg');
			go.depth = 999;
			const sound_go = this.sound.add('go');
			sound_go.play();
		}, 1600);

		setTimeout(() => {
			go.destroy();
			this.canClick = true;
		}, 2000);
	}

	create(options) {	
		this.addStage();
		this.addButton();
		this.addPockerCard();
		this.Msg();
		this.beforeCardIndex = 0;
		this.alertText = this.add.image(game.config.width / 2, game.config.height / 6, "waiting");
		this.gameDone = false;
		this.addCardLengthIcon();
		this.addTimerIcon();
		
		setTimeout(this.startGame.bind(this), 2000);
		
		this.selectList = [
			{name : 'UP', index : 1, label:'업'},
			{name : 'TIE', index : 0, label : '타이'},
			{name : 'DOWN', index : -1, label : '다운'}
		];
		this.cardText = this.add.bitmapText(0, 0, "font", "", 40).setOrigin(0.5);
		this.selectText = this.add.bitmapText(game.config.width / 2, game.config.height*5/6-45, "font", '', 50).setOrigin(0.5);
		this.selectTypeText = this.add.bitmapText(game.config.width / 2, game.config.height * 5/6, "font", '', 50).setOrigin(0.5);
	}

	// 스테이지 생성 관련 메서드들
	addCardLengthIcon() {
		this.cardLengthText = this.add.bitmapText(100, 30, "font", this.cardList.length, 52);
		this.add.image(80, 50, 'cardIcon');
	}

	addTimerIcon() {
		this.timerText = this.add.bitmapText(430, 30, "font", `${gameOptions.timeLimit < 10 ? '0' + gameOptions.timeLimit.toString() : gameOptions.timeLimit.toString()}:00`, 52);
		this.clockIcon=this.add.image(410, 50, 'clockIcon');
	}

	addStage() {
		// 배경 생성
		this.world = this.add.image(0, 0, "stage");
		this.world.displayWidth = game.config.width;
		this.world.setOrigin(0, 0);
	}

	addButton() {
		this.btnGroup = this.add.group();
		let up = this.add.sprite(game.config.width * 1 / 4, game.config.height * 5 / 6, 'upBtn').setInteractive();
		up.index = 1;
		up.title = "up";
		up.on('pointerdown', function () {
			this.clickHandler(up.index);
		}, this);

		this.btnGroup.add(up);

		let equal = this.add.sprite(game.config.width / 2, game.config.height * 5 / 6, 'tieBtn').setInteractive();
		equal.index = 0;
		equal.title = "tie";
		equal.on('pointerdown', function () {
			this.clickHandler(equal.index);
		}, this);

		this.btnGroup.add(equal);

		let down = this.add.sprite(game.config.width * 3 / 4, game.config.height * 5 / 6, 'downBtn').setInteractive();
		down.index = -1;
		down.title = "down";
		down.on('pointerdown', function () {
			this.clickHandler(down.index);
		}, this);

		this.btnGroup.add(down);
	}

	addPockerCard() {
		var cardMax = gameOptions.rules.random * gameOptions.rules.type;

		let i = 0;
		let x = game.config.width * 0.9 / 3;
		let y = game.config.height * 1.5 / 3;

		while (i < cardMax) {
			let card = this.add.image(x, y, 'cardBack').setInteractive();
			if (i % 4 === 0) {
				x -= 2;
				y -= 2;
			}

			card.index = i;
			card.displayHeight = card.height * 0.7;
			card.displayWidth = card.width * 0.7;
			this.cardList[i] = card;
			i++;
		}

		this.beforeCardX = game.config.width * 2.1 / 3;
		this.beforeCardY = game.config.height * 1.5 / 3;
	}

	addTimer() {
		if (this.myTurn) {
			window.getLocalTime(gameOptions.timeLimit);
		}
	}

	gameTime(format, time) {
		this.timerText.text = format;
		if(time ===0){
			this.clickHandler(this.selectList[Math.floor(Math.random() * this.selectList.length)].index);
		}
	}

	startGame() {
		// 게임 시작하자마자 데이터 받아와서 카드 flip해줘야함
		console.log('startGame')
		let card = this.cardList.pop();
		this.changeTurnState();
		this.onTurnStartCard(card);
	}

	getGameData(list, user) {
		//서버로 부터 받은 데이터로 전처리
		this.player= user;
		var myObj = list.find(data => data.id === user.id);
		if(this.turnTween){
			this.turnTween.stop();
			this.alertText.setAlpha(0);
		}
		if(this.alertText){
			this.alertText.setAlpha(0)
		}

		if(myObj){
			this.checkMyTurn(user, myObj);
			this.flipNumber = myObj.quest;

			if(this.beforeCard === this.flipNumber){
				// 2명이상 유저가 게임 중이다가 이탈자가 생기면 해당 메서드 호출함
				this.changeTurnState();
				this.changeBtnGroupAlpha(this.myTurn ? 1 : 0);
				return;
			}
			this.beforeCard = this.flipNumber;

			if(myObj.hasOwnProperty('select')){
				this.selectIndex = myObj.select;
			}
			
			if (myObj.turn.hasOwnProperty('prev') && myObj.turn.prev !==null) {
				// 이전 턴 유저를 찾아서 이전턴이 아닌 사람들에게 이전턴 사람이 무엇을 눌렀는지 표현 
				var prevTurn = list.find(data => data.id === data.turn.prev);
				prevTurn && this.setOtherSelectText(prevTurn);
			}
		}
		
		if (myObj && (myObj.turn.next===myObj.id)) {
			// 내턴인 경우 
			if (this.cardList) {
				let card = this.cardList.pop();
				if(this.beforeCardIndex>0){
					this.onTurnStartCard(card);
				}
				
				//나의 턴을 바꾸기 전에 내 턴이 true였다면 correct 확인해서 내 점수에 반영
				if (this.myTurn && myObj.hasOwnProperty('correct')&& this.startFlag) {
					this.checkMyScore(card, myObj.correct);
				}

			}
		}else if(list.length>1){
			// 내턴이 아니면서 2명 이상의 유저가 있는 경우 
			let card = this.cardList.pop();			
			var turnObj = list.find(data =>data.id ===data.turn.next);
			if(this.startFlag){
				this.checkMyScore(card, turnObj.correct);
			}
			
			if (this.beforeCardIndex > 0) {
				this.onTurnStartCard(card);
			}				
		}

		if (this.cardList.length === 0) {
			this.gameDone = true;
		}
		window.endGameTimer();
	}

	setOtherSelectText(turnObj){
		
		if(this.startFlag&&!this.clickMyTurn){
			var selectObj = this.selectList.find(data => data.index === this.selectIndex);
			this.selectText.setText(`${turnObj.nickname}님께서`);
			this.selectTypeText.setText(`${selectObj.label}을 눌렀어요!`);
		}		
	}

	checkMyTurn(user, myObj) {
		// 내 상태 변경
		this.myTurn = false;		
		this.myTurn = (user.id === myObj.turn.next);
		this.clickFlag = this.myTurn;		
	}

	checkMyScore(card, correct) {
		this.changeBtnGroupAlpha(0);
		if(this.alertText){
			this.alertText.setAlpha(0);
		}
		
		if (correct) {
			const soundSuccess = this.sound.add('successSound');
			soundSuccess.play();
			if(card){
				card.x = game.config.width / 2;
				card.y = game.config.height / 2;
				card.scale = 1;
				card.setDepth(1);
			}
			
			this.correctText = this.add.image(game.config.width / 2, game.config.height / 6, 'cardTrue');
			this.twinkle = this.add.image(game.config.width / 2, game.config.height / 2, 'twinkle');
			this.shine = this.add.image(game.config.width / 2, game.config.height / 2, 'shine');
			this.twinkle.scale = 1;
			this.shine.scale = 1.2;
			this.shine.setDepth(0);
			
			this.twinkle.setDepth(2);
			var me = this;

			var twinkleTween = this.tweens.add({
				targets: this.twinkle,
				scale: this.twinkle.scale === 1.2 ? 0.7 : 1.2,
				ease: 'Linear',
				duration: 700,
				repeat: 0,
				yoyo: true,
				onComplete:()=>{
					twinkleTween.stop();
				}
			});

			var shineTween = this.tweens.add({
				targets: this.shine,
				rotation: this.shine.rotation + 0.5,
				ease: 'Linear',
				duration: 700,
				repeat: 0,
				yoyo: true,
				onComplete: () => {
					me.setBeforeCard(card);
					shineTween.stop();
				}
			});

		} else {
			const soundFail = this.sound.add('failSound');
			soundFail.play();
			var me = this;
			if(card){

				card.x = game.config.width / 2;
				card.y = game.config.height / 2;
				card.scale = 1;
				card.setTint(0xcccccc);
				card.setDepth(1);
			}
			this.correctText = this.add.image(game.config.width / 2, game.config.height / 6, 'cardFalse');
			this.shine = this.add.image(game.config.width / 2, game.config.height / 2, 'wrong');
			this.shine.setDepth(0);
			var shineTween = this.tweens.add({
				targets: this.shine,
				scale: this.shine.scale === 1.2 ? 0.7 : 1.2,
				ease: 'Linear',
				duration: 700,
				repeat: 0,
				yoyo: true,
				onComplete: () => {
					shineTween.stop();
					this.destroyBeforeImage();
					me.onCompleteUncorrectAction(card);
				}
			});		
		}
	}

	onCompleteUncorrectAction(card){
		if (this.myTurn) {
			this.retry = this.add.image(game.config.width / 2, game.config.height * 5 / 6, 'retryBtn').setInteractive();
			this.score += 1;
			this.retry.on('pointerdown', () => {
				this.setBeforeCard(card);
			});
			this.changeBtnGroupAlpha(0);
		} else {
			this.setBeforeCard(card);
		}
	}

	setBeforeCard(card) {
		//console.log('setBeforeCard')
		this.beforeCard = card.scene.flipNumber;

		this.destroyBeforeImage();

		if (this.correctText) {
			this.correctText.destroy();
		}
		if (this.retry) {
			this.retry.destroy();
		}
			card.scale = 0.7;
			card.setTint(0xffffff);
			card.x = this.beforeCardX;
			card.y = this.beforeCardY;
			card.setDepth(0);
		
		if (this.beforeCardIndex % 4 === 0) {
			this.beforeCardY -= 2;
			this.beforeCardX += 2;
		}
		this.beforeCardIndex ++;
		this.cardLengthText.setText(this.cardList.length);
		this.changeBtnGroupAlpha(this.myTurn ? 1 : 0);
		this.clickMyTurn = false;
		if (this.startFlag) {
			this.changeTurnState();
		}

		if(this.selectText){
			this.selectText.setText("");
			this.selectTypeText.setText("");
		}

		if(!this.startFlag){
			this.startFlag = true;
		}
	}

	destroyBeforeImage(){
		if (this.shine) {
			this.shine.destroy();
		}
		if (this.twinkle) {
			this.twinkle.destroy();
		}
	}

	changeTurnState() {
		//this.destroyBeforeImage();
		if (this.myTurn) {
			const turnSound = this.sound.add('turnSound');
			turnSound.play();
			this.addTimer();
			this.alertText.setTexture('turn');
			this.alertText.setAlpha(1);
			this.turnTween = this.tweens.add({
				targets: this.alertText,
				alpha: 0,
				ease: 'Cubic.easeOut',
				duration: 700,
				repeat: 3,
				yoyo: true
			});
			this.selectText.setText('');
			this.selectTypeText.setText("");
			this.clockIcon.setAlpha(1);

		} else {
			this.timerText.setText("");
			this.clockIcon.setAlpha(0);
			this.alertText.setTexture('waiting');
			this.alertText.setAlpha(1);
			this.changeBtnGroupAlpha(0);
		}
	}

	changeBtnGroupAlpha(alpha) {
		if(this.btnGroup){
			this.btnGroup.getChildren().forEach(child => {
				child.setAlpha(alpha);
			});
		}		
	}

	clickHandler(match) {
		if(this.startFlag && this.clickFlag){
			this.clickMyTurn = true;
			this.clickFlag = false;	
			if (!this.gameDone) {
				window.gameScore({select: match});
			}
		}
	}

	onTurnStartCard(card) {
		var me = this;
		var flipSound= this.sound.add('flipSound');
		flipSound.play();
		if(this.alertText){
			this.alertText.setAlpha(0);
		}
		var tween1 = this.tweens.add({
			targets: card,
			scaleX: 0.01,
			ease: 'Linear',
			duration: 50,
			repeat: 0,
			yoyo: false,
			onComplete: function () {
				me.onTurnEndCard(card);
				tween1.stop();
			}
		});
	}

	onTurnEndCard(card) {
		var me = this;
		var twn = this.tweens.add({
			targets: card,
			scaleX: this.beforeCardIndex>0 ? 1 : 0.7,
			ease: 'Linear',
			duration: 50,
			repeat: 0,
			yoyo: false,
			onComplete: function () {
				me.onChangeCardTexture(card);
				twn.stop();
			}
		});
	}

	onChangeCardTexture(card) {
		
		card.setTexture('cards',this.flipNumber);
		if (this.beforeCardIndex === 0) {
			this.setBeforeCard(card);
		}

		if (this.gameDone) {
			setTimeout(this.gameOver.bind(this), 1000);
		}
	}

	gameOver() {
		console.log(`게임오버 ${this.score}`);
		this.startFlag = false;
		this.gameDone = false;
		window.endGame(this.score, "");
		this.soundEvent = this.time.delayedCall(1000, this.allStopSound, [], this);
		
	}

	allStopSound() {
		this.sound.stopAll();
	}
}