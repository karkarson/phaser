let game;
var gameOptions = {
  timeLimit: 30,
};

// let rbc;
window.onload = function () {
  // 게임설정
  window.introScene = new IntroScene();
  window.gameScene = new GameScene();

  let gameConfig = {
    type: Phaser.CANVAS,
    scale: {
      mode: Phaser.Scale.CENTER_BOTH,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      parent: "thegame",
      width: 640,
      height: 960,
    },
    scene: [introScene, gameScene],
  };

  // 컨피그를 토대로 새로운 게임을 생성.
  game = new Phaser.Game(gameConfig);
  setTimeout(window.prepareGame, 1000, true);
  window.focus();
};

//프리로딩 및 타이틀 출력, 씬 시
class IntroScene extends Phaser.Scene {
  constructor() {
    super("intro");
  }

  preload() {
    //버튼 및 사운드, 비트맵 폰트 등의 공용요소
    this.load.image("start_on", "../../commons/assets/btn_start_on.png");
    this.load.image("start_off", "../../commons/assets/btn_start_off.png");
    this.load.image("ready_on", "../../commons/assets/btn_ready_on.png");
    this.load.image("ready_off", "../../commons/assets/btn_ready_off.png");
    this.load.image("btn_help", "../../commons/assets/btn_help.png");
    this.load.image("ready_msg", "../../commons/assets/ready.png");
    this.load.image("go_msg", "../../commons/assets/go.png");
    this.load.audio("ready", "../../commons/assets/ready.mp3");
    this.load.audio("go", "../../commons/assets/go.mp3");
    this.load.audio("timeup", "../../commons/assets/timeup.mp3");
    this.load.bitmapFont(
      "font",
      "../../commons/assets/font.png",
      "../../commons/assets/font.fnt"
    );

    //게임별 요소
    this.load.image("splash", "assets/splash.png");
    this.load.image("help", "assets/help.png");
    this.load.spritesheet("blockOn", "assets/block_on.png", {
      frameWidth: 360,
      frameHeight: 360,
    });
    this.load.spritesheet("blockOff", "assets/block_off.png", {
      frameWidth: 360,
      frameHeight: 360,
    });
    this.load.spritesheet("fx", "assets/fx.png", {
      frameWidth: 182,
      frameHeight: 206,
    });

    this.load.image("stage", "assets/stage.png");
    this.load.image("p_icon", "assets/point_icon.png");
    this.load.audio("bg01", "assets/bg02.mp3");
    this.load.audio("hit", "assets/hit.mp3");
    this.load.audio("fail", "assets/fail.mp3");
    this.load.audio("door", "assets/door.mp3");
    this.load.audio("done", "assets/done.mp3");

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
      text: "Loading...",
      style: {
        font: "20px monospace",
        fill: "#ffffff",
      },
    });
    loadingText.setOrigin(0.5, 0.5);
    //퍼센트 텍스트 출력
    var percentText = this.make.text({
      x: width / 2,
      y: height / 2 - 5,
      text: "0%",
      style: {
        font: "18px monospace",
        fill: "#ffffff",
      },
    });
    percentText.setOrigin(0.5, 0.5);
    //에셋 텍스트 출력
    var assetText = this.make.text({
      x: width / 2,
      y: height / 2 + 50,
      text: "",
      style: {
        font: "18px monospace",
        fill: "#ffffff",
      },
    });
    assetText.setOrigin(0.5, 0.5);

    this.load.on("progress", function (value) {
      percentText.setText(parseInt(value * 100) + "%");
      progressBar.clear();
      progressBar.fillStyle(0xffffff, 1);
      progressBar.fillRect(170, 460, 300 * value, 30);
    });

    this.load.on("fileprogress", function (file) {
      assetText.setText("Loading asset: " + file.src);
    });

    this.load.on("complete", function () {
      //로드가 완료되면 프로그레스 삭제
      console.log("로딩완료");
      progressBar.destroy();
      progressBox.destroy();
      loadingText.destroy();
      percentText.destroy();
      assetText.destroy();
      sendPostMessage("app.game.loaded");
    });
  }
  //게임 재시작을 위해 배경음 분리
  bgm() {
    console.log("play sound");
    //BGM시작
    var bgm = this.sound.add("bg01", {
      volume: 0.5,
      loop: true,
    });
    bgm.play();
  }
  //게임 시작시 호출 마스터 및 재시작 상태 판단.
  start(master, restart) {
    this.scene.start("game", { restart: restart });
  }
  create() {
    //도움말 관련 버튼 및 이미지
    this.help = this.add.image(
      game.config.width / 2,
      game.config.height / 2,
      "help"
    );
    this.help.depth = 10;
    this.help.visible = false;

    this.title = this.add.image(
      game.config.width / 2,
      game.config.height / 2,
      "splash"
    );
    this.title.displayWidth = game.config.width;
    this.title.displayHeight = game.config.height;
    this.title.depth = 1;
    //도움말
    var helpTxt = this.add
      .bitmapText(
        game.config.width / 2,
        640,
        "font",
        "숫자를 순서대로 눌러\n이상한 문을 통과하세요.",
        30
      )
      .setOrigin(0.5);
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

  Msg() {
    // 준비 메시지 출력
    let ready;
    let go;
    setTimeout(() => {
      //레디 음성과 이미지 출력
      ready = this.add.image(
        game.config.width / 2,
        game.config.height / 2,
        "ready_msg"
      );
      ready.depth = 999;
      const sound_ready = this.sound.add("ready");
      sound_ready.play();
    }, 0);

    setTimeout(() => {
      ////고 음성과 이미지 출력
      ready.destroy();
      go = this.add.image(
        game.config.width / 2,
        game.config.height / 2,
        "go_msg"
      );
      go.depth = 999;
      const sound_go = this.sound.add("go");
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
    this.arr = [...Array(25).keys()];
    this.good = 0;
    this.bad = 0;
    this.remainTime = 0;

    this.textList = [];
    this.idx = 1;
    this.resultTime = 0;

    this.cardLocations = [
      [100, 0],
      [210, 0],
      [320, 0],
      [430, 0],
      [540, 0],
      [100, 110],
      [210, 110],
      [320, 110],
      [430, 110],
      [540, 110],
      [100, 230],
      [210, 230],
      [320, 230],
      [430, 230],
      [540, 230],
      [100, 350],
      [210, 350],
      [320, 350],
      [430, 350],
      [540, 350],
      [100, 470],
      [210, 470],
      [320, 470],
      [430, 470],
      [540, 470],
    ];
    this.rand = [...this.arr].map((n) => n + 1);
    this.cardList = [];
    this.addStage();
    this.Msg();
    // 스코어를 따로 계산 안하는 게임
    // 시간 및 스코어 출력
    this.timerText = this.add.bitmapText(
      60,
      30,
      "font",
      `${gameOptions.timeLimit.toString()}:00`,
      52
    );
    this.gen_blockCard();

    // 게임 생성 후 게임 시작
    setTimeout(() => {
      this.startGame();
    }, 2000);

    // 재시작 여부 판단하여 배경음 플레이
    options.restart && introScene.bgm();
    this.lastTime = 0;
    this.canClick = false;
    this.gameDone = false;
  }
  gen_blockCard() {
    // 랜덤 숫자 버튼과 텍스트를 배치하는 로직
    this.arr.map((v, i) => {
      this.blockCard = "blockOn";
      let card = this.add
        .sprite(game.config.width / 2, game.config.height / 2, this.blockCard)
        .setInteractive();
      const randn = Number(
        this.rand
          .splice(Math.floor(Math.random() * this.rand.length), 1)
          .toString()
      );
      card.index = randn;
      card.displayWidth = 100;
      card.displayHeight = 100;
      card.x = card.originalX = this.cardLocations[i][0];
      card.y = card.originalY = this.cardLocations[i][1];
      card.y = card.originalY + card.height * 2;
      card.on(
        "pointerdown",
        function (i) {
          //console.log(card.index);
          this.clickHandler(card.index);
        },
        this
      );
      let text = this.add
        .bitmapText(card.x, card.y, "font", randn, 40)
        .setOrigin(0.5);
      text.depth = 2;
      text.align = 1;
      this.cardList[randn] = card;
      this.textList[randn] = text;
    });
  }

  clickHandler(i) {
    if (this.canClick && this.timer < gameOptions.timeLimit) {
      this.blockCard = "blockOff";
      let card = this.cardList[i];
      if (card.texture.key !== "blockoff") {
        if (this.idx === i) {
          if (this.idx < this.arr.length || this.idx === this.arr.length) {
            this.idx++;
            this.good += 1;

            const soundHit = this.sound.add("hit");
            card.setTexture(this.blockCard);
            let text = this.textList[i];
            text.setText("");
            soundHit.play();
            window.gameScore({ score: `${this.timerText.text}`, time: 0 });
            //이펙트 추가
            this.ani_fx = this.add.sprite(
              game.config.width / 2,
              game.config.height / 2,
              "fx"
            );
            this.ani_fx.displayWidth = 180;
            this.ani_fx.displayHeight = 180;
            this.ani_fx.x = card.x;
            this.ani_fx.y = card.y;
            this.anims.create({
              key: "anifx",
              frames: this.anims.generateFrameNumbers("fx"),
              yoyo: false,
              frameRate: 30, //재생속도 기본 30
              hideOnComplete: true,
            });
            this.ani_fx.anims.play("anifx");
            if (this.idx === this.arr.length + 1) {
              const soundDone = this.sound.add("done");
              soundDone.play();
              const soundDoor = this.sound.add("door");
              soundDoor.play();
              if (this.timerEvent !== null) {
                this.timerEvent.remove();
              }

              this.tweens.add(
                {
                  targets: this.cardList,
                  alpha: 0,
                  duration: 1000,
                  ease: "Power2",
                },
                this
              );
              this.soundEvent = this.time.delayedCall(
                2000,
                this.allStopSound,
                [],
                this
              );
              this.gameOver();
            }
          }
        } else if (this.idx < i) {
          this.bad += 1;
          const soundFail = this.sound.add("fail");
          this.cameras.main.shake(300);
          soundFail.play();
          window.gameScore({ score: `${this.timerText.text}`, time: 0 });
        }
      }
    }
    console.log("굿:", this.good, "배드", this.bad);
  }

  startGame() {
    // 게임 시작 관련 로직
    this.time.addEvent({
      delay: this.enemyDelay,
      callback: this.showEnemy,
      callbackScope: this,
    });

    window.setTime(gameOptions.timeLimit);
  }

  gameTime(format, time) {
    this.timerText.text = format;
    if (time === 0) {
      console.log("게임끝");
      const sound_timeup = this.sound.add("timeup");
      sound_timeup.play();

      this.soundEvent = this.time.delayedCall(
        1000,
        this.allStopSound,
        [],
        this
      );
      this.gameOver();
    }
  }

  changeFormatTime(timeFormat) {
    if (timeFormat !== 0) {
      return parseInt(timeFormat.replace(":", ""));
    } else {
      return 0;
    }
  }

  gameOver() {
    if (!this.gameDone) {
      console.log("게임오버");
      this.score = this.good;
      this.timeScore = this.changeFormatTime(this.timerText.text);
      this.endScore = this.score + this.timeScore;
      window.endGame(this.endScore, this.timerText.text);
      console.log(this.endScore, this.timerText.text);
      //console.log(this.score);
      //종료 대기 메시지
      var helpTxt = this.add
        .bitmapText(
          game.config.width / 2,
          game.config.height / 2,
          "font",
          "다른 유저가 플레이 중\n잠시만 기다려 주세요!",
          30
        )
        .setOrigin(0.5);
      helpTxt.depth = 2;
      helpTxt.align = 1;
      this.gameDone = true;
    }
  }

  allStopSound() {
    this.sound.stopAll();
  }

  addStage() {
    // 배경 생성
    this.world = this.add.image(0, 0, "stage");
    this.world.displayWidth = game.config.width;
    this.world.setOrigin(0, 0);
  }

  update() {
    //console.log(this.timerText.text);
  }
  render() {}
}
