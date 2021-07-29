import {GameTable,Sprites} from "./classes.mjs";
/*GLOBALS*/
let canvas, ctx, canvasId
let playerNumber, roomExist = true
let roomid = 0
let gameStart = false
let gameController
let ssid
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

function handleLeftUser() {
    alert("Your opponent has left the match")
}

function handleRequestMove(state) {
    state = JSON.parse(state)
    gameController.desk.interact(gameController.desk.getEntity(state.fx, state.fy),gameController.desk.getEntity(state.sx, state.sy))
    if (gameController.desk.getPlayerById(gameController.playerNumber).isDead()) {
        socket.emit('gameOver', codeInput.value)
    }
    gameController.nowAct = !gameController.nowAct
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
    gameController.EndOfGame()
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
    gameController = new GameController(Math.floor( codeInput.value / 100 + huge ), playerNumber)
    gameController.desk.spawnPlayer(0,0, 0)
    gameController.desk.spawnPlayer(1,5,5)
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
    requestAnimationFrame(draw)
}

function mouseUpHandler(e) {
    if (e.button == 0 && e.target.id == 'myCanvas') {
        let xPos = e.offsetX;
        let yPos = e.offsetY;
        gameController.interact (xPos, yPos)
    }
}



class GameController {
    constructor(ssid, playerNumber) {
        this.playerNumber = playerNumber
        this.nowAct = (playerNumber === 1)
        Sprites.initial()
        console.log(ssid)
        this.desk = new GameTable(ssid,6,6,Sprites.tableImg,playerNumber);
    }

    interact(xPos, yPos) {
        console.log("interact for ", this.playerNumber)
        const player = this.desk.getPlayerById(this.playerNumber)
        console.log("\nplayer: ", player)
        let targetEntity = this.desk.getEntityByCoordinates(xPos,yPos);
        if (this.nowAct && this.desk.validMove(player, targetEntity)) { //getPlayer(ид нужного игрока)
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
        else
            resetHtmlStates()
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
