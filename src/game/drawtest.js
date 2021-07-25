//import { GameTable,EmptyEntity,Character,Structure,Player,Monster,Sprites} from "./classes";
/*GLOBALS*/
import { Sprites } from "./spritesLoader";
//Sprites = require("./spritesLoader");
const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");
const CELLSIZE = 160;
const FRAME = 10;
const WIDTH = innerWidth;
const HEIGHT = innerHeight;
/*end globals*/
/*canvas init*/
canvas.height = 1000;
canvas.width = 1000;


Sprites.initial();
//DESK = new GameTable('id1',6,6,Sprites.tableImg);
function draw() {
    ctx.beginPath();
    ctx.clearRect(0, 0, canvas.width, canvas.height); // очищаем поверхность
    //DESK.draw(ctx);
    ctx.closePath();
}
setInterval(draw, FRAME); //задаем интервал главой функции.