const io = require("socket.io-client");
const crypto = require("crypto");

function hash(text){
    return crypto.createHash("sha256").update(text).digest("hex");
}

function encrypt(text, password){
    if(password){
        let cipher = crypto.createCipher("aes-256-ctr", password);
        let crypted = cipher.update(text, "utf8", "hex");
        crypted += cipher.final("hex");
        return crypted;
    }
    return text;
}

function decrypt(text, password){
    if(password){
        let decipher = crypto.createDecipher("aes-256-ctr", password);
        let decrypted = decipher.update(text, "hex", "utf8");
        decrypted += decipher.final("utf8");
        return decrypted;
    }
    return text;
}

module.exports = function(){
    const login = require("./login.js")();
    login.events.onSubmit = (server, channel, name)=>{
        const socket = io.connect(server);
        socket.emit("enter", hash(channel), encrypt(name, channel));
        socket.on("ready", mid=>{
            login.exit();
            const display = require("./display.js")(`{bold}Server:{/} ${server} - {bold}Channel:{/} ${channel} - {bold}Name:{/} ${name}`);
            socket.emit("members");
            display.events.onSubmit = (msg)=>{
                socket.emit("message", encrypt(msg, channel));
            }
            display.events.onPrivate = (id, msg)=>{
                socket.emit("private", encrypt(msg, channel), id)
            }
            socket.on("me", (message, priv)=>{
                message =  decrypt(message, channel);
                let nam;
                if(priv){
                    nam = `{bold}${name} > {${priv.color}-fg}${decrypt(priv.name, channel)}{/${priv.color}-fg}{/bold}`;
                }
                else{
                    nam = `{bold}${name}{/bold}`;
                }
                if(message && message != ""){
                    display.addMessage(nam, message, "white");
                }
            });
            socket.on(hash(channel), (from, message, color, info, to)=>{
                from = decrypt(from, channel);
                if(from && from != ""){
                    if(info){
                        display.addMessage(null, `{bold}${from}{/} ${info} the chat`, color);
                        socket.emit("members");
                    }
                    else{
                        message =  decrypt(message, channel);
                        if(to){
                            to = decrypt(to, channel);
                            from = `{bold}{${color}-fg}${from}{/${color}-fg} > ${to}{/bold}`;
                        }
                        else{
                            from = `{bold}{${color}-fg}${from}{/${color}-fg}{/bold}`;
                        }
                        if(message && message != ""){
                            display.addMessage(from, message, color);
                        }
                    }
                }
            });
            socket.on("newPrivate", ()=>{
                socket.emit("getPrivate");
            });
            socket.on("members", data=>{
                let members = [];
                for(let i in data){
                    if(i != "last" && i != "n"){
                        if(i == mid){
                            data[i].color = "white";
                        }
                        let nam = decrypt(data[i].name, channel);
                        let content = `${i} {bold}{${data[i].color}-fg}${nam}{/}`;
                        members.push(content);
                    }
                }
                display.setMembers(members);
            });
            socket.on("disconnect", ()=>{
                process.exit(0);
            });
        });
    }
}
