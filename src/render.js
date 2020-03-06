const videoElement = document.querySelector('video');
const startRec = document.getElementById('startRec');
const stopRec = document.getElementById('stopRec');
const selectRecElement = document.getElementById('selectRecElement');
const actionContainer = document.getElementById('action-container');
const saveButton = document.getElementById('saveRec');
const deleteButton = document.getElementById('deleteRec');
// Write file will allow to create a file on our system when we save the recorded stream.
const { writeFile } = require('fs');
const { desktopCapturer, remote } = require('electron');
const { Menu, dialog } = remote;

// Global state used to buffer the current recorded chunks and allow for button handlers.
let mediaRecorder;
let recordedChunks = [];
let blob;
let videoBuffer;

// Set on click event to select what video source you want to record.
selectRecElement.onclick = promptScreenSelection;
saveButton.onclick = handleSave;
deleteButton.onclick = handleDelete;


// Start recording event handler.
startRec.onclick = e => {
    mediaRecorder.start();
    startRec.classList.add('hidden');
    stopRec.classList.remove('hidden');
};

// Stop recording event handler.
stopRec.onclick = e => {
    mediaRecorder.stop();
    stopRec.classList.add('hidden');
    actionContainer.classList.remove('hidden');
}


// Get all the available video sources full screen windows will not appear.
async function promptScreenSelection() {

    const inputSources = await desktopCapturer.getSources({
        types: ['window', 'screen']
    });

    const videoOptionsMenu = Menu.buildFromTemplate(
        inputSources.map(sourceItem => {
            return {
                label: sourceItem.name,
                click: () => selectSource(sourceItem)
            };
        })
    );

    videoOptionsMenu.popup();
}

/**
 * This function will handle the selection of what window on your desktop you want to record.
 * There is a few constraints you can include this is where you can find those: https://w3c.github.io/mediacapture-main/#mediadevices
 * 
 * It will then create a stream and display it on the video element in our front end. Also specifying event listeners to stop and save the
 * recording from that window.
 */
async function selectSource(StreamSource) {

    //Set inner text of our menu to the source the user has selected.
    startRec.disabled = false;
    selectRecElement.innerText = `Selected: ${StreamSource.name}`;

    const constraints = {
        audio: false,
        video: {
            mandatory: {
                chromeMediaSource: 'desktop',
                chromeMediaSourceId: StreamSource.id
            }
        }
    }

    // Create the stream for the selected src to be displayed on the video element in our frontend.
    const stream = await navigator.mediaDevices
        .getUserMedia(constraints);
    //Serve for frontend.
    videoElement.srcObject = stream;
    videoElement.play();

    // Create the Media Recorder that will capture the selected source.
    const mediaRecorderOptions = { mimeType: 'video/webm' };
    mediaRecorder = new MediaRecorder(stream, mediaRecorderOptions);

    // Register Event Handlers
    mediaRecorder.ondataavailable = handleDataAvailable;
    mediaRecorder.onstop = handleStop;
}

// This function handles capturing all the recorded chunks
function handleDataAvailable(e) {
    recordedChunks.push(e.data);
}

async function handleSave() {
    const { filePath } = await dialog.showSaveDialog({
        buttonLabel: 'Save Recording',
        defaultPath: `recording-${Date.now()}.webm`
    });

    writeFile(filePath, videoBuffer, () => { console.log("Video was saved successfully"); });
    actionContainer.classList.add('hidden');
    startRec.classList.remove('hidden');
}

function handleDelete() {
    recordedChunks = null;
    actionContainer.classList.add('hidden');
    startRec.classList.remove('hidden');
}

async function handleStop() {
    blob = new Blob(recordedChunks, {
        type: 'video/webm'
    });
    videoBuffer = Buffer.from(await blob.arrayBuffer());
}