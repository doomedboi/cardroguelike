export const Sprites = { //здесь находятся все объекты спрайтов. !!В БУДУЩЕМ ПЕРЕДЕЛАТЬ В СИНГЛТОН КЛАСС
    desk: new Image(),
    emptyEntityImg: new Image(),
    tableImg: new Image(),
    player1Img: new Image(),
    characterBackground: new Image(),
    npcSkeleton: new Image(),
    coins: new Image(),
    barrel: new Image(),
    weapon: new Image(),
    potion: new Image(),
    trap: new Image(),
    entityBackground: new Image(),
    player2Img: new Image(),
    necromancer: new Image(),
    vermin: new Image(),
    greenframe: new Image(),
    shield1: new Image(),
    shieldHUD: new Image(),
    playerHUD: new Image(),
    trader: new Image(),
    //...
    //...
    initial() {//здесь они инициализируются. 
        //Возможно стоит вынести эти пути в отдельный файл json
        this.desk.src = "resources/Desk.png"
        this.characterBackground.src = "resources/Character_background.png";
        this.player1Img.src = "resources/Player1.png";
        this.player2Img.src = "resources/Player2.png";
        this.npcSkeleton.src = "resources/Skeleton.png";
        this.emptyEntityImg.src = "resources/EmptyEntity.png";
        this.tableImg.src = "resources/Table.png";
        this.coins.src = "resources/Coins.png";
        this.barrel.src = "resources/Barrel.png";
        this.weapon.src = "resources/Weapon.png";
        this.trap.src = "resources/Trap.png";
        this.potion.src = "resources/Potion.png";
        this.entityBackground.src = "resources/Entity_background.png";
        this.necromancer.src = "resources/Necromancer.png";
        this.vermin.src = "resources/Vermin.png";
        this.greenframe.src = "resources/Green.png";
        this.shield1.src = "resources/Shield1.png";
        this.shieldHUD.src = "resources/ShieldHUD.png";
        this.playerHUD.src = "resources/PlayerHUD.png";
        this.trader.src ="resources/Trader.png";
        //...
        //...
    }
}
export class GameTable {//класс игрового стола, и его событий
    static COUNTS_OF_ENTITYES = 8;
    static ENUM_ENTITYES = {
        0: "Monster",
        1: "Weapon",
        2: "Coins",
        3: "Barrel",
        4: "Potion",
        5: "Trap",
        6: "Shield",
        7: "Trader",
        //...
    };
    static CELLSIZE = 100;
    static XABSOLUTE = 220;//эти координаты относительно начала canvas, верхняя левая точка от которой рисуется все поле.
    static YABSOLUTE = 20;
    constructor(seed, width, height, sprite = Sprites.tableImg,PlayerNumber) {
        this.playerNumber = PlayerNumber;
        this.turn = 0;
        this.NearEntityes = false;
        this.RandomCalls = 0;
        this.seed = seed;
        this.width = width;
        this.height = height;
        this.sprite = sprite;
        this.traderOnDesk = false;
        this.matrix = new Array(height).fill().map(() => new Array(width).fill());
        for (let x = 0; x < this.width; x++) {
            for (let y = 0; y < this.height; y++) {
                this.generateEntity(x,y);
            }
        }
    }
    validMove(src, dst) {
        console.log(src)
        console.log(dst)
        if (Math.abs( dst.y - src.y ) === 1 && dst.x - src.x === 0)
            return true
        if (Math.abs(dst.y - src.y) === 0 && Math.abs( dst.x - src.x ) === 1)
            return true
        return false
    }
    deleteEntity(someEntity, filingDirection = EmptyEntity.DIRECTION.ABOWE) {
        this.matrix[someEntity.x][someEntity.y] = new EmptyEntity("someID", someEntity.x, someEntity.y, Sprites.emptyEntityImg, filingDirection);
    }
    moveEntity(movableEntity, x, y) {
        let properties = movableEntity.getProperties();
        if (!(this.matrix[x][y].EntityType === "EmptyEntity")) throw new Error("MoveEntity в непустую клетку");
        let fillingDirection = EmptyEntity.getDirection(movableEntity.x, movableEntity.y, x, y);
        this.matrix[x][y] = movableEntity;
        movableEntity.x = x;
        movableEntity.y = y;
        this.matrix[properties.x][properties.y] = new EmptyEntity("someID", properties.x, properties.y, Sprites.emptyEntityImg, fillingDirection);

        let nextMovableEntity = this.getNextMovableEntity(properties.x, properties.y, fillingDirection);
        if(nextMovableEntity!=false)
        {
            this.moveEntity(nextMovableEntity, properties.x, properties.y);
        }
        else
        {
            this.generateEntity(properties.x,properties.y);
        }
    }
    getNextMovableEntity(x, y, fillingDirection) {
        switch (fillingDirection) {
            case EmptyEntity.DIRECTION.BELOW:
                y += 1;
                break;
            case EmptyEntity.DIRECTION.LEFT:
                x -= 1;
                break;
            case EmptyEntity.DIRECTION.RIGHT:
                x += 1;
                break;
            case EmptyEntity.DIRECTION.ABOWE:
                y -= 1;
                break;
        }
        return (this.getEntity(x, y));
    }
    getEntity(x, y) {//получаем сущность по координатам матрицы
        if (x<0 || x>=this.width || y<0 || y>=this.height){
            return false;
        }
        return this.matrix[x][y];
    }
    getEntityByCoordinates(X,Y){//получаем сущность по координатам точки экрана
        return this.getEntity(
                                Math.trunc((X-GameTable.XABSOLUTE)/GameTable.CELLSIZE),
                                Math.trunc((Y-GameTable.YABSOLUTE)/GameTable.CELLSIZE)
        );
    }
    calculateCombat(firstCharacter, secondCharacter) {  //вся механика сражения описывается здесь. В процессе реализации...
        if(secondCharacter.shield>0){
            secondCharacter.shield -= firstCharacter.attack;
            if(secondCharacter.shield<0){
                secondCharacter.decreaseHealth(-secondCharacter.shield);
                secondCharacter.shield=0;
            }
        }else if (secondCharacter.shield === 0) {
            secondCharacter.decreaseHealth(firstCharacter.attack);
        }else{
            throw new Error("Отрицательное значение щита перед боем");
        }
        if(firstCharacter.shield>0){
            firstCharacter.shield -= secondCharacter.attack;
            if(firstCharacter.shield<0){
                firstCharacter.decreaseHealth(-firstCharacter.shield);
                firstCharacter.shield=0;
            }
        }else if (firstCharacter.shield === 0) {
            firstCharacter.decreaseHealth(secondCharacter.attack);
        }else{
            throw new Error("Отрицательное значение щита перед боем");
        }
        firstCharacter.decreaseAttack(1);
        secondCharacter.decreaseAttack(1);
    }

    getPlayerById(id){
        const idName = "Player" + id
        for (let x = 0; x < this.width; x++) {
            for (let y = 0; y < this.height; y++) {
                if(this.matrix[x][y].EntityType === "Player" && this.matrix[x][y].id === idName){
                    return this.matrix[x][y]
                }
            }
        }
    }

    spawnPlayer(id, x, y){
        if(!(x>=0&&x<this.width&&y>=0&&y<this.height))return false;
        this.matrix[x][y] = new Player('Player' + id, x, y,
            (id === 1)? Sprites.player1Img : Sprites.player2Img,
            1,10,10,0);
        return true;
    }
    generateNameEntityForBarrelSpawn(){
        return Barrel.BARREL_ENTITYES[this.getPseudoRandomInt(4)];
    }
    getPseudoRandomInt(to, from=0){
        this.RandomCalls++;
        if (from!=0){
            return to+this.getPseudoRandomInt(to-from);
        }
        let c = Math.pow((this.RandomCalls+this.seed),(this.RandomCalls+1)%10);
        let sum = 0;
        while(c!=0){
            sum+=c%10;
            c = Math.trunc(c/10);
        }
        let result = sum%(to+1);
        return result;
    }
    generateRandomMonster(x,y){
        let ENUM_MONSTRES = {
            0: "Skeleton",
            1: "Vermin",
            2: "Necromancer",
        }
        let newMonster = new Monster(this.RandomCalls,
            x,y, 0,
            this.getPseudoRandomInt(9),
            this.getPseudoRandomInt(0),
            0,
            1, 1);
        switch (ENUM_MONSTRES[this.getPseudoRandomInt(2)]){
            case "Necromancer":
                newMonster.sprite = Sprites.necromancer;
                newMonster.attack+=7;
                newMonster.health+=7;
                newMonster.maxhealth = newMonster.health;
                newMonster.tier = 3;
                newMonster.reward = 10;
                break;
            case "Skeleton":
                newMonster.maxhealth = newMonster.health;
                newMonster.sprite = Sprites.npcSkeleton;
                break;
            case "Vermin":
                newMonster.sprite = Sprites.vermin;
                newMonster.attack+=3;
                newMonster.health+=3;
                newMonster.maxhealth = newMonster.health;
                newMonster.tier = 2;
                newMonster.reward = 5;
                break;
        }
        return newMonster;
    }
    generateEntity(x,y, target = false,entity = false){
        let generateSeed = this.getPseudoRandomInt(GameTable.COUNTS_OF_ENTITYES-1); // 8- количество вариантов сущностей
        let nameEntity = GameTable.ENUM_ENTITYES[generateSeed];
        if(entity!=false){
            this.matrix[entity.x][entity.y] = entity;
        }
        else
        {
            if (target!=false)
            {
                nameEntity = target;
            }
        switch(nameEntity){
            case "Monster":
                this.matrix[x][y] = this.generateRandomMonster(x,y);
            break;
            case "Coins":
                this.matrix[x][y] = new Coins(this.RandomCalls+'Coins',x,y,Sprites.coins,1);
                break;
            case "Barrel":
                this.matrix[x][y] = new Barrel(this.RandomCalls+"Barrel",x,y,Sprites.barrel,this.generateNameEntityForBarrelSpawn());
            break;
            case "Potion":
                this.matrix[x][y] = new Potion(this.RandomCalls+"Potion",x,y,Sprites.potion,this.getPseudoRandomInt(5,1));
            break;
            case "Trap":
                this.matrix[x][y] = new Trap(this.RandomCalls+"Weapon",x,y,Sprites.trap,this.getPseudoRandomInt(5,1));
            break;
            case "Weapon":
                this.matrix[x][y] = new Weapon(this.RandomCalls+"Weapon",x,y,Sprites.weapon,this.getPseudoRandomInt(10,1));
            break;
            case "Shield":
                this.matrix[x][y] = new Shield(this.RandomCalls+"Shield",x,y,Sprites.shield1,this.getPseudoRandomInt(7,1));
                break;
            case "Trader":
                if(this.traderOnDesk === false){
                this.matrix[x][y] = new Trader(this.RandomCalls+"Trader",x,y,Sprites.trader);
                this.traderOnDesk = true;
                break;
                }
            default:
                this.matrix[x][y] = new Monster("Skeleton" + this.RandomCalls+1,x,y,Sprites.npcSkeleton,3,6, 6, 1);
        }
        this.RandomCalls++;
        }
        return true;
    }
    interact(firstEntity, secondEntity) {
        let secondProperties = secondEntity.getProperties();
        if (firstEntity.EntityType === "Player") {
            switch (secondEntity.EntityType) {
                case "Player":
                    this.calculateCombat(firstEntity, secondEntity);
                    if (firstEntity.health > 0 && secondEntity.health > 0) {
                        //Здесь нужна только анимация сражения... Анимации не реализованны.
                    }
                    else if (firstEntity.health > 0 && secondEntity.health <= 0) {
                    } else if (firstEntity.health < 0 && secondEntity.health > 0) {
                    } else if (firstEntity.health < 0 && secondEntity.health < 0) {
                    }
                case "Monster":
                    this.calculateCombat(firstEntity, secondEntity);
                    if (firstEntity.health > 0 && secondEntity.health > 0) {
                        //Здесь нужна только анимация сражения... Анимации не реализованны.
                    }
                    else if (firstEntity.health > 0 && secondEntity.health <= 0) {
                        firstEntity.getReward(secondEntity.reward);
                        this.deleteEntity(
                            secondEntity,
                            EmptyEntity.getDirection(firstEntity.x, firstEntity.y, secondEntity.x, secondEntity.y),
                        );
                        this.moveEntity(firstEntity, secondProperties.x, secondProperties.y);
                    } else if (firstEntity.health < 0 && secondEntity.health > 0) {
                        //поражение игрока
                    } else if (firstEntity.health < 0 && secondEntity.health < 0) {
                        this.deleteEntity(secondEntity);
                    }
                    break;
                case "Weapon":
                    firstEntity.attack = Math.max(firstEntity.attack,secondEntity.powerOfWeapon);
                    this.deleteEntity(
                        secondEntity,
                        EmptyEntity.getDirection(firstEntity.x, firstEntity.y, secondEntity.x, secondEntity.y)
                    );
                    this.moveEntity(firstEntity, secondProperties.x, secondProperties.y);
                    break;
                case "Barrel":
                    this.generateEntity(secondEntity.x,secondEntity.y, secondEntity.nameSpawnableEntity);
                    break;
                case "Potion":
                    firstEntity.increaseHealth(secondEntity.powerOfPotion);
                    this.deleteEntity(
                        secondEntity,
                        EmptyEntity.getDirection(firstEntity.x, firstEntity.y, secondEntity.x, secondEntity.y)
                    );
                    this.moveEntity(firstEntity, secondProperties.x, secondProperties.y);
                    break;
                case "Trap":
                    firstEntity.decreaseHealth(secondEntity.powerOfTrap);
                    this.deleteEntity(
                        secondEntity,
                        EmptyEntity.getDirection(firstEntity.x, firstEntity.y, secondEntity.x, secondEntity.y)
                    );
                    this.moveEntity(firstEntity, secondProperties.x, secondProperties.y);
                    break;
                case "Coins":
                    firstEntity.gold += secondEntity.countOfCoins;
                    this.deleteEntity(secondEntity,
                        EmptyEntity.getDirection(firstEntity.x, firstEntity.y, secondEntity.x, secondEntity.y)
                        );
                    this.moveEntity(firstEntity, secondProperties.x, secondProperties.y);
                    break;
                case "Shield":
                    if(firstEntity.shield < secondEntity.powerOfShield){
                        firstEntity.shield = secondEntity.powerOfShield;
                    }else{
                        firstEntity.shield++;
                    }
                    this.deleteEntity(secondEntity,
                        EmptyEntity.getDirection(firstEntity.x, firstEntity.y, secondEntity.x, secondEntity.y)
                    );
                    this.moveEntity(firstEntity,secondProperties.x,secondProperties.y);
                    break;
                case "Trader":
                    this.matrix[secondEntity.x][secondEntity.y] = secondEntity.getItem(firstEntity);
                    this.traderOnDesk = false;
            }
        } else if (firstEntity.EntityType === "Monster") {
            return false; //в процессе реализации...
        } else if (firstEntity.EntityType === "Structure") {
            return false; //---и---
        } else {
            return false; //---и---
        }
        this.turn++;
        this.NearEntityes =false;
    }
    draw(context) {
        context.drawImage(Sprites.desk,
            GameTable.XABSOLUTE - 12,
            GameTable.YABSOLUTE -12,
            GameTable.CELLSIZE*6 + 24,
            GameTable.CELLSIZE*6 + 24,)
            //грубая функция отрисовки которая вызывает функцию отрисовки 
            //у каждой сущности игрового поля.
        for (let x = 0; x < this.width; x++) {
            for (let y = 0; y < this.height; y++) {
                    this.matrix[x][y].draw(context);
            }
        }
        //ниже отрисовывается зеленая обводка//
        if(this.NearEntityes===false){
        if (this.turn%2===0 && this.playerNumber ===1){
            this.NearEntityes = this.getNearEntityes(1);
        }
        if (this.turn%2===1 && this.playerNumber ===0){
            this.NearEntityes = this.getNearEntityes(0);
        }}
        let cur;
        for(let key in this.NearEntityes){
            cur = this.NearEntityes[key];
            context.drawImage(Sprites.greenframe,GameTable.XABSOLUTE + cur.x * GameTable.CELLSIZE,GameTable.YABSOLUTE + cur.y * GameTable.CELLSIZE, GameTable.CELLSIZE, GameTable.CELLSIZE);

        }
    }
    getNearEntityes(id){//возвращает массив сущностей находящиеся рядом с той котороую передали, + ту которую передали
        let player = this.getPlayerById(id);
        let curEnt;
        let arrayEntityes = [];
        arrayEntityes.push(player);
        curEnt = this.getEntity((player.x)+1,player.y)
        if(curEnt!=false) arrayEntityes.push(curEnt);
        curEnt = this.getEntity(player.x,(player.y)+1)
        if(curEnt!=false) arrayEntityes.push(curEnt);
        curEnt = this.getEntity((player.x)-1,player.y)
        if(curEnt!=false) arrayEntityes.push(curEnt);
        curEnt = this.getEntity(player.x,(player.y)-1)
        if(curEnt!=false) arrayEntityes.push(curEnt);
        return arrayEntityes;}
}
export class Entity {  //сущность объекта игрового стола, от которой наследуемся.
    constructor(id, x, y, sprite) {
        this.EntityType = "Entity"
        this.id = id;
        this.x = x; //эти координаты в матрице игрового стола, например x=1 y=1 означает клетку {второй столбец, вторая строка}
        this.y = y;
        this.sprite = sprite;
    }
    draw(context) {
            context.drawImage(Sprites.entityBackground,
                GameTable.XABSOLUTE + this.x * GameTable.CELLSIZE,
                GameTable.YABSOLUTE + this.y * GameTable.CELLSIZE,
                GameTable.CELLSIZE,
                GameTable.CELLSIZE);
            context.drawImage(this.sprite,GameTable.XABSOLUTE + this.x * GameTable.CELLSIZE,GameTable.YABSOLUTE + this.y * GameTable.CELLSIZE, GameTable.CELLSIZE, GameTable.CELLSIZE);
        }

    getProperties() {
        return { name: this.id, x: this.x, y: this.y, sprite: this.sprite };
    }
}
export class EmptyEntity extends Entity {   //пустая сущность. Получается, например, при убийстве нпс, 
    static DIRECTION = {                    //на его месте Изначально заполняем ей игровой стол.
        BELOW: 0,
        ABOWE: 1,
        LEFT: 2,
        RIGHT: 3,
    };
    static getDirection(x1, y1, x2, y2) {
        if (y2 > y1) return EmptyEntity.DIRECTION.ABOWE;
        if (y2 < y1) return EmptyEntity.DIRECTION.BELOW;
        if (x2 > x1) return EmptyEntity.DIRECTION.LEFT;
        if (x2 < x1) return EmptyEntity.DIRECTION.RIGHT;

        throw new Error("GetDirection() вызвался для одиноковой пары x1y1 x2y2")
    };
    constructor(id, x, y, sprite = Sprites.emptyEntityImg, filingDirection =EmptyEntity.DIRECTION.ABOWE) {
        super(id, x, y, sprite);
        this.EntityType = "EmptyEntity";
        this.filingDirection = filingDirection;
    }
}
export class Character extends Entity {//от этого класса наследуются игровые и не игровые персонажи
    constructor(id, x, y, sprite, attack, health, maxhealth, tier) {
        super(id, x, y, sprite);
        this.HUD = Sprites.characterBackground;
        this.EntityType = "Character";
        this.health = health;
        this.maxhealth = maxhealth;
        this.attack = attack;
        this.tier = tier;
        this.shield = 0;
    }
    draw(context) {   //В процессе реализации...
        super.draw(context);
        context.drawImage(this.HUD,
            GameTable.XABSOLUTE + this.x * GameTable.CELLSIZE,
            GameTable.YABSOLUTE + this.y * GameTable.CELLSIZE,
            GameTable.CELLSIZE,
            GameTable.CELLSIZE);
        context.fillStyle = "#ffffff"
        context.font = "15px serif";
        context.fillText("  ️" + this.health+'/' + this.maxhealth,
            GameTable.XABSOLUTE + this.x * GameTable.CELLSIZE + 10,
            GameTable.YABSOLUTE + this.y * GameTable.CELLSIZE + GameTable.CELLSIZE-5,
            );
        context.fillText("   ️" + this.attack,
            GameTable.XABSOLUTE + this.x * GameTable.CELLSIZE + GameTable.CELLSIZE-40,
            GameTable.YABSOLUTE + this.y * GameTable.CELLSIZE +  GameTable.CELLSIZE-5,)
        if(this.shield>0){
            context.drawImage(Sprites.shieldHUD,
                GameTable.XABSOLUTE + this.x * GameTable.CELLSIZE,
                GameTable.YABSOLUTE + this.y * GameTable.CELLSIZE,
                GameTable.CELLSIZE,
                GameTable.CELLSIZE);
            context.fillText("   ️" + this.shield,
                GameTable.XABSOLUTE + this.x * GameTable.CELLSIZE + GameTable.CELLSIZE-40,
                GameTable.YABSOLUTE + this.y * GameTable.CELLSIZE +  GameTable.CELLSIZE-27,)
        }
    }
    decreaseHealth(value) {
        this.health = this.health - value;
    }
    increaseHealth(value) {
        this.health = this.health + value;
        if (this.health >this.maxhealth) this.health = this.maxhealth;
    }
    decreaseAttack(value){
        this.attack -=value;
        if(this.attack<=0){
            this.attack = 1;
        }
    }
}
export class Monster extends Character { //Класс монтров, в процессе реализации...
    constructor(id, x, y, sprite, attack, health, maxhealth, tier, reward) {
        super(id, x, y, sprite,attack, health,maxhealth, tier);
        this.EntityType = "Monster";
        this.reward = {
            gold: tier*1,
            experience: tier*1,
        };
    }
}
export class Player extends Character {    // Класс игрока, в процессе реализации...
    constructor(id, x, y, sprite, attack, health, maxhealth, tier) {
        super(id, x, y, sprite, attack, health ,maxhealth, tier);
        this.EntityType = "Player";
        this.HUD = Sprites.playerHUD;
        this.experience = 0;
        this.gold = 0;
    }
    getReward(reward){
        this.gold += reward.gold;
        this.experience += reward.experience;
    }
    draw(context){
        super.draw(context);
        context.fillText("   ️" + this.gold,
            GameTable.XABSOLUTE + this.x * GameTable.CELLSIZE + GameTable.CELLSIZE-40,
            GameTable.YABSOLUTE + this.y * GameTable.CELLSIZE + 12,)
    }
}
export class Coins extends Entity {
    constructor(id, x, y, sprite = Sprites.coins, countOfCoins) {
        super(id, x, y, sprite);
        this.EntityType = "Coins";
        this.countOfCoins = countOfCoins;
    }
    draw(context){
        super.draw(context)
        context.fillText("   ️" + this.countOfCoins,
            GameTable.XABSOLUTE + this.x * GameTable.CELLSIZE + GameTable.CELLSIZE-40,
            GameTable.YABSOLUTE + this.y * GameTable.CELLSIZE +  GameTable.CELLSIZE-5,)
    }
}
export class Weapon extends Entity {
    constructor(id, x, y, sprite, powerOfWeapon) {
        super(id, x, y, sprite);
        this.EntityType = "Weapon";
        this.powerOfWeapon = powerOfWeapon;
    }
    draw(context) {
        super.draw(context);
        context.fillText("   ️" + this.powerOfWeapon,
            GameTable.XABSOLUTE + this.x * GameTable.CELLSIZE + GameTable.CELLSIZE-40,
            GameTable.YABSOLUTE + this.y * GameTable.CELLSIZE +  GameTable.CELLSIZE-5,)
    }
}
export class Potion extends Entity {
    constructor(id, x, y, sprite, powerOfPotion) {
        super(id, x, y, sprite);
        this.EntityType = "Potion";
        this.powerOfPotion = powerOfPotion;
    }
    draw(context){
        super.draw(context)
        context.fillText("   ️" + this.powerOfPotion,
            GameTable.XABSOLUTE + this.x * GameTable.CELLSIZE + GameTable.CELLSIZE-40,
            GameTable.YABSOLUTE + this.y * GameTable.CELLSIZE +  GameTable.CELLSIZE-5,)
    }
}
export class Trap extends Entity {
    constructor(id, x, y, sprite, powerOfTrap) {
        super(id, x, y, sprite);
        this.EntityType = "Trap";
        this.powerOfTrap = powerOfTrap;
    }
    draw(context){
        super.draw(context);
        context.fillText("   ️" + this.powerOfTrap,
            GameTable.XABSOLUTE + this.x * GameTable.CELLSIZE + GameTable.CELLSIZE-40,
            GameTable.YABSOLUTE + this.y * GameTable.CELLSIZE +  GameTable.CELLSIZE-5,)
    }
}
export class Barrel extends Entity{
    static BARREL_ENTITYES = {                    //на его месте Изначально заполняем ей игровой стол.
        0: "Monster",
        1: "Coins",
        2: "Potion",
        3: "Weapon",
        4: "Shield",
    };
    constructor(id, x, y, sprite, nameSpawnableEntity) {
        super(id, x, y, sprite);
        this.EntityType = "Barrel";
        this.nameSpawnableEntity = nameSpawnableEntity;
    }
    draw(context) {
        super.draw(context);
    }
}
export class Trader extends Entity{
    static TRADER_ENTITYES = {                    //на его месте Изначально заполняем ей игровой стол.
        0: "Potion",
        1: "Weapon",
        2: "Shield",
    };
    constructor(id, x, y, sprite) {
        super(id, x, y, sprite);
        this.EntityType = "Trader";
    }
    draw(context) {
        super.draw(context);
    }
    getItem(player){
        if(player.gold<=0){
            return new Trap("tradetrap",this.x,this.y,Sprites.trap,price);
        }
        let price;
        if(player.health<5){
            price = player.maxhealth-player.health;
            if (player.gold<price){
                price = player.gold;
                player.gold = 0;
            }else{
                player.gold -=price;
            }
            return new Potion("tradepotion",this.x,this.y,Sprites.potion,price);
            }
        else if (player.attack<player.shield){
            price = player.gold;
            player.gold = 0;
            return new Weapon("tradeweapon",this.x,this.y,Sprites.weapon,price);
        }
        else{
            price = player.gold;
            player.gold = 0;
            return new Shield("tradeshield",this.x,this.y,Sprites.shield1,price);
        }
    }
}
export  class Shield extends  Entity{
    constructor(id, x, y, sprite, powerOfShield) {
        super(id, x, y, sprite);
        this.EntityType = "Shield";
        this.powerOfShield = powerOfShield
    }
    draw(context) {
        super.draw(context);
        context.fillText("   ️" + this.powerOfShield,
            GameTable.XABSOLUTE + this.x * GameTable.CELLSIZE + GameTable.CELLSIZE-40,
            GameTable.YABSOLUTE + this.y * GameTable.CELLSIZE +  GameTable.CELLSIZE-5,)
    }
}
