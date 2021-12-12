//190910
/** 시작 / 준비버튼 */
var btnPlay
/** 호스트 / 게스트 */
var master
var player
var checkTime = ""
let gameTimer
var localTime
var updatedTime
var serverTime
var timeLimit
let autoEndGame = null
let gameDone = false

/**
 * 화면 모드 설정
 * @param  {boolean} isMaster
 * @param  {boolean} isMute
 */
function enterGame(user, isMute, btnPlay) {
    player = user
    master = user.master
    game.sound.mute = isMute
    btnPlay = btnPlay
    gameDone = false
}

//0초부터 시작하는 게임은 다른 상태일때 강제로 종료해주기 위해서 0초 게임인지를 먼저 받아온다.
function setAutoEndGame(autoRunFlag) {
    if (autoEndGame === null && autoRunFlag) {
        autoEndGame = autoRunFlag
    } else {
        autoEndGame = null
    }
}

/**
 * 화면 버튼 설정
 */
function prepareGame() {
    // 마스터 변수가 존재 한다면
    if (master !== undefined) {
        btnPlay = introScene.add.sprite(
            game.config.width * 0.5,
            game.config.height * 0.5 + 300,
            //호스트가 아닌 플레이어일 경우 레디버튼 출력
            master ? "start_off" : "ready_on"
        )
        btnPlay.depth = 3
        btnPlay.displayWidth = 310
        btnPlay.displayHeight = 140
        // 버튼이 활성화 되면 도움말 버튼을 출력한다.
        btnHelp = introScene.add.image(90, 70, "btn_help")
        btnHelp.depth = 11
        btnHelp.displayWidth = 60
        btnHelp.displayHeight = 60
        btnHelp.setInteractive().on("pointerdown", introScene.helpToggle, introScene)
        // 게임 호스트 이므로 소켓에 준비 완료 요청을 보낸다.
        if (master) {
            sendPostMessage("app.game.prepare", gameOptions)
            // 게이스트 이므로 준비를 눌렀을 때 준비완료 요청을 보낸다.
        } else {
            btnPlay.setInteractive()
            btnPlay.on("pointerdown", function () {
                sendPostMessage("app.game.prepare", gameOptions)
                btnPlay.setTexture("ready_off")
            })
        }
    }
}
/**
 * 모든 참가자가 준비되었을때 게임을 시작한다.
 */
function readyGame() {
    if (master) {
        btnPlay.setTexture("start_on")
        btnPlay.setInteractive()
        btnPlay.on("pointerdown", function () {
            sendPostMessage("app.game.start", { restart: false })
        })
    }
}
/**
 * 사운드 제어
 */
function setMute(mute) {
    game.sound.mute = mute || !game.sound.mute
}

/**
 * 게임을 시작한다
 */
function startGame(restart) {
    endGameTimer()
    btnPlay.destroy()
    window.introScene.title.destroy()
    window.introScene.time.delayedCall(0, window.introScene.Msg, [], window.introScene)
    window.introScene.start(master, restart)
    sendPostMessage("app.game.started")
    if (gameDone) {
        gameDone = false
    }
}
//벌칙생성
let pBody = ["이마에", "미간에", "눈에", "뺨에", "코에", "인중에", "입술에", "귀에", "목에", "어깨에", "등에", "가슴에", "허리에", "옆구리에", "배꼽에", "팔꿈치에", "손등에", "손바닥에", "허벅지에", "종아리에", "마음에 드는 부위에"]
let pAction = ["터치해", "뽀뽀해", "키스해", "포옹해", "쓰다듬어", "꼬집어", "때려", "안마해", "핥아"]
let pTime = ["3초", "10초", "30초"]
// 꼴등은 1등의 'pBody'에 'pTime'동안 'pAction'주세요.
function genPenalty(a) {
    return a[Math.floor(Math.random() * a.length)]
}

/**
 * 게임 종료하면서 점수와 시간을 전달한다.
 * @param {number} score
 * @param {number} time
 */
function endGame(score, time) {
    gameDone = true
    if (timeLimit === 0) {
        endGameTimer()
    }

    var isPenalty
    if (master) {
        //마스터일때 벌칙 생성
        isPenalty = `꼴등은 1등의 ${genPenalty(pBody)}\n ${genPenalty(pTime)} 동안\n` + genPenalty(pAction) + "주세요."
    }
    sendPostMessage("app.game.end", {
        score,
        time,
        penalty: `${isPenalty}`
    })
    //console.log(getPenalty);
    setAutoEndGame(false)
}

/**
 * 게임중 점수 획득시 점수와 시간, 벌칙을 전달한다.
 * @param {number} score
 * @param {number} time
 */
function gameScore(data) {
    sendPostMessage("app.game.score", data)
}

/**
 * 게임중인 유저들의 점수 목록을 가져온다.
 * @param {Array} list
 */
function gameData(list) {
    console.log("list: ", list)
    ranking = list
    // sendPostMessage('app.game.debug', list);

    if (gameScene.getGameData) {
        gameScene.getGameData(list, player)
    }
}

function setTime(time) {
    sendPostMessage("app.game.time", { time: time })
    serverTime = null
    localTime = time * 1000
    timeLimit = time
    //로컬테스트용
    // if (!serverTime) {
    // 	serverTime = new Date();
    // 	startTimer();
    // }
}

function startTimer() {
    var start = new Date().getTime()
    gameTimer && clearInterval(gameTimer)
    gameTimer = setInterval(function () {
        var remain
        if (updatedTime) {
            const time = updatedTime - serverTime
            remain = remain > time ? remain : time
        } else {
            remain = new Date().getTime() - start
        }
        localTime = timeLimit > 0 ? timeLimit * 1000 - remain : remain
        if (localTime < 0) {
            clearInterval(gameTimer)
            localTime = 0
        }

        textTime(localTime)
        updatedTime = null
    }, 10)
}

function gameTime(time) {
    if (!serverTime) {
        serverTime = time
        startTimer()
    }
    updatedTime = time
}

function getLocalTime(time) {
    serverTime = time
    timeLimit = time
    startTimer()
}

function textTime(time) {
    // 시작이랑 종료시점이 소켓 타이머에서 하는 것으로 마무리. 1s마다 소켓에서 타이머 호출
    let format = 0
    if (time > 60 * 1000) {
        format = moment.utc(time).format("mm:ss:SS")
    } else {
        format = moment.utc(time).format("ss:SS")
    }
    gameScene.gameTime(format, time)
}

function endGameTimer() {
    // 게임 타이머 종료
    if (gameTimer !== null) {
        clearInterval(gameTimer)
    }
}

function activeState(status) {
    if (!status && autoEndGame) {
        autoEnd()
    }
}

function autoEnd() {
    endGame(0, 0)
}

/**
 * 네이티브에 메세지를 보낸다.
 * @param {string} event
 * @param {object} data
 */

function sendPostMessage(event, data) {
    if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(JSON.stringify({ event, data }))
    }
}

function resize() {
    var container = document.getElementById("thegame")
    var defaultWidth = 640
    var defaultHeight = 960
    var windowWidth = window.innerWidth
    var windowHeight = window.innerHeight
    var dynamicWidth = (defaultWidth * windowHeight) / defaultHeight
    container.style.boxSizing = "border-box"
    container.style.width = dynamicWidth + "px"
    container.style.height = "100%"
    container.style.border = "5px solid blue"
    // container.style.marginLeft = (windowWidth - dynamicWidth) * 0.5 + "px"
}

resize()
window.addEventListener("resize", resize)

/**
 * 만약 앱에서 호출된 페이지라면 마스터 변수가 존재하지 않으므로 설정해준다.
 */
window.addEventListener("load", function () {
    setTimeout(function () {
        if (master === undefined) {
            /**
             * id: "mAC_uKuUOtbchfPPAAAA"
             * master: true
             * nickname: "2222"
             */
            enterGame({ master: true, id: "test" })
            prepareGame()
            readyGame()
            btnPlay.on("pointerdown", function () {
                startGame()
            })
        }
    }, 2000)
})

window.addEventListener("beforeunload", function () {
    endGameTimer()
})
