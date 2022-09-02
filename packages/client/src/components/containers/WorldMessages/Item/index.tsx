import { FC, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import * as THREE from 'three';
import { Text } from 'troika-three-text';

import { worldRemoveMessage } from '@ducks/world';
import { getControlElement, getMessage, getOut } from '@ducks/world/selectors';
import appConfig from '@root/appConfig.json';
import StateType from '@ducks/StateType';
import { RED_COLOR, GORSE } from '@common/World/constants/color';
import { getRadians } from '@common/utils/angle';

type PropsType = {
  id: number;
  scene: THREE.Scene;
};

const WorldMessagesItem: FC<PropsType> = ({ id, scene }: PropsType) => {
  const dispatch = useDispatch();
  const removeTimeout = useRef<ReturnType<typeof setTimeout>>();
  const params = useSelector(getControlElement);
  const out = useSelector(getOut);
  const message = useSelector((state: StateType) => getMessage(state, id));

  const textObject = useRef<Text>();

  useEffect(() => {
    removeTimeout.current = setTimeout(() => {
      removeTimeout.current = undefined;
      dispatch(worldRemoveMessage(id));
    }, appConfig.messageShowDuration);
    return () => {
      if (removeTimeout.current) {
        clearTimeout(removeTimeout.current);
        dispatch(worldRemoveMessage(id));
      }
    };
  }, [id, dispatch]);

  useEffect(() => () => {
    if (textObject.current) {
      scene.remove(textObject.current as unknown as THREE.Object3D);
      textObject.current.dispose();
    }
  }, [message, scene]);

  useEffect(() => {
    const angle = params?.angle || 270;
    if (!message) return;
    const { sourcePoint: { x, y }, message: text, idList } = message;
    const rotateZ = getRadians(270 - angle);
    const rotateX = getRadians(180);
    if (textObject.current) {
      textObject.current.rotation.set(rotateX, 0, rotateZ);
      textObject.current.fontSize = 20 * out;
      textObject.current.color = idList.includes(params?.id || 0) ? RED_COLOR : GORSE;
      textObject.current.sync();
    } else {
      const messageText = new Text();
      messageText.text = text;
      messageText.font = appConfig.fontPath;
      messageText.fontSize = 20 * out;
      messageText.anchorX = 'center';
      messageText.anchorY = 'middle';
      messageText.position.x = x;
      messageText.position.y = y;
      messageText.position.z = 50;
      messageText.rotation.set(rotateX, 0, rotateZ);
      messageText.color = idList.includes(params?.id || 0) ? RED_COLOR : GORSE;
      scene.add(messageText as unknown as THREE.Object3D);
      textObject.current = messageText;
    }
  }, [message, params, scene, out]);

  return null;
};

export default WorldMessagesItem;
