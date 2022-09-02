/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable global-require */
/* eslint-disable import/no-dynamic-require */
const { parentPort } = require('worker_threads');

let firstBuffer;

let itemPath = '../../pkg/item';

const run = (worldState, actionData) => {
  const { iteration, get_item_state_size: getItemStateSize } = require(itemPath);

  const itemState = new Float32Array(Float32Array.BYTES_PER_ELEMENT * getItemStateSize());

  return () => {
    iteration(worldState, itemState, actionData);
  };
};

let runIteration;

const onTextMessage = (message) => {
  if (message === 'iteration') {
    runIteration();
    parentPort.postMessage('iteration');
  } else {
    itemPath = message;
  }
};

parentPort.on('message', (message) => {
  if (typeof message === 'string') {
    onTextMessage(message);
  } else if (!firstBuffer) {
    firstBuffer = message;
  } else if (firstBuffer && message) {
    if (firstBuffer.length > message.length) {
      runIteration = run(firstBuffer, message);
    }
  }
});
