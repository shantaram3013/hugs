let App = {
    UI: {},
    canvas: {},
    ctx: {},
    urlContents: {},
    assets: {}
}

let frameNo = 0;
let frameCount = 0;

const PER_FRAME_DURATION = 20;
const NUM_FRAMES = 10;


if (!window.location.search) {
    window.location.replace("send.html");
}

const virtualCanvasSize = 800;

function init() {
    if (!('createImageBitmap' in window)) {
        window.createImageBitmap = async function(data) {
            return new Promise((resolve, reject) => {
                let dataURL;
                if (data instanceof Blob) {
                    dataURL = URL.createObjectURL(data);
                } else if (data instanceof ImageData) {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    canvas.width = data.width;
                    canvas.height = data.height;
                    ctx.putImageData(data, 0, 0);
                    dataURL = canvas.toDataURL();
                } else {
                    throw new Error('createImageBitmap does not handle the provided image source type');
                }
                const img = document.createElement('img');
                img.addEventListener('load', function() {
                    resolve(this);
                });
                img.src = dataURL;
            });
        };
    }

    App.assets = new AssetManager(function() {
        document.getElementById("mask").style.display = 'none';
        console.log("page loaded.");
        window.requestAnimationFrame(draw);
    });

    let fileQueue = []

    for (let i = 0; i < 10; i++) {
        fileQueue.push(new FileInfo(`hug-0${i}.png`, `img/hug-0${i}.png`, `img`));
    }

    App.assets.queueItems(fileQueue);

    App.assets.loadAll();

    if (!String.prototype.replaceAll) {
        String.prototype.replaceAll = function(arg1, arg2) {
            let toRet = this;
            while (toRet.includes(arg1)) {
                toRet = toRet.replace(arg1, arg2);
            }
            return toRet;
        }
    }

    App.canvas = document.getElementById('canvas');


    App.canvas.width = App.canvas.clientWidth;
    App.canvas.height = App.canvas.clientHeight;

    App.ctx = canvas.getContext('2d');

    App.ctx.setTransform(1, 0, 0, 1, 0, 0);
    App.ctx.scale(
        App.canvas.width / virtualCanvasSize,
        App.canvas.height / virtualCanvasSize
    );

    App.UI.senderName = document.getElementById('sender-name');
    App.UI.recipientName = document.getElementById('recipient-name');
    App.UI.message = document.getElementById('message');
    App.UI.messageWrapper = document.getElementById('message-wrapper');
    App.UI.messagePrologue = document.getElementById('message-prologue');

    // todo: replace this with a version number string
    let flag = window.location.search.includes("new=true");
    /* if the url was generated with the new version
    of the app, then we know to decode the sender and recipient strings as base64 */

    for (let x of window.location.search.replace('?', '').split('&')) {
        let kvPair = x.split('=');
        if (kvPair[0] === 'message' || flag) {
            App.urlContents[kvPair[0]] = decodeURIComponent(atob(kvPair[1].replaceAll('-', '=')));
        } else {
            App.urlContents[kvPair[0]] = decodeURIComponent(kvPair[1]).replaceAll('+', ' ');
        }

        App.urlContents[kvPair[0]] = App.urlContents[kvPair[0]].replaceAll('>', '&gt;').replaceAll('<', '&lt;');
        /* naive
                                                                                         attempt at preventing HTML injection */
    }

    App.UI.senderName.innerHTML = 'Someone';
    App.UI.recipientName.innerHTML = 'person';

    if (Object.keys(App.urlContents).includes('sender')) {
        if (App.urlContents.sender.trim() !== '')
            App.UI.senderName.innerHTML = App.urlContents['sender'];
    }
    if (Object.keys(App.urlContents).includes('recipient')) {
        if (App.urlContents.sender.trim() !== '')
            App.UI.recipientName.innerHTML = App.urlContents['recipient'];
    }
    if (Object.keys(App.urlContents).includes('message')) {
        if (App.urlContents.message.trim() !== '') {
            App.UI.message.innerHTML = App.urlContents['message'];
            App.UI.messageWrapper.style.display = 'flex';
            App.UI.messagePrologue.style.display = 'block';
        }
    }

    window.addEventListener("resize", function() {
        App.ctx.setTransform(1, 0, 0, 1, 0, 0);
        App.canvas.width = App.canvas.clientWidth;
        App.canvas.height = App.canvas.clientHeight;
        App.ctx.scale(
            App.canvas.width / virtualCanvasSize,
            App.canvas.height / virtualCanvasSize
        );
    });

    document.getElementById('replay-btn').onclick = function() {
        frameNo = 0;
    }
}

function draw() {
    frameCount++;
    App.ctx.clearRect(0, 0, App.canvas.width, App.canvas.height);
    App.ctx.drawImage(App.assets.getAsset(`hug-0${frameNo}.png`), 0, 0);
    if (frameCount % PER_FRAME_DURATION === 0) {
        frameNo++;
    }
    if (frameNo >= NUM_FRAMES) {
        frameNo = NUM_FRAMES - 1;
    }

    window.requestAnimationFrame(draw);
}

window.onload = init;