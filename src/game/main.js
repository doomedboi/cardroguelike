//import { GameTable,EmptyEntity,Character,Structure} from "./classes";
//import { Sprites } from "./spritesLoader";
//const { FRAME } = require("../server/gConstans")

/*GLOBALS*/
let canvas, ctx, canvasId
let playerNumber, roomExist = true
/*end globals*/


const socket = io('http://localhost:3000')
/* listen to init event with handler */
socket.on('init', handleInit)
socket.on('gameState', handleGameStates)
socket.on('gameOver', handleGameOver)
socket.on('gameCode', handleGameCode)
socket.on('invalidGameToken', handleInvalidGame)
socket.on('tooManyPlayers', handleRoomIsFull)


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
    canvas.width = 1000
    canvas.height = 1000
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    canvasId = setInterval(draw, 10); //задаем интервал главой функции.
}

function startNewGame() {
    //need to create new socket.io room
    socket.emit('newGame')
    init()
}

function joinGame() {
    let state
    const roomId = codeInput.value
    socket.emit('joinRoom', roomId)
    init()
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
    ctx.closePath();
}
