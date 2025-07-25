
import { useGltfLoader } from '../../../Utils/GltfLoader';
import React from 'react';
import { SmokeEffect } from '../SmokeEffect/SmokeEffect';

export const CornCharacter: React.FC = () => {
  const cornGltf = useGltfLoader('/assets/gltfLoader/corn.glb');
  return (
    <group>
      <primitive object={cornGltf.scene} scale={[3, 3, 3]} />
      {/* Smoke effect positioned exactly like original game for corn character */}
      <SmokeEffect position={[0.32, 0.1, 0.05]} />
    </group>
  );
};

export const SmokingCharacter: React.FC = () => {
  const smokingGltf = useGltfLoader('/assets/gltfLoader/smoking.glb');
  return (
    <group>
      <primitive object={smokingGltf.scene} scale={[3, 3, 3]} />
      {/* Smoke effect positioned exactly like original game for smoking character */}
      <SmokeEffect position={[0.2, 0.3, 0.16]} />
    </group>
  );
};
