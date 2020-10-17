"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mustache_express_1 = __importDefault(require("mustache-express"));
const child_process_1 = __importDefault(require("child_process"));
const fs_1 = __importDefault(require("fs"));
const gatewayUrl = "https://cloud.liveswitch.io";
const applicationId = "<YOUR_APPLICATION_ID_GOES_HERE>";
const sharedSecret = "<YOUR_SHARED_SECRET_GOES_HERE>";
const staticRoot = "static";
const recordingRoot = "hls";
const recordingName = "hls.m3u8";
const app = express_1.default();
const mst = mustache_express_1.default();
app.engine("mustache", mst);
app.set("view engine", "mustache");
app.set("views", __dirname + "/views");
app.use(express_1.default.json());
app.get("/", function (req, res) {
    mst.cache.reset();
    let index = {
        channels: []
    };
    for (let channelId of fs_1.default.readdirSync(`${staticRoot}\\${recordingRoot}`)) {
        let channel = {
            id: channelId,
            connections: []
        };
        for (let connectionId of fs_1.default.readdirSync(`${staticRoot}\\${recordingRoot}\\${channelId}`)) {
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
});
app.post("/", function (req, res) {
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
    let outputPath = `${staticRoot}\\${recordingRoot}\\${connection.channelId}\\${connection.id}`;
    let directory = "";
    for (let segment of outputPath.split("\\")) {
        directory += `${segment}\\`;
        if (!fs_1.default.existsSync(directory)) {
            fs_1.default.mkdirSync(directory);
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
        `--output-args=-flags +cgop -g 30 -hls_time 1 ${outputPath}\\${recordingName}`
    ];
    console.log(command, args);
    let p = child_process_1.default.spawn(command, args);
    p.stdout.on("data", (data) => {
        process.stdout.write(data);
    });
    p.stderr.on("data", (data) => {
        process.stderr.write(data);
    });
    p.on("close", (code) => {
        console.log(`lsconnect exited with code ${code}.`);
    });
    res.status(200);
});
console.log(`Browse to: https://demo.liveswitch.io/#application=${applicationId}&sharedsecret=${sharedSecret}&mode=1`);
app.use("/", express_1.default.static(staticRoot));
app.listen(3000);
//# sourceMappingURL=app.js.map