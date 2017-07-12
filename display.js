const blessed = require('blessed');

module.exports = info => {

    const events = {
        onSubmit: function (msg) { },
        onPrivate: function (id, msg) { }
    }

    const screen = blessed.screen({ smartCSR: true, dockBorders: true });
    const program = blessed.program();

    const infoBox = blessed.box({
        top: 0,
        left: 0,
        right: 0,
        height: 1,
        tags: true,
        align: "center",
        valign: "middle",
        content: info,
        bg: "black",
        style: {
            fg: 'white',
            bg: 'black'
        }
    })

    const messageView = blessed.box({
        top: 1,
        left: 25,
        right: 0,
        bottom: 3,
        tags: true,
        scrollable: true,
        alwaysScroll: true,
        scrollbar: {
            bg: "blue"
        },
        border: {
            type: "line",
            fg: "white",
            bg: "black"
        },
        style: {
            fg: 'white',
            bg: "black"
        }
    });

    const messageInput = blessed.textarea({
        bottom: 0,
        left: 25,
        right: 0,
        height: 3,
        input: true,
        inputOnFocus: true,
        valign: "middle",
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

    const sidebar = blessed.box({
        top: 1,
        left: 0,
        bottom: 0,
        width: 25,
        tags: true,
        scrollable: true,
        alwaysScroll: true,
        bg: "black",
        scrollbar: {
            bg: "blue"
        },
        border: {
            type: "line",
            fg: "white",
            bg: "black",
        }
    });

    screen.key('C-c', (ch, key) => {
        process.exit(0);
    });

    screen.on('keypress', () => {
        screen.focusPush(messageInput);
    });

    messageInput.key('up', () => {
        messageView.scroll(-1);
        screen.render();
    });

    messageInput.key('down', () => {
        messageView.scroll(1);
        screen.render();
    });

    messageInput.key('C-up', () => {
        sidebar.scroll(-1);
        screen.render();
    });

    messageInput.key('C-down', () => {
        sidebar.scroll(1);
        screen.render();
    });

    messageInput.key('enter', () => {
        let msg = messageInput.content.trim();
        switch (msg) {
            case "\\clear":
                messageView.setContent("");
                messageInput.clearValue();
                screen.render();
                break;
            case "\\quit":
                process.exit(0);
                break;
            case "\\hide":
                sidebar.hide();
                messageView.left = 0;
                messageInput.left = 0;
                messageInput.clearValue();
                screen.render();
                break;
            case "\\show":
                sidebar.show();
                messageView.left = sidebar.width;
                messageInput.left = sidebar.width;
                messageInput.clearValue();
                screen.render();
                break;
            case (msg.match(/^\\size-\d+$/) || {}).input:
                msg.replace(/^\\size-(\d+)$/, m => {
                    let size = parseInt(RegExp.$1);
                    sidebar.width = size;
                    messageView.left = size;
                    messageInput.left = size;
                    messageInput.clearValue();
                    screen.render();
                });
                break;
            case (msg.match(/^\\\d+ .*$/) || {}).input:
                msg.replace(/^\\(\d+) (.*)$/, m => {
                    events.onPrivate(parseInt(RegExp.$1), RegExp.$2);
                    messageInput.setValue(`\\${RegExp.$1} `);
                    screen.render();
                });
                break;
            case (msg.match(/^\\\d+$/) || {}).input:
                msg.replace(/^\\(\d+)$/, m=>{
                    messageInput.setValue(`\\${RegExp.$1} `);
                    screen.render();
                })
                break;
            default:
                if (msg.length > 0) {
                    events.onSubmit(msg);
                }
                messageInput.clearValue();
                break;
        }
    });

    screen.append(messageView);
    screen.append(messageInput);
    screen.append(infoBox);
    screen.append(sidebar);
    program.enableMouse();
    screen.render();
    screen.focusPush(messageInput);

    function addMessage(sender, message) {
        messageView.setScrollPerc(100);
        if (sender) {
            messageView.pushLine(`${sender}: ${message}`);
        }
        else {
            messageView.pushLine(`${message}`);
        }
        messageView.setScrollPerc(100);
        screen.render();
    }

    function setMembers(members) {
        sidebar.setContent("");
        members.forEach(item => {
            sidebar.pushLine(item);
        });
        screen.render();
    }

    return {
        addMessage: addMessage,
        setMembers: setMembers,
        events: events
    }
}
