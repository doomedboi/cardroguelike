import {GameTable,Sprites} from "./classes.mjs";
/*GLOBALS*/
const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");
ctx.font = "30px serif";
const FRAME = 10;
/*end globals*/
/*canvas init*/
canvas.height = 1000;
canvas.width = 1000;

Sprites.initial();
let desk = new GameTable(93930492,6,6,Sprites.tableImg);
desk.spawnPlayer(0,0);


//document.addEventListener("mousedown", mouseDownHandler, false);
document.addEventListener("mouseup", mouseUpHandler, false);

function mouseUpHandler(e) {
    if (e.button == 0 && e.target.id == 'myCanvas') {
        let Xpos = e.offsetX;
        let Ypos = e.offsetY;
        //сдесь нужно будет передавать эти координаты геймконтроллеру, но его пока нет, так что обрабатываем грубо
        let targetEntity = desk.getEntityByCoordinates(Xpos,Ypos);
        desk.interact(desk.getPlayer1(),targetEntity);
    }
}
function draw() {
    ctx.beginPath();
    ctx.clearRect(0, 0, canvas.width, canvas.height); // очищаем поверхность
    desk.draw(ctx);
    ctx.closePath();
}
setInterval(draw, FRAME); //задаем интервал главой функции.