import {GameTable,Sprites} from "./classes.mjs";
/*GLOBALS*/
let canvas, ctx, canvasId
let playerNumber, roomExist = true
let roomid = 0
let gameStart = false
let gameController
/*end globals*/

const socket = io('http://localhost:3000')

/* listen to init event with handler */
socket.on('init', handleInit)
socket.on('gameOver', handleGameOver)
socket.on('gameCode', handleGameCode)
socket.on('invalidGameToken', handleInvalidGame)
socket.on('tooManyPlayers', handleRoomIsFull)
socket.on('mustMove', handleRequestMove)
socket.on('generateGame', handleGenerateGame)
/* end of init list */

/* init html elems */
const startScreen = document.getElementById("startScreen")
const gameScreen = document.getElementById("gameScreen")
const newGameBtn = document.getElementById("newGameBtn")
const codeInput = document.getElementById("joinGameId")
const joinGameBtn = document.getElementById("joinGameBtn")
const createdGameId = document.getElementById("createdGameId")
/*end of init */

/* listeners */
newGameBtn.addEventListener('click', startNewGame)
joinGameBtn.addEventListener('click', joinGame)
/*end listeners */

/* list of handlers */
function handleGenerateGame() {
    initGame()
}

function handleRequestMove(state) {
    state = JSON.parse(state)
    gameController.desk.interact(gameController.desk.getEntity(state.fx, state.fy),gameController.desk.getEntity(state.sx, state.sy))
    // switch id's to let make move other player
    gameController.playerNumber = ( gameController.playerNumber + 1 ) % 2

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
    alert("Looose")
}

function handleGameCode(code) {
    createdGameId.style.display = "block"
    alert(code)
    codeInput.value = code
    createdGameId.innerText = code
}

function handleEndOfGame(data) {
    data = JSON.parse(data)
    if (data.winId === playerNumber) {
        alert("You win kiddo")
    } else {
        alert("You lose")
    }
}
/*end of list */

function initCanvas() {
    canvas = document.getElementById("myCanvas")
    ctx = canvas.getContext('2d')
    ctx.font = "30px serif";
    canvas.width = 1000
    canvas.height = 1000
    ctx.fillRect(0, 0, canvas.width, canvas.height)
}

function prepaireBefGame() {
    unhideMainPage()
    initCanvas()
    canvasId = setInterval(draw, 1000 / 10); //1 ms / frame count in sec = 1 frame interval
}

function unhideMainPage() {
    startScreen.style.display = 'none'
    gameScreen.style.display = "block"
}


/* init game when players are ready */
function initGame(row, col, ssid) {
    gameController = new GameController(playerNumber)
    gameController.desk.spawnPlayer(0,0);
    document.addEventListener("mouseup", mouseUpHandler, false);
    gameStart = true

    setInterval( ()=> {
        console.log('ID:')
        console.log(gameController.playerNumber)
    }, 1000)
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
    //send req to init game
    socket.emit('generateGame', roomId)
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
    if (gameStart)
        gameController.desk.draw(ctx);
    ctx.closePath();
}

function mouseUpHandler(e) {
    if (e.button == 0 && e.target.id == 'myCanvas') {
        let xPos = e.offsetX;
        let yPos = e.offsetY;
        gameController.interact (xPos, yPos)
    }
}

class GameController {
    constructor(playerNumber) {
        this.playerNumber = playerNumber
        Sprites.initial();
        this.desk = new GameTable(93930491,6,6,Sprites.tableImg);
    }

    interact(xPos, yPos) {
        let targetEntity = this.desk.getEntityByCoordinates(xPos,yPos);
        if (this.playerNumber === 1 && this.desk.validMove(this.desk.getPlayer1(), targetEntity)) { //getPlayer(ид нужного игрока)
            this.requestMove(this.desk.matrix[this.desk.getPlayer1().x][this.desk.getPlayer1().y], this.desk.matrix[targetEntity.x][targetEntity.y])
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
