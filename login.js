const blessed = require('blessed');
const jsondb = require("./jsondb.js");
const path = require("path");

module.exports = () => {
    
    const db = new jsondb(path.join(process.env.USERPROFILE || process.env.HOME, ".chat.json"), {});
    const cache = db.read();
    const screen = blessed.screen({ smartCSR: true });
    const program = blessed.program();
    const events = {
        onSubmit: function (server, channel, name) { }
    }

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
            bg: "black",
            fg: "white"
        }
    });

    const lblServer = blessed.text({
        tags: true,
        content: "{bold}Server:{/}",
        top: 1,
        style: {
            bg: "black",
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
            bg: "black",
            fg: "white"
        },
        style: {
            bg: "black",
            fg: "white"
        }
    });

    const lblChannel = blessed.text({
        tags: true,
        content: "{bold}Channel:{/}",
        top: 5,
        style: {
            bg: "black",
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
            bg: "black",
            fg: "white"
        },
        style: {
            bg: "black",
            fg: "white"
        }
    });

    const lblName = blessed.text({
        tags: true,
        content: "{bold}Name:{/}",
        top: 9,
        style: {
            bg: "black",
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
            bg: "black",
            fg: "white"
        },
        style: {
            bg: "black",
            fg: "white"
        }
    });

    const loading = blessed.loading({
        top: "center",
        left: "center",
        hidden: true,
        height: 5,
        width: 10
    });

    const alertBox = blessed.box({
        hidden: true,
        shaddow: true,
        height: 3,
        top: "center",
        left: 0,
        right: 0,
        align: "center",
        border: {
            type: "bg",
            bg: "red"
        },
        style: {
            bg: "red",
            fg: "white"
        }
    });

    if (cache.server) {
        inputServer.setValue(cache.server);
    }
    if (cache.channel) {
        inputChannel.setValue(cache.channel);
    }
    if (cache.name) {
        inputName.setValue(cache.name);
    }

    screen.enableMouse();
    screen.append(background);
    loginForm.append(lblServer);
    loginForm.append(inputServer);
    loginForm.append(lblChannel);
    loginForm.append(inputChannel);
    loginForm.append(lblName);
    loginForm.append(inputName);
    screen.append(loginForm);
    screen.append(loading);
    screen.append(alertBox);
    screen.render();
    screen.focusPush(inputServer);
    inputServer.key("enter", enter);
    inputChannel.key("enter", enter);
    inputName.key("enter", enter);
    screen.key('C-c', process.exit);
    inputServer.key("C-c", process.exit);
    inputChannel.key("C-c", process.exit);
    inputName.key("C-c", process.exit);
    alertBox.key("enter", () => {
        alertBox.hide();
        screen.render();
        screen.focusPush(inputServer);
    });

    function showAlert(text) {
        alertBox.setContent(`${text} [ENTER]`);
        alertBox.show();
        alertBox.setFront();
        alertBox.focus();
        screen.render();
    }

    function showLoading() {
        loading.load("Loading...");
        loading.setFront();
        screen.render();
    }

    function enter() {
        let server = inputServer.getValue().trim();
        let channel = inputChannel.getValue().trim();
        let name = inputName.getValue().trim();
        if (!/^(http|https):\/\/.+$/.test(server)) {
            showAlert("Invalid server URL!");
        }
        else if (channel.length < 8) {
            showAlert("The channel must be at least 8 characters!");
        }
        else if (name == "") {
            showAlert("The name is required!");
        }
        else {
            showLoading();
            events.onSubmit(server, channel, name);
            db.write((obj) => {
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
