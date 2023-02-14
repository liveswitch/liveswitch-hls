import express from "express";
import mustache from "mustache-express";
import exec from "child_process";
import fs from "fs";

const delim = "/"

const gatewayUrl = "https://cloud.liveswitch.io";

const applicationId = "24db8476-f35b-4bd1-95a6-f7ed77a8d966";
const sharedSecret = "";

const staticRoot = "static";
const recordingRoot = "hls";
const recordingName = "hls.m3u8";

const app = express();
const mst = mustache();

app.engine("mustache", mst);
app.set("view engine", "mustache");
app.set("views", __dirname + "/views");

app.use(express.json());

app.get("/", function (req, res) {
    console.log("GET request");
    mst.cache.reset();
    let index = {
        channels: []
    };
    for (let channelId of fs.readdirSync(`${staticRoot}${delim}${recordingRoot}`)) {
        let channel = {
            id: channelId,
            connections: []
        };
        for (let connectionId of fs.readdirSync(`${staticRoot}${delim}${recordingRoot}${delim}${channelId}`)) {
            let connection = {
                id: connectionId,
                path: `${recordingRoot}/${channelId}/${connectionId}/${recordingName}`
            };
            channel.connections.push(connection);
        }
        index.channels.push(channel);
    }
    console.log("index", index);
    for (let channel of index.channels) {
        console.log("channel", channel.id, channel.connections);
    }
    res.contentType("html");
    res.render("index", index);
})

app.post("/", function (req, res) {
    console.log('POST request')
    let event = req.body;
    if (!event) {
        console.log("Unexpected request.", req);
        res.status(400);
        return;
    }

    if (!event.origin || !event.type) {
        console.log("Unexpected event format.", event);
        res.status(400);
        return;
    }

    if (event.type !== "connection.connected") {
        console.log("Unexpected event type.", event);
        res.status(400);
        return;
    }

    if (event.origin !== "mediaserver") {
        res.status(200);
        return;
    }
    
    let connection = event.connection;
    if (connection.applicationId != applicationId) {
        console.log("Unexpected application ID.", event);
        res.status(400);
        return;
    }

    let outputPath = `${staticRoot}${delim}${recordingRoot}${delim}${connection.channelId}${delim}${connection.id}`;

    let directory = "";
    for (let segment of outputPath.split(delim)) {
        directory += `${segment}${delim}`;
        if (!fs.existsSync(directory)) {
            fs.mkdirSync(directory);
        }
    }

    let command = "lsconnect";
    if (process.platform === "darwin") {
        command = "lsconnect-macos";
    }

    let args = [
        "ffrender",
        "--gateway-url", gatewayUrl,
        "--application-id", applicationId,
        "--shared-secret", sharedSecret,
        "--channel-id", connection.channelId,
        "--connection-id", connection.externalId,
        `--output-args=-flags +cgop -g 30 -hls_time 1 ${outputPath}${delim}${recordingName}`
    ];
    console.log(`Executing. Current directory: ${process.cwd()}`);

    console.log(command, args);
    try{
        let p = exec.spawn(command, args);
        p.stdout.on("data", (data) => {
            process.stdout.write(data);
        });
    
        p.stderr.on("data", (data) => {
            process.stderr.write(data);
        });
    
        p.on("close", (code) => {
            console.log(`lsconnect exited with code ${code}.`);
        });
        p.on("error", (err) => {
            console.log(`lsconnect failed with error ${err}.`);
        });
        res.status(200);
    }catch(e){
        console.error(e);
        res.status(500);
    }
    
})

console.log(`Browse to: https://demo.liveswitch.io/#application=${applicationId}&sharedsecret=${sharedSecret}&mode=1`);

app.use("/", express.static(staticRoot));

app.listen(3001);