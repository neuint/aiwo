/// <reference types="troika-three-text" />
declare module 'troika-three-text' {
  export class Text {
    text: string;

    font: string;

    fontSize: number;

    position: { x: number; y: number; z: number };

    rotation: {
      x: number;
      y: number;
      z: number;
      set: (x: number, y: number, z: number) => void;
    };

    color: string;

    anchorX: string;

    anchorY: string;

    dispose(): void;

    sync(): void;
  }
}
