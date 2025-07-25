import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface SmokeEffectProps {
  position?: [number, number, number];
  particleCount?: number;
  size?: number;
  color?: string;
  intensity?: number;
}

/**
 * Advanced Smoke Particle System Component
 * Matches the sophisticated particle system from the original vanilla JS implementation
 */
export const SmokeEffect: React.FC<SmokeEffectProps> = ({
  position = [0, 0, 0],
  particleCount = 25,
  size = 1.2,
  color = 'rgba(200, 200, 200, 0.6)',
  intensity = 0.6
}) => {
  const particlesRef = useRef<THREE.Points>(null);
  const geometryRef = useRef<THREE.BufferGeometry>(null);
  
  type ParticleData = {
    velocity: THREE.Vector3;
    life: number;
    maxLife: number;
  };

  // Particle data for individual tracking
  const particleData = useRef<ParticleData[]>([]);

  // Create smoke texture using canvas (matches original implementation)
  const smokeTexture = useMemo(() => {
    // Guard against SSR environments
    if (typeof document === 'undefined') {
      return null;
    }

    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const context = canvas.getContext('2d');

    if (!context) {
      console.error("SmokeEffect: Failed to get 2D context from canvas.");
      return null;
    }
    
    const gradient = context.createRadialGradient(
      canvas.width / 2, canvas.height / 2, 0,
      canvas.width / 2, canvas.height / 2, canvas.width / 2
    );
    
    // Use a default color if the provided one is invalid, to prevent crashes
    gradient.addColorStop(0, color);
    gradient.addColorStop(1, 'rgba(200, 200, 200, 0)');
    
    context.fillStyle = gradient;
    context.fillRect(0, 0, canvas.width, canvas.height);
    
    return new THREE.CanvasTexture(canvas);
  }, [color]);

  // Create particle material with custom shader modifications
  const material = useMemo(() => {
    if (!smokeTexture) {
      return null;
    }

    const mat = new THREE.PointsMaterial({
      size,
      map: smokeTexture,
      blending: THREE.NormalBlending,
      transparent: true,
      depthWrite: false,
    });

    // Custom shader modification for individual particle opacity control
    mat.onBeforeCompile = (shader) => {
      // Add alpha attribute to vertex shader
      shader.vertexShader = 'attribute float alpha;\nvarying float vAlpha;\n' + shader.vertexShader;
      shader.vertexShader = shader.vertexShader.replace(
        '#include <begin_vertex>',
        '#include <begin_vertex>\nvAlpha = alpha;'
      );
      
      // Modify fragment shader to use individual alpha
      shader.fragmentShader = 'varying float vAlpha;\n' + shader.fragmentShader;
      shader.fragmentShader = shader.fragmentShader.replace(
        'vec4 diffuseColor = vec4( diffuse, opacity );',
        'vec4 diffuseColor = vec4( diffuse, opacity * vAlpha );'
      );
    };

    return mat;
  }, [smokeTexture, size]);

  // Initialize particle data and buffer attributes
  // This effect runs only when particleCount or intensity changes
  useEffect(() => {
    const data: ParticleData[] = [];
    for (let i = 0; i < particleCount; i++) {
      data.push({
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 0.005, // Slow horizontal drift
          Math.random() * 0.3 + 0.02,   // Steady upward movement
          (Math.random() - 0.5) * 0.005  // Slow depth drift
        ),
        life: Math.random() * 3.0,       // Start at a random point in life
        maxLife: Math.random() * 2.0 + 2.0, // Total lifespan of 2-4 seconds
      });
    }
    particleData.current = data;

    // Initialize buffer attributes
    const positions = new Float32Array(particleCount * 3);
    const opacities = new Float32Array(particleCount);
    for (let i = 0; i < particleCount; i++) {
      positions.set([(Math.random() - 0.5) * 0.2, (Math.random() - 0.5) * 0.2, (Math.random() - 0.5) * 0.2], i * 3);
      opacities[i] = intensity;
    }

    if (geometryRef.current) {
      geometryRef.current.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      geometryRef.current.setAttribute('alpha', new THREE.BufferAttribute(opacities, 1));
    }
  }, [particleCount, intensity]);

  // Disable raycasting for smoke particles to prevent interference with clicks
  useEffect(() => {
    if (particlesRef.current) {
      particlesRef.current.raycast = () => {};
    }
  }, []);

  // Animation loop - update particles each frame
  useFrame((state, deltaTime) => {
    if (
      !particlesRef.current || 
      !geometryRef.current || 
      !geometryRef.current.attributes.position ||
      !geometryRef.current.attributes.alpha
    ) return;

    const posAttr = geometryRef.current.attributes.position as THREE.BufferAttribute;
    const alphaAttr = geometryRef.current.attributes.alpha as THREE.BufferAttribute;

    for (let i = 0; i < particleCount; i++) {
      const data = particleData.current[i];
      data.life += deltaTime;

      // If a particle's life is over, reset it at the origin
      if (data.life > data.maxLife) {
        posAttr.setXYZ(i, (Math.random() - 0.5) * 0.1, 0, (Math.random() - 0.5) * 0.1);
        data.life = 0;
        // Give it a new random velocity
        data.velocity.x = (Math.random() - 0.5) * 0.05;
        data.velocity.y = Math.random() * 0.3 + 0.2;
        data.velocity.z = (Math.random() - 0.5) * 0.05;
      }

      // Update its position based on its velocity
      const currentX = posAttr.getX(i);
      const currentY = posAttr.getY(i);
      const currentZ = posAttr.getZ(i);
      
      posAttr.setXYZ(i,
        currentX + data.velocity.x * deltaTime,
        currentY + data.velocity.y * deltaTime,
        currentZ + data.velocity.z * deltaTime
      );

      // Update its opacity to fade in and out smoothly
      const lifeRatio = data.life / data.maxLife;
      const opacity = Math.sin(lifeRatio * Math.PI) * intensity; // Creates a nice fade-in/out curve
      alphaAttr.setX(i, opacity);
    }

    // Tell Three.js that the buffer data has changed
    posAttr.needsUpdate = true;
    alphaAttr.needsUpdate = true;
  });

  if (!material) return null;

  return (
    <points ref={particlesRef} position={position}>
      <bufferGeometry ref={geometryRef} />
      <primitive object={material} />
    </points>
  );
};

export default SmokeEffect;