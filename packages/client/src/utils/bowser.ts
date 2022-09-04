import * as Bowser from 'bowser';

export const browser = Bowser.getParser(window.navigator.userAgent);

export const IS_MAC = browser.getOSName() === 'macOS';
