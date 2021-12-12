// JavaScript Document
let game;
let gameOptions = {
    timeLimit: 0,
    bigCircleRadius: 180,
    playerRadius: 20,
    playerSpeed: 1,
    worldGravity: 0.8,
    jumpForce: [11, 8, 6],
    spikeSize: [25, 50],
    closeToSpike: 10,
    farFromSpike: 35
};
window.onload = function () {
        // 게임설정
        window.introScene = new IntroScene();
        window.gameScene = new GameScene();
        //        console.log(window.introScene.start);

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

            //게임별 요소
            this.load.image('splash', 'assets/splash.png');
            this.load.image('help', 'assets/help.png');
            this.load.image("bigcircle", "assets/bigcircle.png");
            this.load.image("player", "assets/player.png");
            this.load.image("spike", "assets/spike.png");
            this.load.image("particle", "assets/particle.png");
            this.load.image("bg", "assets/bg.png");
            //사운드 출력
            this.load.audio('bg01', 'assets/bg.mp3');
            this.load.audio('sound_jump', 'assets/jump.mp3');
            this.load.audio('explosion', 'assets/explosion.mp3');
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
            
            window.setAutoEndGame(true);
            
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
            var helpTxt = this.add.bitmapText(game.config.width / 2, 640, "font", '외계인들을 피해 혹성을 탈출하세요!\n연속점프가 가능합니다.', 30).setOrigin(0.5);
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
        //공통사항
        this.addSky();
        this.Msg();
        this.timeText = this.add.bitmapText(60, 30, "font", `${gameOptions.timeLimit <10 ? '0'+gameOptions.timeLimit.toString() : gameOptions.timeLimit.toString() }:00`, 52); //시간출력, 52는 폰트사이즈
        //this.scoreText = this.add.bitmapText(550, 82, "font", this.score, 52).setOrigin(1).setRightAlign(); //스코어출력, 52는 폰트사이즈
        this.timer = 0;
        this.timerEvent = null;
        // 재시작 여부 판단하여 배경음 플레이
		options.restart && introScene.bgm();
        //게임관련 코드 시작
        this.gameOver = true; //죽으면 게임종료 설정
        this.spikeGroup = this.add.group();
        this.bigCircle = this.add.sprite(game.config.width / 2, game.config.height / 2, "bigcircle");
        this.bigCircle.displayWidth = gameOptions.bigCircleRadius * 2;
        this.bigCircle.displayHeight = gameOptions.bigCircleRadius * 2;
        this.player = this.add.sprite(game.config.width / 2, game.config.height / 2 - gameOptions.bigCircleRadius - gameOptions.playerRadius, "player");
        this.player.angle = -90;
        this.player.displayWidth = 50;
        this.player.displayHeight = 65;
        this.player.currentAngle = -80; //플레이어 시작지점
        this.player.jumpOffset = 0;
        this.player.jumps = 0;
        this.player.jumpForce = 0;
        // 터치입력 점프
        this.input.on("pointerdown", function (e) {
            if (this.player.jumps < gameOptions.jumpForce.length) {
                this.player.jumps++;
                this.sound_jump = this.sound.add('sound_jump', {
                    volume: 0.5
                });
                this.sound_jump.play();
                this.player.jumpForce = gameOptions.jumpForce[this.player.jumps - 1];
            }
        }, this);
        // 외계인 등장
        for (var i = 0; i < 5; i++) {
            var spike = this.add.sprite(0, 0, "spike");
            spike.setOrigin(0, 0.5);
            this.spikeGroup.add(spike);
            this.placeSpike(spike, Math.floor(i / 2));
        }
        // 우주선 파티클 출력
        var particles = this.add.particles("particle");
        
        this.emitter = particles.createEmitter({
            //speed: 0,
            //x : -30,
            scale: { start: 0, end: 1},
            alpha: { start: 1, end: 0},
            angle: { min: -185, max: -195},
            speed: { min: 100, max: 200 },
            //frequency: 50,
            blendMode: 'SCREEN',
            lifespan: 500
        });
        // making the emitter follow the player
        this.emitter.startFollow(this.player);
        console.log(this.player);
        this.callTimer = this.time.delayedCall(2000, this.startDelay, [], this);
        setTimeout(this.startGame.bind(this),2000);
    }

    startGame(){
        console.log(`planet startGame ${gameOptions.timeLimit}`);
		window.setTime(gameOptions.timeLimit);
    }

    startDelay() {
        this.gameOver = false;
    }
    // 바닥 몬스터 제어
    placeSpike(spike, quadrant) {

        // 랜덤 각도 출력
        var randomAngle = Phaser.Math.Angle.WrapDegrees(Phaser.Math.Between(quadrant * 90, (quadrant + 1) * 90));
        var randomAngleRadians = Phaser.Math.DegToRad(randomAngle);

        // 외계인 위치값
        var spikeX = this.bigCircle.x + (gameOptions.bigCircleRadius - Phaser.Math.Between(4, 25)) * Math.cos(randomAngleRadians);
        var spikeY = this.bigCircle.y + (gameOptions.bigCircleRadius - Phaser.Math.Between(4, 25)) * Math.sin(randomAngleRadians);
        spike.x = spikeX;
        spike.y = spikeY;

        spike.quadrant = quadrant;
        spike.angle = randomAngle;

        spike.top = new Phaser.Math.Vector2(spikeX + gameOptions.spikeSize[1] * Math.cos(randomAngleRadians), spikeY + gameOptions.spikeSize[1] * Math.sin(randomAngleRadians));
        spike.base1 = new Phaser.Math.Vector2(spikeX + gameOptions.spikeSize[0] / 2 * Math.cos(randomAngleRadians + Math.PI / 2), spikeY + gameOptions.spikeSize[0] / 2 * Math.sin(randomAngleRadians + Math.PI / 2));
        spike.base2 = new Phaser.Math.Vector2(spikeX + gameOptions.spikeSize[0] / 2 * Math.cos(randomAngleRadians - Math.PI / 2), spikeY + gameOptions.spikeSize[0] / 2 * Math.sin(randomAngleRadians - Math.PI / 2));

        // 우주선과 외계인 충돌 체크
        spike.approaching = false;
    }

    addSky() { //배경생성
        this.bg = this.add.sprite(game.config.width / 2, game.config.height / 2, "bg");
        this.bg.displayWidth = game.config.width;
        this.bg.displayHeight = game.config.height;
    }

    gameTime(format, time) {
        this.timeText.text = format;
    }
  
    allStopSound() {
        this.sound.stopAll();
    }
    regame() {
        this.score = 0;
        this.scene.restart();
    }
    update() {
        // 게임오버가 아니면 각종 셋팅 초기화
        if (!this.gameOver) {
            if (this.player.jumps > 0) {
                this.player.jumpOffset += this.player.jumpForce;
                this.player.jumpForce -= gameOptions.worldGravity;
                if (this.player.jumpOffset < 0) {
                    this.player.jumpOffset = 0;
                    this.player.jumps = 0;
                    this.player.jumpForce = 0;
                }
            }
            this.player.currentAngle = Phaser.Math.Angle.WrapDegrees(this.player.currentAngle + gameOptions.playerSpeed);
            var radians = Phaser.Math.DegToRad(this.player.currentAngle);
            var distanceFromCenter = (gameOptions.bigCircleRadius * 2 + gameOptions.playerRadius * 2) / 2 + this.player.jumpOffset;

            // 플레이어 회전 위치값
            this.player.x = this.bigCircle.x + distanceFromCenter * Math.cos(radians);
            this.player.y = this.bigCircle.y + distanceFromCenter * Math.sin(radians);
            var revolutions = (gameOptions.bigCircleRadius * 2) / (gameOptions.playerRadius * 2) + 1;
            this.player.angle = this.player.currentAngle * 1;

            this.spikeGroup.children.iterate(function (spike) {
                var angleDiff = this.getAngleDifference(spike.angle, this.player.currentAngle);
                if (!spike.approaching && angleDiff < gameOptions.closeToSpike) {
                    spike.approaching = true;
                }
                if (spike.approaching) {
                    if (this.distToSegmentSquared(new Phaser.Math.Vector2(this.player.x, this.player.y), gameOptions.playerRadius, spike.top, spike.base1) || this.distToSegmentSquared(new Phaser.Math.Vector2(this.player.x, this.player.y), gameOptions.playerRadius, spike.top, spike.base2)) {

                        // 엄마야 게임오버네
                        this.gameOver = true;
                        console.log("게임오버!");   
                        window.endGameTimer();

                        //종료 대기 메시지		
                        var helpTxt = this.add.bitmapText(game.config.width / 2, game.config.height / 2, "font", '다른 유저가 플레이 중\n잠시만 기다려 주세요!', 30).setOrigin(0.5);
                        helpTxt.depth = 2;
                        helpTxt.align = 1;
                        //음악리셋
                        this.soundEvent = this.time.delayedCall(200, this.allStopSound, [], this);
                        this.explosion = this.sound.add('explosion', {
                            volume: 0.5
                        });
                        this.explosion.play();
                        // 파티클 꺼주세요.
                        this.emitter.stop();
                        // 카메라도 한번 흔들어주시고요.
                        this.cameras.main.shake(800, 0.01);
                        //this.timerEvent.remove();

                        var resultScore = this.changeFormatTime(this.timeText.text);
                        console.log(resultScore)
                        window.endGame(resultScore, `${this.timeText.text}`);
                                                
                        var particles = this.add.particles("particle");
                        // 파티클 속성
                        var emitter = particles.createEmitter({
                            // 파티클 스피드
                            speed: {
                                min: -50,
                                max: 50
                            },
                            // 사이즈
                            scale: {
                                start: 0.2,
                                end: 0.25
                            },
                            // 알파값
                            alpha: {
                                start: 1,
                                end: 0
                            },
                            // 유지시간
                            lifespan: 2000
                        })

                        // 플레이어로 부터 폭파 파티클 생성 좌표
                        emitter.explode(70, this.player.x, this.player.y);
                        // 우주선 숨기기
                        this.player.visible = false;
                    }

                    if (angleDiff > gameOptions.farFromSpike) {
                        this.placeSpike(spike, (spike.quadrant + 3) % 4);
                    }
                }
            }, this);
        }
    }

	changeFormatTime(timeFormat){
		if(timeFormat!==0){
			return parseInt(timeFormat.replace(/:/gi, ""));
		}else{
			return 0;
		}		
	}
    
    getAngleDifference(a1, a2) {
        var angleDifference = a1 - a2
        angleDifference += (angleDifference > 180) ? -360 : (angleDifference < -180) ? 360 : 0
        return Math.abs(angleDifference);
    }
    getDistance(p1, p2) {
        return (p1.x - p2.x) * (p1.x - p2.x) + (p1.y - p2.y) * (p1.y - p2.y);
    }
    distToSegmentSquared(circleCenter, circleRadius, segmentStart, segmentEnd) {
        var l2 = this.getDistance(segmentStart, segmentEnd);
        var t = ((circleCenter.x - segmentStart.x) * (segmentEnd.x - segmentStart.x) + (circleCenter.y - segmentStart.y) * (segmentEnd.y - segmentStart.y)) / l2;
        t = Math.max(0, Math.min(1, t));
        var tX = segmentStart.x + t * (segmentEnd.x - segmentStart.x);
        var tY = segmentStart.y + t * (segmentEnd.y - segmentStart.y);
        var tPoint = {
            x: tX,
            y: tY
        }
        return this.getDistance(circleCenter, tPoint) < circleRadius * circleRadius;
    }
}
