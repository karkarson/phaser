let game;
var gameOptions = {
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
		this.load.image('splash', 'assets/splash.png');
		this.load.image('help', 'assets/help.png');
		this.load.spritesheet("blockOff", "assets/cardBack.png", {
			frameWidth: 320,
			frameHeight: 500
		});

		this.load.image("stage", "assets/stage.png");
		this.load.audio('bg01', 'assets/bg.mp3');
		this.load.audio('hit', 'assets/cardFlip.mp3');
		this.load.audio('fail','assets/fail.mp3');
		this.load.audio('money','assets/money.mp3');
		this.load.image('coins', 'assets/coin.png');
		
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

		// 카드 이미지 로드
		this.load.spritesheet("card1", "assets/card1.png", {
			frameWidth: 320,
			frameHeight: 500
		});
		this.load.spritesheet("card2", "assets/card2.png", {
			frameWidth: 320,
			frameHeight: 500
		});
		this.load.spritesheet("card3", "assets/card3.png", {
			frameWidth: 320,
			frameHeight: 500
		});
		this.load.spritesheet("card4", "assets/card4.png", {
			frameWidth: 320,
			frameHeight: 500
		});
		this.load.spritesheet("card5", "assets/card5.png", {
			frameWidth: 320,
			frameHeight: 500
		});
		this.load.spritesheet("card6", "assets/card6.png", {
			frameWidth: 320,
			frameHeight: 500
		});		
		this.load.spritesheet("card7", "assets/card7.png", {
			frameWidth: 320,
			frameHeight: 500
		});		
		this.load.spritesheet("card8", "assets/card8.png", {
			frameWidth: 320,
			frameHeight: 500
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
		var helpTxt = this.add.bitmapText(game.config.width / 2, 640, "font", '2장 혹은 3장의 짝을 맞춰주세요\n16장의 카드를 모두 맞추면 승리!', 30).setOrigin(0.5);
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


class GameScene extends Phaser.Scene {
	constructor(){
		super("game");
		this.score = 0;
	}

	Msg() {
		// 준비 메시지 출력
		let ready;
		let go;
		setTimeout(()=>{
			//레디 음성과 이미지 출력
			ready = this.add.image(game.config.width/2, game.config.height/2, 'ready_msg');
			ready.depth = 999;
			const sound_ready = this.sound.add('ready');
			sound_ready.play();
		},0);

		setTimeout(()=>{
			////고 음성과 이미지 출력
			ready.destroy();
			go = this.add.image(game.config.width/2, game.config.height/2, 'go_msg');
			go.depth = 999;
			const sound_go= this.sound.add('go');
			sound_go.play();
		},1600);

		setTimeout(()=>{
			go.destroy();
			this.canClick = true;
		},2000);
	}

	create(){
		// 게임 생성
		this.timer = 0;
		this.timerEvent = null;
		// 스코어를 따로 계산 안하는 게임
		// 시간 및 스코어 출력
		
		//this.colorArr = ['red','red','orange','orange','green','green','yellow','yellow','white','white','pink','pink','pink','white','yellow','green'];

		this.colorList = [];
		this.cardImgList = [];
		this.cardImgIndex = [...Array(8).keys()].map(n=>n+1);
		this.cardImgRandomIndex = [];
		this.setRandomCardIndex();
		this.colorCopy = this.cardImgRandomIndex.slice();
		// 이미지들 카드로 생성.

		this.shuffleCard();

		this.arr = [...Array(16).keys()];
		this.cardLocations = [
			[110, 285], [250, 285], [390, 285], [530, 285],
			[110, 455], [250, 455], [390, 455], [530, 455],
			[110, 625], [250, 625], [390, 625], [530, 625],
			[110, 795], [250, 795], [390, 795], [530, 795],
		];
		this.rand = [...this.arr].map(n => n + 1);
		this.cardList = [];
		this.doneList = [];
		this.textList = [];
		this.selectIndex=[];
		this.selectCard = [];
		this.failCard = [];
		this.flipFlag = false;
		this.flipAgain = 0;
		this.Msg();
		this.addStage();
		this.setCard();
		this.timerText = this.add.bitmapText(60, 30, "font", `${gameOptions.timeLimit <10 ? '0'+gameOptions.timeLimit.toString() : gameOptions.timeLimit.toString() }:00`, 52);
		this.bonus = this.add.sprite(166, 56, 'p_icon').setAlpha(0);
		this.bonus.displayWidth = 127;
		this.bonus.displayHeight = 52;
		this.canFlip = true;

		// 게임 생성 후 게임 시작
		setTimeout(()=>{
			this.startGame();
		},2000);
	}

	setRandomCardIndex(){
		var cardImgIndexCopy = this.cardImgIndex.slice();
		while(this.cardImgRandomIndex.length<8){
			let random = Math.floor(Math.random()*this.cardImgIndex.length)+1;
			if(this.checkNotSame(random)){
				this.cardImgRandomIndex.push(random);
				cardImgIndexCopy.splice(cardImgIndexCopy.indexOf(random),1);
			}
		}
		this.cardImgRandomIndex = [...this.cardImgRandomIndex, ...this.cardImgRandomIndex];
	}

	checkNotSame(n){
		return this.cardImgRandomIndex.every((i)=>i!==n);
	}

	shuffleCard(){
		// 카드 섞기
		this.cardImgRandomIndex.forEach(()=>{
			this.colorList = this.colorList.concat(this.colorCopy.splice(Math.floor(Math.random()* this.colorCopy.length),1));
		});
	}

	setCard() {
		// 랜덤 숫자 버튼과 텍스트를 배치하는 로직
		this.cardGroup = this.add.group();
		this.cardImgRandomIndex.map((v, i) => {
			this.blockCard = 'blockOff';
			let card = this.add.sprite(50, 50, this.blockCard).setInteractive();
			const randn = this.colorList.slice(i,i+1).toString();
			this.cardList[i] = card;
			card.index = i;
			card.setScale(0,0);
			card.x = card.originalX = this.cardLocations[i][0];
			card.y = card.originalY = this.cardLocations[i][1];
			card.key = randn;
			this.setTextList("", card);
			card.on('pointerdown', function (i) {
				//console.log(card.index);
				this.clickHandler(card.index);
			}, this);

			let cardImg = this.add.sprite(game.config.width / 2, game.config.height / 2, `card${randn}`);
			cardImg.key = randn;
			this.cardImgList[i] = cardImg;
			cardImg.displayWidth = 0;
			cardImg.displayHeight = 0;
			cardImg.x = card.originalX = this.cardLocations[i][0];
			cardImg.y = card.originalY = this.cardLocations[i][1];
			cardImg.y = card.originalY + card.height * 2;
			this.cardGroup.add(card)
		});
		this.setAnimationCard();
	}

	setAnimationCard(){
		let i =0;
		this.cardGroup.children.iterate((child)=>{
			this.tweens.add({
				targets : child,
				scaleX: 0.37,
				scaleY: 0.37,
				angle: 360,
				_ease: 'Sine.easeInOut',
				ease: 'Power2',
				duration: 500,
				delay: i * 30,
				repeat: 0,
				yoyo: false,
				hold: 1000,
			});
			i++;
		});
	}

	clickHandler (i) {
		if(this.canClick && this.canFlip){
			if(this.doneList.includes(i)){
				return;
			}
	
			var me =this;
			let card = this.cardList[i];
			me.onTurnStartCard(card);
		}		
	}

	onTurnStartCard(card){
		var me = this;
		const soundHit = this.sound.add('hit');
		soundHit.play();
		this.canFlip = false;

		var tween1 = this.tweens.add({
			targets: card,
			scaleX: 0.01,
			ease: 'Linear',
			duration: 30,
			repeat: 0,
			yoyo: false,
			onComplete : function(){
				me.onTurnEndCard(card);
			}
		});
	}

	onTurnEndCard(card){
		var twn = this.tweens.add({
			targets: card,
			scaleX: 0.37,
			ease: 'Linear',
			duration: 30,
			repeat: 0,
			yoyo: false,
			onComplete : ()=>{
				this.onCheckCardTexture(card);
			}
		});
	}

	onCheckCardTexture(card){
		if(card instanceof Array){
			card.map(v=>{
				if(v.hasOwnProperty("key")){
					this.onChangeCardTexture(v);
				}
			});

			this.flipFlag = false;
		}else{
			this.onChangeCardTexture(card);
		}
	}

	onChangeCardTexture(card){
		let cardImg = this.cardImgList[card.index];

		if(!card.texture.key.includes('card')){
			this.blockCard = `card${card.key}`;
			cardImg.displayWidth = 80;
			cardImg.displayHeight = 80;

		}else{
			this.blockCard = 'blockOff';
		}
		card.setTexture(this.blockCard);

		this.onCheckCardText(card);
	}

	onCheckCardText(card){
		if(!this.flipFlag){
			this.doneList = this.doneList.concat(card.index);

			// 카드를 처음 뒤집을때 
			if(this.selectCard.length<2){
				this.selectCard = this.selectCard.concat(card.key);
			}
			
			if (this.selectCard.length === 2 && this.selectCard[0] !== card.key){
				// 카드를 두개 뒤집었는데 틀렸을때
				setTimeout(() => {
					this.flipFlag = true;
					this.flipAgain++;
					this.onFailCardCollect(card);
				}, 200);
			}else if(this.selectCard.length ===2 && this.selectCard[0] === card.key){
				// 카드를 두개 뒤집었는데 맞았을때 
				this.selectCard = [];
				this.failCard = [];
				this.onMatchSuccess(card);
				this.onChangeFlipFlag();
				this.score = this.score +1;
				console.log(`this.score -- ${this.score}`)

				if (this.doneList.length === 16) {
					this.gameOver();
				}
			}else if(this.selectCard.length<2){
				this.onFailCardCollect(card);
				this.onChangeFlipFlag();
			}
		}else{
			this.onChangeFlipFlag();
		}
	}

	onChangeFlipFlag(){
		this.canFlip = true;
	}

	onMatchSuccess(card){
		var soundMoney = this.sound.add('money');
		var emitter0 = this.add.particles('coins').createEmitter({
			angle: { min: 240, max: 300 },
			speed: { min: 100, max: 400 },
			quantity: { min: 7, max: 8 },
			lifespan: 8000,
			//alpha: { start: 1, end: 0 },
			scale: { min: 0.002, max: 0.002 },
			rotate: { min: 0, max: 360 },
			gravityY: 800,
			on: false
		});
		emitter0.setPosition(card.x, card.y);
		emitter0.explode();
		soundMoney.play();
	}

	onFailCardCollect(card) {
		this.failCard.push(card);		

		if (this.failCard.length === 2) {
			this.failCard.forEach((card)=>{
				this.doneList.splice(this.doneList.indexOf(card.index), 1);
			});			
			this.onTurnStartCard(this.failCard);
			this.failCard = [];
			this.selectCard = [];
			this.flipAgain = 0;

			const fail = this.sound.add('fail');
			fail.play();
		}
	}

	checkNumberLength(value){
		const re = new RegExp(value,'g');
		const checkArray = this.cardImgRandomIndex.slice();
		return checkArray.join('').match(re).length;
	}

	onCheckAgainFlipCard(card){
		this.flipFlag = true;
		this.onFailCardScaleUp(card);
	}

	setCardText(key,card){
		let text = this.add.bitmapText(card.x, card.y, "font", key, 40).setOrigin(0.5);
		text.depth = 2;
		text.align = 1;
		return text;
	}

	setTextList(key,card){
		const text = this.setCardText(key,card);
		this.textList = this.textList.concat(text);
	}

	onChangeCardText(key,index){
		let text = this.textList[index];
		text.setText(key);
	}

	startGame(){
		// 게임 시작 관련 로직
		console.log(`card startGame ${gameOptions.timeLimit}`);
		window.setTime(gameOptions.timeLimit);
	}

	gameTime(format, time) {
        this.timerText.text = format;
		if(time===0){
			var sound_timeup = this.sound.add('timeup');
			sound_timeup.play();
			this.soundEvent = this.time.delayedCall(1000, this.allStopSound, [], this);
			this.gameOver();
		}
	}

	gameOver() {
		this.overFlag = true;
		console.log("게임오버");

		this.canClick=false;
		
		this.timescore = this.changeFormatTime(this.timerText.text);
		this.endScore = this.score + this.timescore;
		console.log(this.endScore);
		window.endGame(this.endScore,this.timerText.text);
		//console.log(this.score);
		//종료 대기 메시지
		var helpTxt = this.add.bitmapText(game.config.width / 2, game.config.height / 2, "font", '다른 유저가 플레이 중\n잠시만 기다려 주세요!', 30).setOrigin(0.5);
		helpTxt.depth = 2;
		helpTxt.align = 1;
		window.endGameTimer();
	}

	changeFormatTime(timeFormat){
		if(timeFormat!==0){
			return parseInt(timeFormat.replace(":", ""));
		}else{
			return 0;
		}		
	}
	
	checkTime(time) {
		this.timerText.text = time;
	}

	centerButtonText (gameText, gameButton) {
		Phaser.Display.Align.In.Center(
		  gameText,
		  gameButton
		);
	}

	allStopSound(){
		this.sound.stopAll();
	}

	addStage(){
		// 배경 생성
		this.world = this.add.image(0, 0, "stage");
		this.world.displayWidth = game.config.width;
		this.world.setOrigin(0, 0);
	}

	regame() {
        this.score = 0;
        this.scene.restart();
    }
}
