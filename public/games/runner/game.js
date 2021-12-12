let game;
var gameOptions = {
    timeLimit: 0
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
        this.load.audio('ready', '../../commons/assets/ready.wav');
        this.load.audio('go', '../../commons/assets/go.wav');
        this.load.audio('timeup', '../../commons/assets/timeup.wav');
        this.load.bitmapFont("font", "../../commons/assets/font.png", "../../commons/assets/font.fnt");
        
        //게임별 요소
        this.load.image('splash', 'assets/splash.png');
        this.load.image('help', 'assets/help.png');
        this.load.audio('bg01', 'assets/bg.mp3');
        this.load.image("player", "assets/player.png");
        this.load.image("spike", "assets/spike.png");
        this.load.image("finish","assets/finish.png");

        this.load.audio('walk','assets/walk.mp3');

        //프로그레스바 생성
        var progressBar = this.add.graphics();
        var progressBox = this.add.graphics();
        progressBox.fillStyle(0x222222);
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
            progressBar.fillStyle(0xffffff,1);
            progressBar.fillRect(170, 460, 300 * value, 30);
            progressBar.depth = 6;
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
        this.bgm();
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

class GameScene extends Phaser.Scene {
    constructor() {
        super("game");
        this.score = 0;
    }

    preload(){
        this.load.scenePlugin('Camera3DPlugin', '../../commons/libs/camera3d.min.js', 'Camera3DPlugin', 'cameras3d');
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
		// 게임 생성
		this.timer = 0;
		this.timerEvent = null;
		// 게임 관련 준비 해야할 것들(위치 등을 잡아야함)
		this.remainTime = 0;
		
		this.textList = [];
		this.idx = 1;
        this.resultTime = 0;
        this.canClick = false;
		this.Msg();
        
        this.camera = this.cameras3d.add(800).setPosition(game.config.width/2, game.config.height/2, 20000);
       

        this.finish = this.camera.create(game.config.width,game.config.height,10,'finish');
		// 재시작 여부 판단하여 배경음 플레이
		options.restart && introScene.bgm();
		this.lastTime = 0; 
        this.canClick = false;
        this.clickCount = 0;
        this.setResource();
        this.reset();
        this.render();
        this.player = this.add.sprite(game.config.width / 2, game.config.height -100, "player");
        this.spike = this.add.sprite(10, game.config.height - 100, "spike");
        this.spike2 = this.add.sprite(game.config.width-10, game.config.height - 100, "spike");
        this.player.displayWidth = 300;
        this.player.displayHeight = 200;
        this.spike.displayWidth = 200;
        this.spike.displayHeight = 200;
        this.spike2.scale=3;
        // this.spike2.displayWidth = 200;
        // this.spike2.displayHeight = 200;
         
        this.clickCountText = this.add.bitmapText(70,70, "font", `${this.clickCount}`,52);
        this.input.on("pointerdown", this.clickHandler,this);
        this.baseY = this.player.y;

        // 스코어를 따로 계산 안하는 게임 
        // 시간 및 스코어 출력 
        this.timerText = this.add.bitmapText(30, 30, "font", `${gameOptions.timeLimit.toString()}:00`, 52);

        // 게임 생성 후 게임 시작 
        setTimeout(() => {
            this.startGame();
        }, 2000);
        //var progressBar = new Phaser.Geom.Rectangle(200, 200, 400, 50);
        this.setProgressbar();
    }
    
    startGame() {
        // 게임 시작 관련 로직 

        window.setTime(gameOptions.timeLimit);
        this.canClick = true;
    }

    setProgressbar(){
        let progressBar = this.add.graphics();
        let progressBox = this.add.graphics();
        progressBox.fillStyle(0x222222,0.8);
        //progressBox.fillRect(60,150,120,10);
        progressBox.fillRoundedRect(32,120,150,50,32);
        
        var width = this.cameras.main.width;
        var height = this.cameras.main.height;
    }

    gameTime(format, time) {
        this.timerText.text = format;        
    }

    setResource(){
        this.fps = 10; // how many 'update' frames per second
        this.step = 10 / this.fps; // how long is each frame (in seconds)
        this.segments = []; // array of road segments
        this.canvas = gameScene.textures.createCanvas('canvasid', game.config.width, game.config.height).getSourceImage();
        this.ctx = this.canvas.getContext('2d'); // ...and its drawing context
        this.sprites = null; // our spritesheet (loaded below)
        this.resolution = null; // scaling factor to provide resolution independence (computed)
        this.roadWidth = 1800; // actually half the roads width, easier math if the road spans from -roadWidth to +roadWidth
        this.segmentLength = 100; // length of a single segment
        this.rumbleLength = 3; // number of segments per red/white rumble strip
        this.trackLength = null; // z length of entire track (computed)
        this.lanes = 3; // number of lanes
        this.fieldOfView = 100; // angle (degrees) for field of view
        this.cameraHeight = 1000; // z height of camera
        this.cameraDepth = null; // z distance camera is from screen (computed)
        this.drawDistance = 100; // number of segments to draw
        this.playerX = 0; // player x offset from center of road (-1 to 1 to stay independent of roadWidth)
        this.playerZ = null; // player relative z distance from camera (computed)
        this.position = 0; // current camera Z position (add playerZ to get player's absolute Z position)
        this.speed = 0; // current speed
        this.maxSpeed = this.segmentLength / this.step; // top speed (ensure we can't move more than 1 segment in a single frame to make collision detection easier)
        this.accel = this.maxSpeed / 5; // acceleration rate - tuned until it 'felt' right
        this.breaking = -this.maxSpeed; // deceleration rate when braking
        this.decel = -this.maxSpeed / 5; // 'natural' deceleration rate when neither accelerating, nor braking
        this.offRoadDecel = -this.maxSpeed / 2; // off road deceleration is somewhere in between
        this.offRoadLimit = this.maxSpeed / 4; // limit when off road deceleration no longer applies (e.g. you can always go at least this speed even when off road)

        this.keyLeft = false;
        this.keyRight = false;
        this.keyFaster = false;
        this.keySlower = false;
        this.finishScale = 0.03;
        this.beforeClickTime = 0; 

        //this.finish = this.add.sprite(game.config.width / 2, game.config.height / 2, "finish");
        
        this.COLORS = {
            SKY:  0x72D7EE,
            TREE: 0x005108,
            LIGHT:  { road: 0x6B6B6B, grass: 0x10AA10, rumble: 0x555555, lane: 0xCCCCCC  },
            DARK:   { road: 0x696969, grass: 0x009A00, rumble: 0xBBBBBB                   },
            START:  { road: 'white',   grass: 'white',   rumble: 'white'                     },
            FINISH: { road: 'black',   grass: 'black',   rumble: 'black'                     }
        };

        this.SPRITES = {  
            STUMP:                  { x:  995, y:  330, w:  195, h:  140 },
            SEMI:                   { x: 1365, y:  490, w:  122, h:  144 },
            CAR01:                  { x: 1205, y: 1018, w:   80, h:   56 },
            PLAYER_UPHILL_LEFT:     { x: 1383, y:  961, w:   80, h:   45 },
            PLAYER_UPHILL_STRAIGHT: { x: 1295, y: 1018, w:   80, h:   45 },
            PLAYER_UPHILL_RIGHT:    { x: 1385, y: 1018, w:   80, h:   45 },
            PLAYER_LEFT:            { x:  995, y:  480, w:   80, h:   41 },
            PLAYER_STRAIGHT:        { x: 1085, y:  480, w:   80, h:   41 },
            PLAYER_RIGHT:           { x:  995, y:  531, w:   80, h:   41 }
        };
        this.SPRITES.SCALE = 0.3 * (1 / this.SPRITES.PLAYER_STRAIGHT.w);
        this.grap = this.add.graphics();
    }

    reset(options) {
        options = options || {};
        this.lanes = Util.toInt(options.lanes, this.lanes);
        this.roadWidth = Util.toInt(options.roadWidth, this.roadWidth);
        this.cameraHeight = Util.toInt(options.cameraHeight, this.cameraHeight);
        this.drawDistance = Util.toInt(options.drawDistance, this.drawDistance);
        this.fieldOfView = Util.toInt(options.fieldOfView, this.fieldOfView);
        this.segmentLength = Util.toInt(options.segmentLength, this.segmentLength);
        this.rumbleLength = Util.toInt(options.rumbleLength, this.rumbleLength);
        this.cameraDepth = 1 / Math.tan((this.fieldOfView / 2) * Math.PI / 180);
        this.playerZ = (this.cameraHeight * this.cameraDepth);
        this.resolution = game.config.height / 480;
        //refreshTweakUI();

        if ((this.segments.length == 0) || (options.segmentLength) || (options.rumbleLength))
            this.resetRoad(); // only rebuild road when necessary
    }

    resetRoad() {
        this.segments = [];
        for(var n = 0 ; n < 500 ; n++) {
        this.segments.push({
            index: n,
            p1: { world: { z:  n   *this.segmentLength }, camera: {}, screen: {} },
            p2: { world: { z: (n+1)*this.segmentLength }, camera: {}, screen: {} },
            color: Math.floor(n / this.rumbleLength) % 2 ? this.COLORS.DARK : this.COLORS.LIGHT
        });
        }

        this.segments[this.findSegment(this.playerZ).index + 2].color = this.COLORS.START;
        this.segments[this.findSegment(this.playerZ).index + 3].color = this.COLORS.START;
        for(var n = 0 ; n < this.rumbleLength ; n++)
        this.segments[this.segments.length-1-n].color = this.COLORS.FINISH;

        this.trackLength = this.segments.length * this.segmentLength;
    }

    findSegment(z) {
        return this.segments[Math.floor(z / this.segmentLength) % this.segments.length];
    }

    render() {

        var baseSegment = this.findSegment(this.position);
        var maxy = game.config.height;

        this.ctx.clearRect(0, 0, game.config.width, game.config.height);
        
        var n, segment;
        

        for (n = 0; n < this.drawDistance; n++) {

            segment = this.segments[(baseSegment.index + n) % this.segments.length];
            segment.looped = segment.index < baseSegment.index;

            Util.project(segment.p1, (this.playerX * this.roadWidth), this.cameraHeight, this.position - (segment.looped ? this.trackLength : 0), this.cameraDepth, game.config.width, game.config.height, this.roadWidth);
            Util.project(segment.p2, (this.playerX * this.roadWidth), this.cameraHeight, this.position - (segment.looped ? this.trackLength : 0), this.cameraDepth, game.config.width, game.config.height, this.roadWidth);

            if ((segment.p1.camera.z <= this.cameraDepth) || // behind us
                (segment.p2.screen.y >= maxy))          // clip by (already rendered) segment
                continue;
            
            Render.segment(this.grap, game.config.width, this.lanes,
                segment.p1.screen.x,
                segment.p1.screen.y,
                segment.p1.screen.w,
                segment.p2.screen.x,
                segment.p2.screen.y,
                segment.p2.screen.w,
                segment.color);

            maxy = segment.p2.screen.y;

            if (segment.index === this.segments.length - 1) {
                // this.finish.position.y = segment.p1.screen.y;
                // this.finish.gameObject.y = segment.p1.screen.y;
                // this.finish.size.y = segment.p1.screen.y;
                // this.camera.y = segment.p1.screen.y;
                this.camera.z -= 500;
                
                //this.finish.scale = 1;
            } else {
                if (n === this.segmentLength - 1) {
                    // this.finish.gameObject.y = this.finish.y + 10;
                    // this.finish.position.y = this.finish.y + 10;
                    // this.finish.size.y = this.finish.y + 10;
                    // this.camera.y = this.finish.y + 10;
                    this.camera.z -= 500;
                    this.finish.gameObject.alpha = 1 - Phaser.Math.Percent(this.camera.z, game.config.width, game.config.height);
                }
            }
        }     
    }

    clickHandler(){
        if(this.canClick){
            let timerText = this.changeFormatTime(this.timerText.text);
            //가속도 높이기 위한 액션 player의 y축을 변경해준다. 
            this.changeY = this.baseY;

            // 가속도 높이기 
            if(this.beforeClickTime>0 && timerText-this.beforeClickTime<50){
                this.accel= this.accel+10;
                if (this.player.y === this.baseY) {
                    this.changeY = this.changeY - 50;
                }
            }else{
                this.accel = 20;
                if (this.player.y === this.baseY) {
                    this.changeY = this.changeY - 10;
                }
            }

            this.player.y = this.changeY;
            this.position = Util.increase(this.position, this.step * this.speed, this.trackLength);
            this.speed = Util.accelerate(this.speed, this.accel, this.step);
            
            this.render();
            this.clickCount +=1;
            this.clickCountText.text = this.clickCount;
            // finishLine에 왔을때 게임오버 
            window.gameScore(this.clickCount, this.timerText.text);
            console.log(this.clickCount,this.timerText.text);
            var walk = this.sound.add('walk');
            walk.play();
            this.beforeClickTime = timerText;
            if(this.spike2.scale>0){
                this.spike2.scale = this.spike2.scale - 0.2;
            }

            if(this.spike2.y>520){
                this.spike2.y = this.spike2.y -30;
                this.spike2.x = this.spike2.x -30;
            }           
            
            this.camera.y = this.finish.y + 70;
            this.camera.z -= 200;
            window.gameScore(this.position, this.timerText.text);
            
            if(this.position>this.trackLength){
                this.gameover();               
            }
        }        
    }   

    gameover(){
        console.log("게임오버");        
        this.timeScore = this.changeFormatTime(this.timerText.text);
        console.log(this.timeScore);
        this.canClick = false;
        window.endGame(this.timeScore, this.timerText.text);  
        
        //종료 대기 메시지
        var helpTxt = this.add.bitmapText(game.config.width / 2, game.config.height / 2, "font", '다른 유저가 플레이 중\n잠시만 기다려 주세요!', 30).setOrigin(0.5);
		helpTxt.depth = 2;
		helpTxt.align = 1;
    }

    changeFormatTime(timeFormat) {
        if (timeFormat !== 0) {
            return parseInt(timeFormat.replace(":", ""));
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

    update(){
        if(this.finish.gameObject!==1){
            this.finish.gameObject.alpha = 1 - Phaser.Math.Percent(this.camera.z, 10000, 20000);
        }        
    }

    setLoadingBar(){        
        
    }
}


  var Util = {

    toInt:            function(obj, def)          { if (obj !== null) { var x = parseInt(obj, 10); if (!isNaN(x)) return x; } return Util.toInt(def, 0); },
    toFloat:          function(obj, def)          { if (obj !== null) { var x = parseFloat(obj);   if (!isNaN(x)) return x; } return Util.toFloat(def, 0.0); },
    limit:            function(value, min, max)   { return Math.max(min, Math.min(value, max));                     },
    randomInt:        function(min, max)          { return Math.round(Util.interpolate(min, max, Math.random()));   },
    randomChoice:     function(options)           { return options[Util.randomInt(0, options.length-1)];            },
    accelerate:       function(v, accel, dt)      { return v + (accel * dt);                                        },
    interpolate:      function(a,b,percent)       { return a + (b-a)*percent                                        },
    easeIn:           function(a,b,percent)       { return a + (b-a)*Math.pow(percent,2);                           },
    easeOut:          function(a,b,percent)       { return a + (b-a)*(1-Math.pow(1-percent,2));                     },
    easeInOut:        function(a,b,percent)       { return a + (b-a)*((-Math.cos(percent*Math.PI)/2) + 0.5);        },
    exponentialFog:   function(distance, density) { return 1 / (Math.pow(Math.E, (distance * distance * density))); },
  
    increase:  function(start, increment, max) {
      var result = start + increment;
      return result;
    },
  
    project: function(p, cameraX, cameraY, cameraZ, cameraDepth, width, height, roadWidth) {
      p.camera.x     = (p.world.x || 0) - cameraX;
      p.camera.y     = (p.world.y || 0) - cameraY;
      p.camera.z     = (p.world.z || 0) - cameraZ;
      p.screen.scale = cameraDepth/p.camera.z;
      p.screen.x     = Math.round((width/2)  + (p.screen.scale * p.camera.x  * width/2));
      p.screen.y     = Math.round((height/2) - (p.screen.scale * p.camera.y  * height/2));
      p.screen.w     = Math.round(             (p.screen.scale * roadWidth   * width/2));
    }  
  }


var Render = {

    polygon: function (gra, x1, y1, x2, y2, x3, y3, x4, y4, color) {
        //var gra = ctx.add.graphics();
        gra.fillStyle(color);
        gra.beginPath();
        gra.moveTo(x1, y1);
        gra.lineTo(x2, y2);
        gra.lineTo(x3, y3);
        gra.lineTo(x4, y4);
        gra.closePath();
        gra.fill();
    },

    //---------------------------------------------------------------------------

    segment: function (gra, width, lanes, x1, y1, w1, x2, y2, w2, color) {

        var r1 = Render.rumbleWidth(w1, lanes),
            r2 = Render.rumbleWidth(w2, lanes),
            l1 = Render.laneMarkerWidth(w1, lanes),
            l2 = Render.laneMarkerWidth(w2, lanes),
            lanew1, lanew2, lanex1, lanex2, lane;
        //var gra=ctx.add.graphics();
        gra.fillStyle(color.grass);
        gra.fillRect(0, y2, width, y1 - y2);

        Render.polygon(gra, x1 - w1 - r1, y1, x1 - w1, y1, x2 - w2, y2, x2 - w2 - r2, y2, color.rumble);
        Render.polygon(gra, x1 + w1 + r1, y1, x1 + w1, y1, x2 + w2, y2, x2 + w2 + r2, y2, color.rumble);
        Render.polygon(gra, x1 - w1, y1, x1 + w1, y1, x2 + w2, y2, x2 - w2, y2, color.road);

        if (color.lane) {
            lanew1 = w1 * 2 / lanes;
            lanew2 = w2 * 2 / lanes;
            lanex1 = x1 - w1 + lanew1;
            lanex2 = x2 - w2 + lanew2;
            for (lane = 1; lane < lanes; lanex1 += lanew1, lanex2 += lanew2, lane++)
                Render.polygon(gra, lanex1 - l1 / 2, y1, lanex1 + l1 / 2, y1, lanex2 + l2 / 2, y2, lanex2 - l2 / 2, y2, color.lane);
        }

        //Render.fog(ctx, 0, y1, width, y2-y1, fog);
    },

    //---------------------------------------------------------------------------

    sprite: function (ctx, width, height, resolution, roadWidth, sprites, sprite, scale, destX, destY, offsetX, offsetY, clipY) {

        //  scale for projection AND relative to roadWidth (for tweakUI)
        var destW = (sprite.w * scale * width / 2) * (SPRITES.SCALE * roadWidth);
        var destH = (sprite.h * scale * width / 2) * (SPRITES.SCALE * roadWidth);

        destX = destX + (destW * (offsetX || 0));
        destY = destY + (destH * (offsetY || 0));

        var clipH = clipY ? Math.max(0, destY + destH - clipY) : 0;
        if (clipH < destH)
            ctx.drawImage(sprites, sprite.x, sprite.y, sprite.w, sprite.h - (sprite.h * clipH / destH), destX, destY, destW, destH - clipH);

    },

    //---------------------------------------------------------------------------

    player: function (ctx, width, height, resolution, roadWidth, sprites, speedPercent, scale, destX, destY, steer, updown) {

        var bounce = (1.5 * Math.random() * speedPercent * resolution) * Util.randomChoice([-1, 1]);
        var sprite;
        // if (steer < 0)
        //     sprite = (updown > 0) ? SPRITES.PLAYER_UPHILL_LEFT : SPRITES.PLAYER_LEFT;
        // else if (steer > 0)
        //     sprite = (updown > 0) ? SPRITES.PLAYER_UPHILL_RIGHT : SPRITES.PLAYER_RIGHT;
        // else
        //     sprite = (updown > 0) ? SPRITES.PLAYER_UPHILL_STRAIGHT : SPRITES.PLAYER_STRAIGHT;

        Render.sprite(ctx, width, height, resolution, roadWidth, sprites, sprite, scale, destX, destY + bounce, -0.5, -1);
    },

    rumbleWidth: function (projectedRoadWidth, lanes) { return projectedRoadWidth / Math.max(6, 2 * lanes); },
    laneMarkerWidth: function (projectedRoadWidth, lanes) { return projectedRoadWidth / Math.max(32, 8 * lanes); }

} 
