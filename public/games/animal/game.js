let game;
let gameOptions = {
    timeLimit: 0
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
        this.load.audio('ready', '../../commons/assets/ready.wav');
        this.load.audio('go', '../../commons/assets/go.wav');
        this.load.audio('timeup', '../../commons/assets/timeup.wav');
        this.load.bitmapFont("font", "../../commons/assets/font.png", "../../commons/assets/font.fnt");
        this.load.bitmapFont("font", "assets/font.png", "assets/font.fnt");

        //player
        this.load.image("player0", "assets/player0.png");
        this.load.image("player1", "assets/player1.png");
        this.load.image("player2", "assets/player2.png");
        this.load.image("player3", "assets/player3.png");
        this.load.image("player4", "assets/player4.png");
        this.load.image("player5", "assets/player5.png");
        this.load.image("player6", "assets/player6.png");
        this.load.image("player7", "assets/player7.png");
        //게임별 요소
        this.load.image("stage", "assets/stage.png");
        this.load.image('splash', 'assets/splash.png');
        this.load.image('hole', 'assets/hole.png');
        //this.load.image('help', 'assets/help.png');
        this.load.audio('bg01', 'assets/bg01.mp3');
        this.load.spritesheet("hit", "assets/hit.png", {
			frameWidth: 360,
			frameHeight: 360
		});

        //프로그레스바 생성
        var progressBar = this.add.graphics();
        var progressBox = this.add.graphics();
        progressBox.fillStyle = 0x222222;
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
            progressBar.fillStyle = 0xffffff;
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
        var helpTxt = this.add.bitmapText(game.config.width / 2, 640, "font", 'test', 30).setOrigin(0.5);
        helpTxt.depth = 2;
        helpTxt.align = 1;
        //this.bgm();
    }

    helpToggle() {
        if (this.help.visible == false) {
            this.help.visible = true;
            btnPlay.disableInteractive();
        } else if (this.help.visible == true) {
            this.help.visible = false;
            btnPlay.setInteractive();
        }
    }
}

class GameScene extends Phaser.Scene{
    constructor(){
        super('game');
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

    create(options){
        //this.memberNumber = Math.floor(Math.random()*8)+1;
        //
        this.memberNumber = 2;
        this.memberList = [...Array(this.memberNumber).keys()];
        this.random = this.memberList.slice();
        this.Msg();
        this.addStage();
        this.setAnimal();
        setTimeout(()=>{
			this.startGame();
		},2000);
    }

    setAnimal(){
        console.log(`${this.memberList}`);
        this.animalGroup= this.add.group();
        this.memberList.map((v,i)=>{
            console.log(`trt`)
            let animal = this.add.sprite(0, 0,`player${i}`);
            animal.displayHeight = 50;
            animal.displayWidth = 50;
            animal.y= 10 + animal.displayHeight;
            animal.x = game.config.width* ((2*(i+1)-1)/(this.memberNumber*2));
            animal.key = i;
            this.animalGroup.add(animal);
            animal.hole = Number(this.random.splice(Math.floor(Math.random() * this.random.length), 1).toString());
        });

        this.setObstacle();
    }

    setObstacle(){
        var children = this.animalGroup.getChildren();
        var height = game.config.height*(2/3);
        this.holeGroup = this.add.group();

        children.map((child,i)=>{
            child.holeAr = [];
            if(child.hole>0){
                var max = child.hole + 1;                
                for (var idx = 0; idx < child.hole; idx++) {
                    console.log(`test ${idx}`)
                    let hole = this.add.sprite(child.x, child.y, 'hole');
                    hole.displayHeight = 50;
                    hole.displayWidth = 50;
                    hole.x = hole.originalX = child.x;
                    hole.y = hole.originalY = height * ((idx + 1) / max);    
                    child.holeAr.push(hole);
                }
            }                   
        });
    }

    startGame(){
        console.log('게임시작');
        this.updatePlayerLocation();
    }

    updatePlayerLocation(){
        // 게임 시작 전 (몇명 참가는 소켓에서 보내줌), 시작 전에 장애물 몇개 있을지 정해져서 그 수를 각자에게 보내줌 
        // 각 참가자는 모든 참가자의 장애물 수와 스피드를 알 수 있으니 동일한 화면이 출력 가능 
        var index = 0;
        var height = game.config.height - 150;
        this.interval= setInterval(()=>{
            this.animalGroup.children.iterate((child)=>{                
                if(!child.done && child.y>850){
                    index = index+1;
                    child.rank= index;
                    child.done= true;
                    
                    this.add.bitmapText(child.x, child.y-100, "font", `${child.rank}등`, 52);
                }else{                    

                    if(child.holeAr.length>0){
                        var hole = child.holeAr[0];
                        if(this.checkOverlap(child,hole)){
                            console.log(`true`);
                            child.holeAr.shift();

                            // 장애물 만났을때 그만큼 액션이 취해져야함. => 해당 오브젝트의 속도 저하 
                            child.y = child.y-20;
                        }else{
                            child.y = child.y + 1;
                        }
                    }else{
                        child.y = child.y + 1;
                    }
                }
            });

            var children= this.animalGroup.getChildren();           

            if (children.every(v => v.done)) {
                this.finishInterval();
            }
        },10);
    }

    checkOverlap(animal, hole) {
        let boundsA = animal.getBounds();
        let boundsB = hole.getBounds();

        return Phaser.Geom.Intersects.RectangleToRectangle(boundsA, boundsB);
    }

    addStage(){
        this.world = this.add.image(0, 0, "stage");
        this.world.displayWidth = game.config.width;
        this.world.setOrigin(0, 0);
    }

    finishInterval(){
        this.interval && clearInterval(this.interval);
    }

    gameOver(){
        console.log('게임오버');
        this.finishInterval();
    }
}