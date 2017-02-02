const io = require("socket.io")();
const colors = ["red", "green", "yellow", "blue", "magenta", "cyan"];
let db = {};
let privates = [];
module.exports = function(port){
    io.on("connection", socket=>{
        let color, ch, nam, id;
        socket.on("enter", (channel, name)=>{
            if(!db[channel]){
                db[channel] = {last:0, n:0};
            }
            color = colors[Math.round(Math.random()*(colors.length-1))];
            id = ++db[channel].last;
            ch = channel;
            nam = name;
            db[channel][id] = {name:name, color:color};
            db[channel].n++;
            socket.broadcast.emit(channel, name, null, "white", "joined");
            socket.emit("ready", id);
        });
        socket.on("getPrivate", ()=>{
            privates.filter(x=>x.channel == ch && x.to == id).forEach((item, index)=>{
                socket.emit(ch, db[ch][item.from].name, item.message, db[ch][item.from].color, null, db[ch][item.to].name);
                privates.splice(index, 1);
            });
        });
        socket.on("disconnect", ()=>{
            delete db[ch][id];
            db[ch].n--;
            if(db[ch].n == 0){
                delete db[ch];
            }
            socket.broadcast.emit(ch, nam, null, "white", "exited", null);
        });
        socket.on("message", message=>{
            socket.broadcast.emit(ch, nam, message, color, null, null);
            socket.emit("me", message);
        });
        socket.on("private", (message, to)=>{
            privates.push({channel:ch, from:id, to:to, message:message});
            socket.broadcast.emit("newPrivate");
            socket.emit("me", message, db[ch][to]);
        });
        socket.on("members", ()=>{
            socket.emit("members", db[ch]);
        });
    });
    io.listen(8080);
    console.log(`Server running on port ${port}`)
}
