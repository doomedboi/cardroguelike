const CANVAS = document.getElementById("myCanvas");
const CTX = canvas.getContext("2d");
canvas.height = window.innerHeight;
canvas.width = 1000;
const WIDTH = canvas.width;
const HEIGHT = canvas.height;
const CELLSIZE = 160;
const Sprites = { //здесь находятся все объекты спрайтов.
    player1Img: new Image(),
    npcSkeleton: new Image(),
    //...
    //...
    initial() {//здесь они инициализируются. 
        //Возможно стоит вынести эти пути в отдельный файл json или сразу весь объект Sprites
        this.player1Img.src = "Textures/player_sprite.png";
        this.npcSkeleton.src = "Textures/enemy_t1.png";
        //...
        //...
    }
}
class GameTable {
    constructor(id, xPosition, yPosition, width, height, sprite){
        this.id = id;
        this.width = width;
        this.height = height;
        this.xPosition = xPosition;
        this.yPosition = yPosition;
        this.sprite = sprite;
        this.matrix = new Array(height).fill().map(() => new Array(width).fill());
        for(let y = 0; y<this.height;y++){
            for(let x = 0;x<this.width;x++){
                matrix[y][x] = new EmptyEntity('emptyEntity'+x+'-'+y, x,y,Sprites.emptyEntityImg);
            }
        }
    }
    draw(){
        for(let y = 0; y<this.height;y++){
            for(let x = 0;x<this.width;x++){
                this.matrix[y][x].draw();
            }
        }
    }
}
class Entity {
    constructor(id, xPosition, yPosition, sprite) {
        this.id = id;
        this.health = health;
        this.xPosition = xPosition;
        this.yPosition = yPosition;
        this.sprite = sprite;
    }
    getProperties() {
        return [this.name, this.position.x, this.position.y, this.width, this.height,this.sprite];
    }
}
class EmptyEntity {
    constructor(id, xPosition, yPosition, sprite){
        super(id, xPosition, yPosition, sprite)
    }
}


Sprites.initial();
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
}
function draw() {
    ctx.beginPath();
    ctx.clearRect(0, 0, canvas.width, canvas.height); // очищаем поверхность
    ctx.closePath();
}
setInterval(draw, 10); //задаем интервал главой функции.