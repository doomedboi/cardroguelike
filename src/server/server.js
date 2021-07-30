const io = require("socket.io")( {
    cors: {
        origin: "*",
    }
});

const rooms = {};
const state = {};

const {randomStr} = require("./helpers")

io.on('connection', client => {
    client.on('newGame', handleNewGame)
    client.on('joinRoom', handleJoinRoom)
    client.on('makeMove', handleMakeMove)
    client.on('generateGame', handleGenerateGame)
    client.on('gameOver', handleGameOver)


    client.on('checkValidRoom', (roomId)=> {
        try {
            const userCnt = io.sockets.adapter.rooms.get(roomId).size
            console.log(userCnt)
            if (userCnt < 2)
                client.emit('closeGame')
        } catch (e) {
            client.emit('closeGame')
        }
    })
    client.on('customInRoom', (roomId)=> {

    })
    client.on('forceDisconnect', function(){
        client.disconnect()
    });
    client.on('disconnect', () => {
        io.sockets.in(rooms[client.id]).emit('left')
    })

    client.on('clientDisconnect', (room)=> {
        client.emit('closeGame')
    })

    client.on('genSSID', (room)=> {
        let ssid = randomStr(10)
        io.sockets.in(room).emit('getSSID', ssid)
    })

    function handleGameOver(room) {
        io.sockets.in(room).emit('gameOverClient')
    }

    function handleMakeMove(room, state) {
        io.sockets.in(room).emit('mustMove', state)
        //отослать обоим клиентам ответ: выполни функцию хода
    }

    function handleGenerateGame(room) {
        io.sockets.in(room).emit('generateGame')
    }


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
        client.emit('init', 1)
    }

    function handleNewGame() {
        let roomId = randomStr(10).toString()
        client.join(roomId)
        client.number = 1
        client.emit('init', 0)
        rooms[client.id] = roomId
        //send back
        client.emit('gameCode', roomId)
    }

})

io.listen(3000)