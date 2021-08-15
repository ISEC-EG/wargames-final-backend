let SOC = require("socket.io");
const Config = require("./../config")
let io;



start = function (server) {
    io = SOC(server, {
        path: "/wargames/",
        cors: {
            origin: Config.ORIGIN_CORS,
            methods: ["GET", "POST"],
        },
        serveClient: false,
        allowedHeaders: ["authorization"],
        credentials: true,
    });
    io.on("connection", async (socket) => {
        // console.log("####-#### some one connected ####-#### ", socket.id);
        socket.on('joinRequest', function (room) {
            // console.log("subscribe to Room :", room);
            // socket.join("dashboard");
            socket.join(room);
            console.log("join to Room :", room);

        });


        socket.on("disconnect", (reason) => {
            // for (room in socket.nsp.adapter.rooms) {
            //   console.log(room, "Room");
            // }
            socket.leave(socket.id);
            // console.log(socket.nsp.adapter.rooms);
            // io.disconnectSockets();
            console.log("User disconnect", reason);
        });

        socket.on("connect_error", (err) => {
            console.log(err.message);
        });
    });
};


updateDashboard = function () {
    io.emit("update_dashboard", { update: true });
};


module.exports = {
    socketStart: start,
    updateDashboard
};
