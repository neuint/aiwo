import React, { FC, useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import * as THREE from 'three';
import isRetina from 'is-retina';
import { noop } from 'lodash';

import View from '@presentations/World';
import WorldElement from '@containers/WorldElement';
import WorldMessages from '@containers/WorldMessages';
import WorldTempElement from '@containers/WorldTempElement';
import WorldPositionContext, { PositionType } from '@context/WorldPosition';
import WorldClickContext from '@context/WorldClick';
import { checkConnected } from '@ducks/connection/selectors';
import { worldCreate, worldUpdate, worldSetOut } from '@ducks/world';
import { getTempElement, getTempId, getControlId } from '@ducks/world/selectors';
import WorldBridge from '@root/WorldBridge';
import IElement from '@common/World/elements/IElement';
import { getRadians } from '@common/utils/angle';
import { getMinimalRotationGetter } from '@root/utils/world';
import { UPDATE_ELEMENT } from '@common/World/constants/events';
import { BaseParamsType } from '@common/World/types/elemets';
import useViewportElements from '@root/hooks/useViewportElements';

const FOCUS_INCREASE = 11;

type PropsType = {
  className?: string;
  onHover: (idList: string[]) => void;
};

const World: FC<PropsType> = ({ className, onHover }: PropsType) => {
  const dispatch = useDispatch();
  const connected = useSelector(checkConnected);
  const tempElement = useSelector(getTempElement);
  const tempId = useSelector(getTempId);
  const controlId = useSelector(getControlId);
  const container = useRef<HTMLDivElement>(null);
  const cameraOut = useRef(1);
  const scale = useRef(isRetina() ? 2 : 1);
  const renderer = useRef<THREE.WebGLRenderer>();
  const camera = useRef<THREE.OrthographicCamera>();
  const pointer = useRef<THREE.Vector2>();
  const raycaster = useRef<THREE.Raycaster>();
  const controlIdRef = useRef(controlId);
  const verticalOffsetRef = useRef(0.5);
  const animationId = useRef(0);
  const dragInfo = useRef<{
    pointer: { x: number, y: number }, camera: { x: number, y: number }
  } | undefined>();
  const [scene, setScene] = useState<THREE.Scene>();
  const [position, setPosition] = useState<PositionType>({ x: 0, y: 0 });
  const [clickList, setClickList] = useState<string[]>([]);

  const viewportIdList = useViewportElements(camera, container);

  useEffect(() => {
    controlIdRef.current = controlId;
  }, [controlId]);

  const controlElement = useMemo<IElement | undefined>((): IElement | undefined => {
    let element: IElement | undefined;
    try {
      const bridge = WorldBridge.get();
      element = bridge.elements.find((e: IElement) => e.id === controlId);
    } catch (err) {
      return undefined;
    }
    return element;
  }, [controlId]);

  const updateCameraOffset = useCallback((out: number) => {
    if (!connected || !camera.current) return;
    const root = container.current as HTMLDivElement;
    const { right, left, top, bottom } = camera.current;
    let { x, y } = (pointer.current || { x: 0, y: 0 }) as THREE.Vector2;
    const { width: rootWidth, height: rootHeight } = root.getBoundingClientRect();

    const newWidth = out * rootWidth;
    const width = Math.abs(left) + right;
    const newHeight = out * rootHeight;
    const height = Math.abs(top) + bottom;
    const diffWidth = newWidth - width;
    const diffHeight = newHeight - height;
    camera.current.left = -newWidth / 2;
    camera.current.right = newWidth / 2;

    camera.current.top = -newHeight * verticalOffsetRef.current;
    camera.current.bottom = newHeight * (1 - verticalOffsetRef.current);
    camera.current.updateProjectionMatrix();
    cameraOut.current = out;
    dispatch(worldSetOut(out));
    if (!controlIdRef.current) {
      camera.current.position.setX(camera.current.position.x - (diffWidth / 2) * x);
      camera.current.position.setY(camera.current.position.y + (diffHeight / 2) * y);
    }
  }, [connected, dispatch]);

  const resizeHandler = useCallback(() => {
    if (!connected) return;
    const scaleValue = scale.current;
    const root = container.current as HTMLDivElement;
    const { width, height } = root.getBoundingClientRect();
    renderer?.current?.setSize(width * scaleValue, height * scaleValue);
    updateCameraOffset(cameraOut.current);
  }, [connected, updateCameraOffset]);

  const createElement = useCallback(() => {
    if (!tempElement || tempElement.id) return;
    const scaleValue = scale.current;
    const { x, y } = pointer.current as THREE.Vector2;
    const root = container.current as HTMLDivElement;
    const { width, height } = root.getBoundingClientRect();
    dispatch(worldCreate({
      ...tempElement,
      x: ((width * x) / scaleValue) * cameraOut.current + (camera?.current?.position.x || 0),
      y: -((height * y) / scaleValue) * cameraOut.current + (camera?.current?.position.y || 0),
    }));
  }, [dispatch, tempElement]);

  const updateElement = useCallback(() => {
    if (!tempElement || !tempElement.id) return;
    const scaleValue = scale.current;
    const { x, y } = pointer.current as THREE.Vector2;
    const root = container.current as HTMLDivElement;
    const { width, height } = root.getBoundingClientRect();
    dispatch(worldUpdate({
      ...tempElement,
      x: ((width * x) / scaleValue) * cameraOut.current + (camera?.current?.position.x || 0),
      y: -((height * y) / scaleValue) * cameraOut.current + (camera?.current?.position.y || 0),
    }));
  }, [dispatch, tempElement]);

  const updateClickList = useCallback(() => {
    if (raycaster.current && camera.current && scene) {
      raycaster.current.setFromCamera(pointer.current as THREE.Vector2, camera.current);
      const intersects = raycaster.current.intersectObjects(scene.children);
      if (intersects.length) {
        setClickList(intersects.map(({ object }) => object.uuid));
      } else {
        setClickList([]);
      }
    }
  }, [scene, setClickList]);

  const updateHoverList = useCallback(() => {
    if (raycaster.current && camera.current && scene) {
      raycaster.current.setFromCamera(pointer.current as THREE.Vector2, camera.current);
      const intersects = raycaster.current.intersectObjects(scene.children);
      if (intersects.length) {
        onHover(intersects.map(({ object }) => object.uuid));
      } else {
        onHover([]);
      }
    }
  }, [scene, onHover]);

  const pointerMoveHandler = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    if (!pointer.current) return;
    const scaleValue = scale.current;
    const root = container.current as HTMLDivElement;
    const { width, height } = root.getBoundingClientRect();
    const x = (event.clientX / width) * 2 - 1;
    const y = -1 * (event.clientY / height) * 2 + 1;
    pointer.current.x = x;
    pointer.current.y = y;

    setPosition({
      x: ((width * x) / scaleValue) * cameraOut.current + (camera?.current?.position.x || 0),
      y: -((height * y) / scaleValue) * cameraOut.current + (camera?.current?.position.y || 0),
    });
    updateHoverList();
    if (dragInfo.current && camera.current && !controlId) {
      const {
        pointer: { x: startX, y: startY }, camera: { x: cameraX, y: cameraY },
      } = dragInfo.current;
      const diffX = event.clientX - startX;
      const diffY = event.clientY - startY;

      camera.current.position.setX(cameraX - diffX * cameraOut.current);
      camera.current.position.setY(cameraY - diffY * cameraOut.current);
    }
  }, [updateHoverList, controlId]);

  const wheelHandler = useCallback((event: WheelEvent) => {
    event.preventDefault();
    event.stopPropagation();
    updateCameraOffset(Math.max(0, cameraOut.current + event.deltaY * 0.001));
  }, [updateCameraOffset]);

  const mouseDownHandler = useCallback((e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (!camera.current) return;
    dragInfo.current = {
      pointer: { x: e.clientX, y: e.clientY },
      camera: { x: camera.current.position.x, y: camera.current.position.y },
    };
  }, []);

  const mouseUpHandler = useCallback((e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (dragInfo.current) {
      const { x: startX, y: startY } = dragInfo.current.pointer;
      const diffX = Math.abs(e.clientX - startX);
      const diffY = Math.abs(e.clientY - startY);
      if (diffY <= 2 && diffX <= 2) {
        createElement();
        updateElement();
        updateClickList();
      }
    }
    dragInfo.current = undefined;
  }, [createElement, updateElement, updateClickList]);

  useEffect(() => {
    if (!connected) return;
    const scaleValue = scale.current;
    const root = container.current as HTMLDivElement;
    const { width, height } = root.getBoundingClientRect();
    const worldCamera = new THREE.OrthographicCamera(
      width / -2, width / 2, height / 2, height / -2, 1, 1000000,
    );
    worldCamera.position.z = 100;
    const worldRenderer = new THREE.WebGLRenderer({ antialias: true });
    const worldScene = new THREE.Scene();
    const worldRaycaster = new THREE.Raycaster();
    const worldPointer = new THREE.Vector2();
    worldRaycaster.setFromCamera(worldPointer, worldCamera);
    worldRenderer.setSize(width * scaleValue, height * scaleValue);
    worldRenderer.render(worldScene, worldCamera);
    renderer.current = worldRenderer;
    camera.current = worldCamera;
    pointer.current = worldPointer;
    raycaster.current = worldRaycaster;
    root.appendChild(worldRenderer.domElement);
    setScene(worldScene);
    const animate = (): void => {
      worldRenderer.render(worldScene, worldCamera);
    };
    worldRenderer.setAnimationLoop(animate);
  }, [connected, setScene]);

  const setCameraPosition = useCallback((
    info: { x: number, y: number, rotateZ: number, out: number, verticalOffset: number },
  ) => {
    const worldCamera = camera.current;
    if (!worldCamera) return;
    worldCamera.position.setX(info.x);
    worldCamera.position.setY(info.y);
    worldCamera.rotation.set(0, 0, info.rotateZ);
    verticalOffsetRef.current = info.verticalOffset;
    updateCameraOffset(info.out);
  }, [updateCameraOffset]);

  const animateCameraPosition = useCallback((
    info: {
      x?: number;
      y?: number;
      rotateZ?: number;
      out?: number;
      duration?: number;
      verticalOffset?: number;
    },
  ) => {
    const worldCamera = camera.current;
    if (!worldCamera) return;
    const { position: { x: startX, y: startY }, rotation: { z: startRotateZ } } = worldCamera;
    const { current: startOut } = cameraOut;
    const { current: startVerticalOffset } = verticalOffsetRef;
    animationId.current += 1;
    const currentAnimationId = animationId.current;
    const {
      x = startX, y = startY, out = startOut, rotateZ = startRotateZ, duration = 400,
      verticalOffset = startVerticalOffset,
    } = info;
    const notUpdate = x === startX && y === startY && rotateZ === startRotateZ
      && out === startOut && verticalOffset === startVerticalOffset;
    if (notUpdate) return;
    let startTime = 0;
    const rotateZGetter = getMinimalRotationGetter(rotateZ, startRotateZ);

    const step = (timestamp: number): void => {
      startTime = startTime || timestamp;
      if (currentAnimationId !== animationId.current) return;
      const elapsed = timestamp - startTime;
      if (elapsed < duration) {
        const part = elapsed / duration;
        setCameraPosition({
          x: startX + (x - startX) * part,
          y: startY + (y - startY) * part,
          rotateZ: rotateZGetter(part),
          out: startOut + (out - startOut) * part,
          verticalOffset: startVerticalOffset + (verticalOffset - startVerticalOffset) * part,
        });
        requestAnimationFrame(step);
      } else {
        setCameraPosition({ x, y, rotateZ, out, verticalOffset });
      }
    };
    requestAnimationFrame(step);
  }, [setCameraPosition]);

  const moveCameraToElement = useCallback((element: IElement, animate = true, skipOut = false) => {
    const root = container.current as HTMLDivElement;
    const { width: offsetWidth, height: offsetHeight } = root.getBoundingClientRect();
    const { box: { width, height } } = element;
    const { params: { x, y, angle = 0 } } = element;

    const out = width >= height
      ? (width * FOCUS_INCREASE) / offsetWidth
      : (height * FOCUS_INCREASE) / offsetHeight;
    const rotateZ = getRadians(90 + angle);

    const params = {
      x,
      y,
      rotateZ,
      out: skipOut ? cameraOut.current : out,
      verticalOffset: 0.8,
    };

    if (animate) {
      animateCameraPosition(params);
    } else {
      setCameraPosition(params);
    }
  }, [animateCameraPosition, setCameraPosition]);

  useEffect(() => {
    const worldCamera = camera.current;
    if (!worldCamera || !controlElement) return noop;
    if (controlElement) moveCameraToElement(controlElement);
    return () => {
      animateCameraPosition({ rotateZ: 0, verticalOffset: 0.5 });
    };
  }, [controlElement, animateCameraPosition, moveCameraToElement]);

  const updateElementHandler = useCallback((params: BaseParamsType) => {
    if (controlElement && params.id === controlElement?.id) {
      moveCameraToElement(controlElement, false, true);
    }
  }, [controlElement, moveCameraToElement]);

  useEffect(() => {
    if (!connected) return noop;
    const bridge = WorldBridge.get();
    bridge.addEventListener(UPDATE_ELEMENT, updateElementHandler);
    return () => {
      bridge.removeEventListener(UPDATE_ELEMENT, updateElementHandler);
    };
  }, [updateElementHandler, connected]);

  const elements = useMemo(() => {
    return scene ? viewportIdList.map((id: number) => {
      return tempId === id ? null : (
        <WorldElement key={id} id={id} scene={scene} />
      );
    }) : null;
  }, [viewportIdList, scene, tempId]);

  return (
    <WorldClickContext.Provider value={clickList}>
      <WorldPositionContext.Provider value={position}>
        <View
          ref={container}
          className={className}
          waiting={!connected}
          onResize={resizeHandler}
          onPointerMove={pointerMoveHandler}
          onMouseDown={mouseDownHandler}
          onMouseUp={mouseUpHandler}
          onMouseLeave={mouseUpHandler}
          onWheel={wheelHandler}
        />
        {scene && (<WorldTempElement scene={scene} />)}
        {elements}
        {scene && (<WorldMessages scene={scene} />)}
      </WorldPositionContext.Provider>
    </WorldClickContext.Provider>
  );
};

export default World;
