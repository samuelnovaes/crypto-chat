#!/usr/bin/env node
const server = require("./server.js");
const client = require("./client.js");

if(process.argv[2] == "-s"){
    const port = process.argv[3] || process.env.PORT || 8080;
    server(port);
}
else{
    client();
}
