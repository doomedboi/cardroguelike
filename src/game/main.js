
import {GameTable,Sprites} from "./classes.mjs";
/*GLOBALS*/
let canvas, ctx, canvasId
let playerNumber, roomExist = true
let roomid = 0
let desk, gameStart = false
/*end globals*/


const socket = io('http://localhost:3000')
/* listen to init event with handler */
socket.on('init', handleInit)
socket.on('gameState', handleGameStates)
socket.on('gameOver', handleGameOver)
socket.on('gameCode', handleGameCode)
socket.on('invalidGameToken', handleInvalidGame)
socket.on('tooManyPlayers', handleRoomIsFull)
socket.on('mustMove', handleRequestMove)
socket.on('generateGame', handleGenerateGame)

function handleGenerateGame() {
    initGame()
}


/* init html elems */
const startScreen = document.getElementById("startScreen")
const gameScreen = document.getElementById("gameScreen")
const newGameBtn = document.getElementById("newGameBtn")
const codeInput = document.getElementById("joinGameId")
const joinGameBtn = document.getElementById("joinGameBtn")
const createdGameId = document.getElementById("createdGameId")
/*end of init */

newGameBtn.addEventListener('click', startNewGame)
joinGameBtn.addEventListener('click', joinGame)

function init() {
    startScreen.style.display = 'none'
    gameScreen.style.display = "block"
    canvas = document.getElementById("myCanvas")
    ctx = canvas.getContext('2d')
    ctx.font = "30px serif";
    canvas.width = 1000
    canvas.height = 1000
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    canvasId = setInterval(draw, 10); //задаем интервал главой функции.
}

function handleRequestMove(state) {
    state = JSON.parse(state)
    console.log(state.f)
    desk.interact(desk.getEntity(state.fx, state.fy), desk.getEntity(state.sx, state.sy))
    //call interact(state)

}

//send to server msg to init both players game

function initGame(row, col, ssid) {
    Sprites.initial();
    desk = new GameTable(93930491,6,6,Sprites.tableImg);
    desk.spawnPlayer(0,0);
    document.addEventListener("mouseup", mouseUpHandler, false);
    gameStart = true
}

//TODO: call after my own move
function requestMove(first, second) {
    console.log('Im reqvesting move')
    const roomId = codeInput.value
    const obj1 = {fx: first.x,fy: first.y, sx: second.x, sy: second.y}
    const obj = JSON.stringify(obj1)
    console.log(obj)
    socket.emit('makeMove', roomId, obj) //need pass two args
}

function startNewGame() {
    //need to create new socket.io room
    socket.emit('newGame')
    init()
}

function clientInteract(player, dst) {
    requestMove(desk.matrix[player.x][player.y], desk.matrix[dst.x][dst.y])
}

function joinGame() {
    let state
    const roomId = codeInput.value
    socket.emit('joinRoom', roomId)
    init()
    console.log('send req from this local')
    //send req to init game
    socket.emit('generateGame', roomId)
}

function reset() {
    gameScreen.style.display = 'none'
    startScreen.style.display = 'block'
    playerNumber = null
    codeInput.value = ""
}

function handleInvalidGame() {
    reset()
    alert("Invalid room token")
}

function handleRoomIsFull() {
    reset()
    alert("Room is full")
}

function handleInit(playerId) {
    playerNumber = playerId
}

function handleGameOver() {
    alert("Looose")
}

function handleGameCode(code) {
    createdGameId.style.display = "block"
    alert(code)
    createdGameId.innerText = code
}

//receive new game state from the server
function handleGameStates(state) {
    state = JSON.parse(state)
    requestAnimationFrame(()=> GameDraw(state))
}

function handleEndOfGame(data) {
    data = JSON.parse(data)
    if (data.winId === playerNumber) {
        alert("You win kiddo")
    } else {
        alert("You lose")
    }
}

//function to draw every frame
function GameDraw(){}


function draw() {
    ctx.beginPath();
    ctx.clearRect(0, 0, canvas.width, canvas.height); // очищаем поверхность
    if (gameStart)
        desk.draw(ctx);
    ctx.closePath();
}

function mouseUpHandler(e) {
    if (e.button == 0 && e.target.id == 'myCanvas') {
        let Xpos = e.offsetX;
        let Ypos = e.offsetY;
        //сдесь нужно будет передавать эти координаты геймконтроллеру, но его пока нет, так что обрабатываем грубо
        let targetEntity = desk.getEntityByCoordinates(Xpos,Ypos);
        clientInteract(desk.getPlayer1(),targetEntity)
        //desk.interact(desk.getPlayer1(),targetEntity);
    }
}

//setInterval(draw, 10)