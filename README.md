# LiveSwitch HLS Demo

![code quality](https://app.codacy.com/project/badge/Grade/9937a1d117224989a0cd846a43d8f957) ![license](https://img.shields.io/badge/License-MIT-yellow.svg)

The LiveSwitch HLS Demo listens for new connections using LiveSwitch Cloud webhooks and converts them into a near-real-time HLS stream using `lsconnect` and `ffmpeg`.

The LiveSwitch HLS Demo was built using Node.js and TypeScript. It is provided as a Visual Studio solution, but Visual Studio is not required.

## Requirements

1.  [lsconnect](https://github.com/liveswitch/liveswitch-connect)
2.  [ffmpeg](https://ffmpeg.org/)
3.  [Node.js](https://nodejs.org/)
4.  [ngrok](https://ngrok.com/) (optional)

## Getting Started

[Create a LiveSwitch Cloud application](https://console.liveswitch.io/#/applications) if you haven't already.

> LiveSwitch Server customers can use this demo as well. Simply update `gatewayUrl` in `app.ts` to point to your LiveSwitch Gateway.

Update `applicationId` and `sharedSecret` in `app.ts` to your LiveSwitch application ID and shared secret.

In a terminal, browse to `src/FM.LiveSwitch.Hls` and type:

```shell
node app.js
```

The web server is now listening for inbound webhooks.

Use [ngrok](https://ngrok.com/) in a separate terminal to create a secure tunnel to port 3000:

```shell
ngrok http 3000
```

> Using `ngrok` is not required, but avoids the need to configure firewalls to allow inbound requests.

Finally, add a channel-level webhook for the `Connection Connected` event to your [LiveSwitch Cloud application](https://console.liveswitch.io/#/applications) pointing to your `ngrok` URL.

## Live Recording

In your `node` terminal window, you should see a URL with your application ID and shared secret:

```shell
Browse to: https://demo.liveswitch.io/#application=...&sharedsecret=...&mode=1
```

> If you see `<YOUR_APPLICATION_ID_GOES_HERE>` or `<YOUR_SHARED_SECRET_GOES_HERE>` in the URL, you missed a step from the previous section.

Open a web browser and navigate to the URL. You should see the standard LiveSwitch demo app. Join any channel, and you should see a few things happen:

1.  The `ngrok` terminal should show that an inbound POST request has been forwarded to port 3000.
2.  The `node` terminal should show logs indicating that a webhook event has been received and is being processed by `lsconnect` and `ffmpeg`.
3.  The file system should show HLS output under `src/FM.LiveSwitch.Hls/static/hls`.

Open a new browser tab and navigate to [http://localhost:3000](http://localhost:3000). You should see a list of live recordings, including the one that is currently active!

## Troubleshooting

If you are using macOS or Linux, you may need to set the executable bit on `lsconnect`:

```shell
chmod +x lsconnect
chmod +x lsconnect-macos
```

## Contact

To learn more, visit [frozenmountain.com](https://www.frozenmountain.com) or [liveswitch.io](https://www.liveswitch.io).

For inquiries, contact [sales@frozenmountain.com](mailto:sales@frozenmountain.com).

All contents copyright © Frozen Mountain Software.
