import { useLoader } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

export const useGltfLoader = (url: string) => {
  const gltf = useLoader(GLTFLoader, url);
  return gltf;
};
/**
 * Advanced GLTF Loader for Quoridor 3D
 * Matches the sophisticated GLTF loading setup from the original vanilla JS implementation
 */
export const loadGltfModel = (url: string) => {
  return useGltfLoader(url);
};