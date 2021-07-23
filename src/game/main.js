//import { GameTable,EmptyEntity,Character,Structure} from "./classes";
//import { Sprites } from "./spritesLoader";
const { FRAME } = require("../server/gConstans")
/*GLOBALS*/
const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");
const CELLSIZE = 160;
const WIDTH = innerWidth;
const HEIGHT = innerHeight;
/*end globals*/

//param: url to connect
const socket = io('http://localhost:3000')
/* listen to init event with handler */
socket.on('init', handleInit)
socket.on('gamestate', handleGameStates)
/*canvas init*/
canvas.height = HEIGHT;
canvas.width = 1000;

function handleInit(e) {
    console.log(e)
}

//receive new game state from the server
function handleGameStates(state) {
    state = JSON.parse(state)
    requestAnimationFrame(()=> GameDraw(state))
}

//function to draw every frame
function GameDraw(){}

/*Sprites.initial();
document.addEventListener("mousedown", mouseDownHandler, false);
document.addEventListener("mouseup", mouseUpHandler, false);
let mouseLeftPressed = false;
function mouseDownHandler(e) {
    if (e.button == 0 && e.target.id == 'myCanvas') {
        mouseLeftPressed = true;
    }
}
function mouseUpHandler(e) {
    if (e.button == 0) {
        mouseLeftPressed = false;
    }
} */
function draw() {
    ctx.beginPath();
    ctx.clearRect(0, 0, canvas.width, canvas.height); // очищаем поверхность
    ctx.closePath();
}
setInterval(draw, FRAME); //задаем интервал главой функции.