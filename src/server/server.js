const io = require("socket.io")( {
    cors: {
        origin: "*",
    }
});

const rooms = {};
const state = {};

const {FRAME} = require("./gConstans")
const {randomStr} = require("./helpers")

io.on('connection', client => {
    console.log('hello')
    client.on('newGame', handleNewGame)
    client.on('joinRoom', handleJoinRoom)
    client.on('makeMove', handleMakeMove)
    client.on('generateGame', handleGenerateGame)
    client.on('gameOver', handleGameOver)


    client.on('checkValidRoom', (roomId)=> {
        try {
            const userCnt = io.sockets.adapter.rooms.get(roomId).size

        } catch (e) {
            client.emit('closeGame')
        }
    })
    client.on('customInRoom', (roomId)=> {
        console.log('room id:')
        console.log(roomId)
        /*let userCnt = io.sockets.adapter.rooms.get(roomId).size
        console.log(userCnt)
        console.log(userCnt)
        if (userCnt < 2) {
            client.emit('left')
            console.log("im here======")
        }*/
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
        console.log("end")
        io.sockets.in(room).emit('gameOverClient')
    }

    function handleMakeMove(room, state) {
        console.log('state in handle makeMove')
        console.log(state)
        io.sockets.in(room).emit('mustMove', state)
        //отослать обоим клиентам ответ: выполни функцию хода
    }

    function handleGenerateGame(room) {
        io.sockets.in(room).emit('generateGame')
    }


    function handleJoinRoom(roomId) {
        console.log(roomId)
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
        console.log(rooms)

    }

    function handleNewGame() {
        console.log('polychaet')
        let roomId = randomStr(10).toString()
        client.join(roomId)
        client.number = 1
        client.emit('init', 0)
        console.log('pidoras server')
        console.log(io.sockets.adapter.rooms.has(roomId))
        rooms[client.id] = roomId
        //send back
        client.emit('gameCode', roomId)
    }

})

io.listen(process.env.PORT || 3000)