import { useGltfLoader } from '../../../Utils/GltfLoader';
import React from 'react';

export const CornCharacter: React.FC = () => {
  const cornGltf = useGltfLoader('/assets/gltfLoader/corn.glb');
  return <primitive object={cornGltf.scene} />;
};

export const SmokingCharacter: React.FC = () => {
  const smokingGltf = useGltfLoader('/assets/gltfLoader/smoking.glb');
  return <primitive object={smokingGltf.scene} />;
};
