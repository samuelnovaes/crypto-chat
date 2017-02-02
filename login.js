const blessed = require('blessed');
const program = blessed.program();
const jsondb = require("./jsondb.js");
const db = new jsondb("cache.json", {});

module.exports = ()=>{
    const cache = db.read();
    const events = {
        onSubmit: function(server, channel, name){}
    }

    const screen = blessed.screen({smartCSR: true});
    const program = blessed.program();

    const background = blessed.box({
        top: 0,
        left: 0,
        righ: 0,
        bottom: 0,
        bg: "black",
        border: {
            type: "bg",
            bg: "black"
        }
    });

    const loginForm = blessed.form({
        keys: true,
        padding: 2,
        width: 54,
        height: 15,
        top: "center",
        left: "center",
        style: {
            bg: "#333333",
            fg: "white"
        }
    });

    const lblServer = blessed.text({
        tags: true,
        content: "{bold}Server:{/}",
        top: 1,
        style: {
            bg: "#333333",
            fg: "white"
        }
    });

    const inputServer = blessed.textbox({
        input: true,
        inputOnFocus: true,
        width: 40,
        height: 3,
        left: 10,
        top: 0,
        border: {
            type: "line",
            bg: "#333333",
            fg: "white"
        },
        style: {
            bg: "#333333",
            fg: "white"
        }
    });

    const lblChannel = blessed.text({
        tags: true,
        content: "{bold}Channel:{/}",
        top: 5,
        style: {
            bg: "#333333",
            fg: "white"
        }
    });

    const inputChannel = blessed.textbox({
        input: true,
        inputOnFocus: true,
        width: 40,
        height: 3,
        left: 10,
        top: 4,
        border: {
            type: "line",
            bg: "#333333",
            fg: "white"
        },
        style: {
            bg: "#333333",
            fg: "white"
        }
    });

    const lblName = blessed.text({
        tags: true,
        content: "{bold}Name:{/}",
        top: 9,
        style: {
            bg: "#333333",
            fg: "white"
        }
    });

    const inputName = blessed.textbox({
        input: true,
        inputOnFocus: true,
        width: 40,
        height: 3,
        left: 10,
        top: 8,
        border: {
            type: "line",
            bg: "#333333",
            fg: "white"
        },
        style: {
            bg: "#333333",
            fg: "white"
        }
    });

    const alertBox = blessed.box({
        tags: true,
        hidden: true,
        width: 54,
        shaddow: true,
        height: 3,
        top: "center",
        left: "center",
        border: {
            type: "bg",
            bg: "#400000"
        },
        style: {
            bg: "#400000"
        }
    });

    const loading = blessed.loading({
        top: "center",
        left: "center",
        hidden: true,
        height: 5,
        width: 10
    });

    if(cache.server){
        inputServer.setValue(cache.server);
    }
    if(cache.channel){
        inputChannel.setValue(cache.channel);
    }
    if(cache.name){
        inputName.setValue(cache.name);
    }
    screen.append(background);
    loginForm.append(lblServer);
    loginForm.append(inputServer);
    loginForm.append(lblChannel);
    loginForm.append(inputChannel);
    loginForm.append(lblName);
    loginForm.append(inputName);
    screen.append(loginForm);
    screen.append(alertBox);
    screen.append(loading);
    program.enableMouse();
    screen.render();
    screen.focusPush(inputServer);

    screen.key('C-c', (ch, key)=>{
        process.exit(0);
    });

    screen.key("enter", ()=>{
        alertBox.hide();
    });

    inputServer.key("enter", ()=>{
        enter();
    });
    inputChannel.key("enter", ()=>{
        enter();
    });
    inputName.key("enter", ()=>{
        enter();
    });

    function showAlert(text){
        alertBox.show();
        alertBox.setContent(`{#ffaaaa-fg}${text}{/} [ENTER]`);
        alertBox.focus();
    }

    function enter(){
        loading.show();
        loading.load("Loading...");
        let server = inputServer.getValue().trim();
        let channel = inputChannel.getValue().trim();
        let name = inputName.getValue().trim();
        if(!/^(http|https):\/\/.*$/.test(server)){
            showAlert("Invalid server URL!");
        }
        else if(channel.length < 8){
            showAlert("The channel must be at least 8 characters!");
        }
        else if(name == ""){
            showAlert("The name is required!");
        }
        else{
            events.onSubmit(server, channel, name);
            db.write((obj)=>{
                return {
                    server: server,
                    channel: channel,
                    name: name
                }
            });
        }
    }

    function exit() {
        program.clear();
        screen.destroy();
    }

    return {
        events: events,
        exit: exit
    }
}
