import {GameTable,Sprites} from "./classes.mjs";
/*GLOBALS*/
let canvas, ctx, canvasId
let playerNumber, roomExist = true
let roomid = 0
let attemp = 0
let gameStart = false
let multiplayerGameController
let singlGameController
let ssid
let gameType = 'none'

function randomStr(len) {
    let result           = '';
    const characters       = '123456789';
    const charactersLength = characters.length;
    for ( let i = 0; i < len; i++ ) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return parseInt( result );
}

setInterval(()=> {
    console.log(ssid)}, 4000)
/*end globals*/

const socket = io('http://localhost:3000')

/* listen to init event with handler */
socket.on('init', handleInit)
socket.on('gameOverClient', handleGameOver)
socket.on('gameCode', handleGameCode)
socket.on('invalidGameToken', handleInvalidGame)
socket.on('tooManyPlayers', handleRoomIsFull)
socket.on('mustMove', handleRequestMove)
socket.on('generateGame', handleGenerateGame)
socket.on('left', handleLeftUser)
socket.on('getSSID', handleGetSSID)
/* end of init list */

/* init html elems */
const startScreen = document.getElementById("startScreen")
const gameScreen = document.getElementById("gameScreen")
const sinleplayerBtn = document.getElementById("singleplayerBtn")
const newGameBtn = document.getElementById("multiplayerBtn")
const codeInput = document.getElementById("joinGameId")
const joinGameBtn = document.getElementById("joinGameBtn")
const createdGameId = document.getElementById("createdGameId")
//const singlBtn = document.getElementById("singlBtn")
/*end of init */

/* listeners */
newGameBtn.addEventListener('click', startNewGame)
joinGameBtn.addEventListener('click', joinGame)
sinleplayerBtn.addEventListener('click', startSingl)
/*end listeners */


/* list of handlers */
function handleGenerateGame() {
    initGame()
}

function handleLeftUser() {
    alert("Your opponent has left the match")
}

function handleRequestMove(state) {
    state = JSON.parse(state)
    multiplayerGameController.desk.interact(multiplayerGameController.desk.getEntity(state.fx, state.fy),multiplayerGameController.desk.getEntity(state.sx, state.sy))
    if (multiplayerGameController.desk.getPlayerById(multiplayerGameController.playerNumber).isDead()) {
        socket.emit('gameOver', codeInput.value)
    }
    multiplayerGameController.nowAct = !multiplayerGameController.nowAct
}

function handleInvalidGame() {
    resetHtmlStates()
    alert("Invalid room token")
}

function handleRoomIsFull() {
    resetHtmlStates()
    alert("Room is full")
}

function handleInit(playerId) {
    playerNumber = playerId
}
//replace to GM
function handleGameOver() {
    console.log("here")
    multiplayerGameController.EndOfGame()
}

function handleGetSSID(code) {
    ssid = code
    console.log('lllll')
    console.log(code)
}

function generateSSID(room) {
    socket.emit('genSSID')
}

function handleGameCode(code) {
    createdGameId.style.display = "block"
    alert(code)
    codeInput.value = code
    createdGameId.innerText = code
}

/*end of list */

function initCanvas() {
    canvas = document.getElementById("myCanvas")
    ctx = canvas.getContext('2d')
    ctx.font = "30px serif";
    canvas.width = 1000
    canvas.height = innerHeight
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    requestAnimationFrame(draw)
}

function prepaireBefGame() {
    unhideMainPage()
    initCanvas()
}

function unhideMainPage() {
    startScreen.style.display = 'none'
    gameScreen.style.display = "block"
}



/* init game when players are ready */
function initGame(row, col, ssid) {
    const huge = 13371337
    attemp++
    multiplayerGameController = new MultiplayerGameController(Math.floor(attemp +  codeInput.value / 100 + huge ), 6, 6,playerNumber, true)
    multiplayerGameController.desk.spawnPlayer(0,0, 0)
    multiplayerGameController.desk.spawnPlayer(1,5,5)
    gameType = 'multiplayer'
    document.addEventListener("mouseup", mouseUpHandler, false);
    gameStart = true
}
function startNewGame() {
    //need to create new socket.io room
    socket.emit('newGame')
    prepaireBefGame()
}
function joinGame() {
    const roomId = codeInput.value
    socket.emit('joinRoom', roomId)
    prepaireBefGame()
    console.log('send req from this local')
    //check room have 2 players
    //send req to init game
    generateSSID(roomId)
    socket.emit('generateGame', roomId)
}

function resetAfterGame() {
    gameStart = false;
    gameType = 'none'
}

function resetHtmlStates() {
    gameScreen.style.display = 'none'
    startScreen.style.display = 'block'
    playerNumber = null
    codeInput.value = ""
}

function draw() {
    ctx.beginPath();
    ctx.clearRect(0, 0, canvas.width, canvas.height); // очищаем поверхность
    if (gameStart) {
        if (gameType === 'singl')
            singlGameController.desk.draw(ctx);
        else
            multiplayerGameController.desk.draw(ctx)
    }
    ctx.closePath();
    requestAnimationFrame(draw)
}

function mouseUpHandler(e) {
    if (e.button == 0 && e.target.id == 'myCanvas') {
        let xPos = e.offsetX;
        let yPos = e.offsetY;
        if (gameType === 'singl')
            singlGameController.interact (xPos, yPos)
        else
            multiplayerGameController.interact (xPos, yPos)
    }
}

class GameController {
    constructor(ssid, col, row, bMultiplayer) {
        Sprites.initial()
        this.desk = new GameTable(ssid,col,row,Sprites.tableImg,bMultiplayer);
        console.log(ssid)
    }

    interact(){}
    EndOfGame(){}
    requestMove(){}
}

class MultiplayerGameController extends GameController{
    constructor(ssid, col, row, playerNumber ,bMultiplayer) {
        super(ssid, col, row, bMultiplayer)
        this.playerNumber = playerNumber
        this.nowAct = (playerNumber === 1)
    }

    interact(xPos, yPos) {
        console.log("interact for ", this.playerNumber)
        const player = this.desk.getPlayerById(this.playerNumber)
        console.log("\nplayer: ", player)
        let targetEntity = this.desk.getEntityByCoordinates(xPos,yPos);
        if (this.nowAct && this.desk.validMove(player, targetEntity)) {
            this.requestMove(this.desk.matrix[player.x][player.y], this.desk.matrix[targetEntity.x][targetEntity.y])
        }
    }

    EndOfGame() {
        let winner = !this.desk.getPlayerById(this.playerNumber).isDead()
        if (confirm(winner? "You win\nDo you want to replay?" : "You lose\nDo you want to replay?")){
            prepaireBefGame()
            socket.emit('generateGame', codeInput.value)
            console.log('restart')
            //send to server want to restart
        }
        else {
            resetAfterGame()
            resetHtmlStates()
        }
    }

    requestMove(first, second) {
        const roomId = codeInput.value
        console.log(roomId)
        const obj1 = {fx: first.x, fy: first.y, sx: second.x, sy: second.y}
        const obj = JSON.stringify(obj1)
        console.log(obj)
        socket.emit('makeMove', roomId, obj) //need pass two args
    }

}

class GameControllerSingle extends GameController{
    constructor(ssid, col, row) {
        super(ssid, col, row, false)
    }

    interact(xPos, yPos) {
        const myPlayer = this.desk.getPlayerById(0)
        console.log("\nplayer: ", myPlayer)
        let targetEntity = this.desk.getEntityByCoordinates(xPos,yPos);
        if (this.desk.validMove(myPlayer, targetEntity)) { //getPlayer(ид нужного игрока)
            this.desk.interact(this.desk.matrix[myPlayer.x][myPlayer.y], this.desk.matrix[targetEntity.x][targetEntity.y])
            if (myPlayer.isDead())
                this.EndOfGame()
        }
    }

    EndOfGame() {
        if (confirm("It is not great you can do.\nAgain kiddo nuh?")){
            //call gameController.newCard() - еще не сделал)0
            startSingl()
        } else {
            resetAfterGame()
            resetHtmlStates()
        }

    }

}

function startSingl() {
    prepaireBefGame()
    singlGameController = new GameControllerSingle(parseInt( randomStr(10)),6, 6)
    singlGameController.desk.spawnPlayer(0,5,5)
    gameType = 'singl'
    gameStart = true
    document.addEventListener("mouseup", mouseUpHandler, false);
    requestAnimationFrame(draw)
}