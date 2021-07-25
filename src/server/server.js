const io = require("socket.io")( {
    cors: {
        origin: "*",
    }
});

const rooms = {};
const state = {};

const {FRAME} = require("./gConstans")
const {randomStr} = require("./helpers")
const {createGameState, mainGameLoop} = require("./game")

io.on('connection', client => {
    client.on('newGame', handleNewGame)
    client.on('joinRoom', handleJoinRoom)

    function handleJoinRoom(roomId) {
        //grab room via sockets ability
        if(!io.sockets.adapter.rooms.has(roomId)) {
            client.emit('invalidGameToken')
            return
        }
        const userCnt = io.sockets.adapter.rooms.get(roomId).size
        if (userCnt > 1) {
            client.emit('tooManyPlayers')
            return
        }

        client.join(roomId)
        rooms[client.id] = roomId
        client.number = 2
        client.emit('init', 2)
        console.log(rooms)
    }

    function handleNewGame() {
        let roomId = randomStr(3)
        client.join(roomId)
        client.number = 1
        client.emit('init', 1)
        console.log(io.sockets.adapter.rooms.has(roomId))
        rooms[client.id] = roomId
        //send back
        client.emit('gameCode', roomId)
    }
    startGameInterval(client, state)
})

function startGameInterval(client, state) {
    const Id = setInterval( ()=> {
        /*const resultOfGame = mainGameLoop(state)
        if (!resultOfGame) {
            client.emit('gameState', JSON.stringify(state))
        } else {
            client.emit('gameOver')
            clearInterval(Id)
        }*/

    }, FRAME)
}

io.listen(3000)