import { useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { easing } from 'maath';

/** Camera lệch nhẹ theo con trỏ để lớp sao và lớp hạt trượt khác nhau, cảnh có chiều sâu */
export function CameraRig({ distance = 9, strength = 0.45 }: { distance?: number; strength?: number }): null {
  const goal = useMemo(() => new THREE.Vector3(), []);
  useFrame((state, dt) => {
    goal.set(state.pointer.x * strength, state.pointer.y * strength * 0.7, distance);
    easing.damp3(state.camera.position, goal, 0.6, dt);
    state.camera.lookAt(0, 0, 0);
  });
  return null;
}
