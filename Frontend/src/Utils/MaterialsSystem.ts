import * as THREE from 'three';
import { useLoader } from '@react-three/fiber';
import { MaterialTextures, GameMaterials } from '../Types';

/**
 * Advanced PBR Materials System for Quoridor 3D
 * Matches the sophisticated material setup from the original vanilla JS implementation
 */

// Material configuration interfaces
export interface PBRMaterialConfig {
  albedoPath?: string;
  normalPath?: string;
  aoPath?: string;
  roughnessPath?: string;
  metallicPath?: string;
  heightPath?: string;
  displacementScale?: number;
  roughness?: number;
  metalness?: number;
  color?: number;
  clearcoat?: number;
  clearcoatRoughness?: number;
  emissive?: number;
  emissiveIntensity?: number;
  transmission?: number;
  thickness?: number;
  transparent?: boolean;
  opacity?: number;
  repeatX?: number;
  repeatY?: number;
}

// Material configurations matching the original game exactly
export const MATERIAL_CONFIGS = {
  board: {
    albedoPath: '/assets/textures/stone-tile4b_bl/tile4b_basecolor.png',
    normalPath: '/assets/textures/stone-tile4b_bl/tile4b_normal-ogl.png',
    aoPath: '/assets/textures/stone-tile4b_bl/tile4b_ao.png',
    roughnessPath: '/assets/textures/stone-tile4b_bl/tile4b_roughness.png',
    displacementScale: 0.2,
    roughness: 1.0,
    metalness: 1.0,
    color: 0xffffff,
    clearcoat: 0.3,
    clearcoatRoughness: 0.1,
    emissive: 0x0a1c2e,
    emissiveIntensity: 0.1,
    repeatX: 1,
    repeatY: 1
  } as PBRMaterialConfig,
  
  goal: {
    albedoPath: '/assets/textures/darktiles1-bl/darktiles1_basecolor.png',
    normalPath: '/assets/textures/darktiles1-bl/darktiles1_normal-ogl.png',
    aoPath: '/assets/textures/darktiles1-bl/darktiles1_AO.png',
    roughnessPath: '/assets/textures/darktiles1-bl/darktiles1_roughness.png',
    metallicPath: '/assets/textures/darktiles1-bl/darktiles1_metallic.png',
    roughness: 1.0,
    metalness: 1.0,
    color: 0xffffff,
    clearcoat: 0.3,
    clearcoatRoughness: 0.1,
    emissive: 0x0a1c2e,
    emissiveIntensity: 0.1,
    repeatX: 1,
    repeatY: 1
  } as PBRMaterialConfig,
  
  wall: {
    albedoPath: '/assets/textures/black-white-tile-bl/black-white-tile_albedo.png',
    normalPath: '/assets/textures/black-white-tile-bl/black-white-tile_normal-ogl.png',
    roughnessPath: '/assets/textures/black-white-tile-bl/black-white-tile_roughness.png',
    roughness: 1.0,
    metalness: 0.5,
    color: 0xffffff,
    clearcoat: 0.7,
    clearcoatRoughness: 0.15,
    emissive: 0x0f172a,
    emissiveIntensity: 0.5,
    repeatX: 0.33,
    repeatY: 0.15
  } as PBRMaterialConfig,
  
  ground: {
    albedoPath: '/assets/textures/rocky-rugged-terrain-bl/rocky-rugged-terrain_1_albedo.png',
    normalPath: '/assets/textures/rocky-rugged-terrain-bl/rocky-rugged-terrain_1_normal-ogl.png',
    aoPath: '/assets/textures/rocky-rugged-terrain-bl/rocky-rugged-terrain_1_ao.png',
    roughnessPath: '/assets/textures/rocky-rugged-terrain-bl/rocky-rugged-terrain_1_roughness.png',
    metallicPath: '/assets/textures/rocky-rugged-terrain-bl/rocky-rugged-terrain_1_metallic.png',
    heightPath: '/assets/textures/rocky-rugged-terrain-bl/rocky-rugged-terrain_1_height.png',
    displacementScale: 0.5,
    roughness: 1.0,
    metalness: 0.2,
    color: 0xffffff,
    repeatX: 3,
    repeatY: 3
  } as PBRMaterialConfig
};

// Highlight materials matching original exactly
export const HIGHLIGHT_MATERIALS = {
  wallPlaceholder: {
    color: 0x60a5fa,
    transparent: true,
    opacity: 0.5,
    emissive: 0x3b82f6,
    emissiveIntensity: 0.3,
    transmission: 0.2,
    thickness: 0.3
  },
  
  highlightMove: {
    color: 0x3b82f6,
    emissive: 0x60a5fa,
    emissiveIntensity: 0.25,
    roughness: 0.15,
    metalness: 0.7,
    transparent: true,
    opacity: 0.55
  },
  
  highlightWall: {
    color: 0xaa00ff,
    emissive: 0x6600aa,
    emissiveIntensity: 0.5,
    transparent: true,
    opacity: 0.8
  },
  
  highlightFirstWall: {
    color: 0xff8800,
    emissive: 0xff4400,
    emissiveIntensity: 0.8,
    transparent: true,
    opacity: 1.0
  },
  
  highlightSecondWall: {
    color: 0x00ff88,
    emissive: 0x00cc44,
    emissiveIntensity: 0.4,
    transparent: true,
    opacity: 0.8
  }
};

// Asset paths - Legacy support
export const TEXTURE_PATHS = {
    board: {
        stoneTile: '/assets/textures/stone-tile4b_bl/',
        darkTiles: '/assets/textures/darktiles1-bl/',
        bathroomTile: '/assets/textures/bathroomtile2-bl/',
        rockyTerrain: '/assets/textures/rocky-rugged-terrain-bl/',
        waterWorn: '/assets/textures/waterwornstone1_bl/'
    },
    wall: {
        blackWhiteTile: '/assets/textures/black-white-tile-bl/',
        victorianBrick: '/assets/textures/victorian-brick-unity/',
        stylizedGrass: '/assets/textures/stylized-grass/'
    },
    goal: {
        darkTiles: '/assets/textures/darktiles1-bl/',
        bathroomTile: '/assets/textures/bathroomtile2-bl/'
    }
};

// Helper function to configure texture properties
export const configureTexture = (texture: THREE.Texture, repeatX: number = 1, repeatY: number = 1): THREE.Texture => {
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(repeatX, repeatY);
  return texture;
};

// React Hook to create PBR material with all textures
export const usePBRMaterial = (config: PBRMaterialConfig): THREE.MeshPhysicalMaterial => {
  // Load all required textures
  const textures = useLoader(THREE.TextureLoader, [
    config.albedoPath,
    config.normalPath,
    config.aoPath,
    config.roughnessPath,
    config.metallicPath,
    config.heightPath
  ].filter(Boolean) as string[]);
  
  // Map loaded textures to their properties
  const textureMap: Record<string, THREE.Texture> = {};
  let index = 0;
  
  if (config.albedoPath) textureMap.albedo = textures[index++];
  if (config.normalPath) textureMap.normal = textures[index++];
  if (config.aoPath) textureMap.ao = textures[index++];
  if (config.roughnessPath) textureMap.roughness = textures[index++];
  if (config.metallicPath) textureMap.metallic = textures[index++];
  if (config.heightPath) textureMap.height = textures[index++];
  
  // Configure texture wrapping and repeat
  Object.values(textureMap).forEach(texture => {
    configureTexture(texture, config.repeatX || 1, config.repeatY || 1);
  });
  
  // Create the material with all properties
  const material = new THREE.MeshPhysicalMaterial({
    map: textureMap.albedo,
    normalMap: textureMap.normal,
    aoMap: textureMap.ao,
    roughnessMap: textureMap.roughness,
    metalnessMap: textureMap.metallic,
    displacementMap: textureMap.height,
    displacementScale: config.displacementScale || 0,
    roughness: config.roughness || 0.5,
    metalness: config.metalness || 0.5,
    color: config.color || 0xffffff,
    clearcoat: config.clearcoat || 0,
    clearcoatRoughness: config.clearcoatRoughness || 0,
    emissive: config.emissive || 0x000000,
    emissiveIntensity: config.emissiveIntensity || 0,
    transmission: config.transmission || 0,
    thickness: config.thickness || 0,
    transparent: config.transparent || false,
    opacity: config.opacity || 1
  });
  
  return material;
};

// React Hook to create standard highlight material
export const useHighlightMaterial = (type: keyof typeof HIGHLIGHT_MATERIALS): THREE.MeshStandardMaterial => {
  const config = HIGHLIGHT_MATERIALS[type];
  
  const materialParams: THREE.MeshStandardMaterialParameters = {
    color: config.color,
    emissive: config.emissive,
    emissiveIntensity: config.emissiveIntensity,
    transparent: config.transparent || false,
    opacity: config.opacity || 1
  };
  if ('roughness' in config && typeof config.roughness === 'number') materialParams.roughness = config.roughness;
  if ('metalness' in config && typeof config.metalness === 'number') materialParams.metalness = config.metalness;
  const material = new THREE.MeshStandardMaterial(materialParams);
  
  return material;
};

// React Hook for wall placeholder material (MeshPhysicalMaterial)
export const useWallPlaceholderMaterial = (): THREE.MeshPhysicalMaterial => {
  const config = HIGHLIGHT_MATERIALS.wallPlaceholder;
  
  const material = new THREE.MeshPhysicalMaterial({
    color: config.color,
    emissive: config.emissive,
    emissiveIntensity: config.emissiveIntensity,
    transmission: config.transmission,
    thickness: config.thickness,
    transparent: config.transparent,
    opacity: config.opacity
  });
  
  return material;
};

/**
 * Loads PBR textures from a given path (Legacy support)
 */
export const loadPBRTextures = async (
    basePath: string,
    textureLoader: THREE.TextureLoader
): Promise<MaterialTextures> => {
    const textures: MaterialTextures = {};

    try {
        // Common PBR texture naming conventions
        const textureTypes = [
            { key: 'albedo', files: ['basecolor.png', 'albedo.png', 'Base_Color.png'] },
            { key: 'normal', files: ['normal-ogl.png', 'normal.png', 'Normal.png'] },
            { key: 'ao', files: ['ao.png', 'AO.png', 'Ambient_Occlusion.png'] },
            { key: 'roughness', files: ['roughness.png', 'Roughness.png'] },
            { key: 'metallic', files: ['metallic.png', 'metalness.png', 'Metallic.png'] },
            { key: 'height', files: ['height.png', 'Height.png'] }
        ];

        for (const type of textureTypes) {
            for (const filename of type.files) {
                try {
                    const texture = await textureLoader.loadAsync(`${basePath}${filename}`);
                    textures[type.key as keyof MaterialTextures] = texture;
                    break; // Found the texture, move to next type
                } catch (error) {
                    // Try next filename
                    continue;
                }
            }
        }

        // Configure texture properties
        Object.values(textures).forEach(texture => {
            if (texture) {
                texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
                texture.repeat.set(1, 1);
            }
        });

    } catch (error) {
        console.warn(`Failed to load textures from ${basePath}:`, error);
    }

    return textures;
};

/**
 * Creates a PBR material from loaded textures
 */
export const createPBRMaterial = (
    textures: MaterialTextures,
    options: {
        color?: number;
        roughness?: number;
        metalness?: number;
        clearcoat?: number;
        clearcoatRoughness?: number;
        emissive?: number;
        emissiveIntensity?: number;
        displacementScale?: number;
        textureRepeat?: [number, number];
    } = {}
): THREE.MeshPhysicalMaterial => {
    const material = new THREE.MeshPhysicalMaterial({
        map: textures.albedo,
        normalMap: textures.normal,
        aoMap: textures.ao,
        roughnessMap: textures.roughness,
        metalnessMap: textures.metallic,
        displacementMap: textures.height,
        
        // Default values from original game
        color: options.color || 0xffffff,
        roughness: options.roughness || 1.0,
        metalness: options.metalness || 1.0,
        clearcoat: options.clearcoat || 0.3,
        clearcoatRoughness: options.clearcoatRoughness || 0.1,
        emissive: options.emissive || 0x0a1c2e,
        emissiveIntensity: options.emissiveIntensity || 0.1,
        displacementScale: options.displacementScale || 0.2
    });

    // Apply texture repeat if specified
    if (options.textureRepeat && textures.albedo) {
        Object.values(textures).forEach(texture => {
            if (texture) {
                texture.repeat.set(options.textureRepeat![0], options.textureRepeat![1]);
            }
        });
    }

    return material;
};

/**
 * Material factory class for managing game materials
 */
export class MaterialFactory {
    private textureLoader: THREE.TextureLoader;
    private loadedTextures: Map<string, MaterialTextures> = new Map();
    private materials: Partial<GameMaterials> = {};

    constructor() {
        this.textureLoader = new THREE.TextureLoader();
    }

    /**
     * Initialize all game materials
     */
    async initializeMaterials(selectedSkins?: {
        boardTexture?: string;
        wallTexture?: string;
        goalTexture?: string;
    }): Promise<GameMaterials> {
        const skins = {
            boardTexture: selectedSkins?.boardTexture || 'stoneTile',
            wallTexture: selectedSkins?.wallTexture || 'blackWhiteTile',
            goalTexture: selectedSkins?.goalTexture || 'darkTiles'
        };

        try {
            // Load board material
            const boardTextures = await this.loadTextures(
                TEXTURE_PATHS.board[skins.boardTexture as keyof typeof TEXTURE_PATHS.board]
            );
            this.materials.board = createPBRMaterial(boardTextures, {
                color: 0xffffff,
                roughness: 1.0,
                metalness: 1.0,
                clearcoat: 0.3,
                clearcoatRoughness: 0.1,
                emissive: 0x0a1c2e,
                emissiveIntensity: 0.1,
                textureRepeat: [1, 1]
            });

            // Load wall material
            const wallTextures = await this.loadTextures(
                TEXTURE_PATHS.wall[skins.wallTexture as keyof typeof TEXTURE_PATHS.wall]
            );
            this.materials.wall = createPBRMaterial(wallTextures, {
                color: 0xffffff,
                roughness: 1.0,
                metalness: 1.0,
                clearcoat: 0.3,
                clearcoatRoughness: 0.1,
                emissive: 0x0a1c2e,
                emissiveIntensity: 0.1,
                textureRepeat: [0.33, 0.15]
            });

            // Load goal material
            const goalTextures = await this.loadTextures(
                TEXTURE_PATHS.goal[skins.goalTexture as keyof typeof TEXTURE_PATHS.goal]
            );
            this.materials.goal = createPBRMaterial(goalTextures, {
                color: 0xffffff,
                roughness: 1.0,
                metalness: 1.0,
                clearcoat: 0.3,
                clearcoatRoughness: 0.1,
                emissive: 0x0a1c2e,
                emissiveIntensity: 0.1,
                textureRepeat: [1, 1]
            });

            // Create player materials (simple colored materials with glow)
            this.materials.player1 = new THREE.MeshPhysicalMaterial({
                color: 0x3498db, // Blue
                roughness: 0.3,
                metalness: 0.1,
                clearcoat: 0.8,
                clearcoatRoughness: 0.2,
                emissive: 0x1e5f99,
                emissiveIntensity: 0.2
            });

            this.materials.player2 = new THREE.MeshPhysicalMaterial({
                color: 0xe74c3c, // Red
                roughness: 0.3,
                metalness: 0.1,
                clearcoat: 0.8,
                clearcoatRoughness: 0.2,
                emissive: 0x99321e,
                emissiveIntensity: 0.2
            });

        } catch (error) {
            console.error('Failed to initialize materials:', error);
            // Fallback to basic materials
            this.createFallbackMaterials();
        }

        return this.materials as GameMaterials;
    }

    /**
     * Load textures for a given path (with caching)
     */
    private async loadTextures(basePath: string): Promise<MaterialTextures> {
        if (this.loadedTextures.has(basePath)) {
            return this.loadedTextures.get(basePath)!;
        }

        const textures = await loadPBRTextures(basePath, this.textureLoader);
        this.loadedTextures.set(basePath, textures);
        return textures;
    }

    /**
     * Create fallback materials when textures fail to load
     */
    private createFallbackMaterials(): void {
        this.materials.board = new THREE.MeshPhysicalMaterial({
            color: 0xf0f0f0,
            roughness: 0.8,
            metalness: 0.1
        });

        this.materials.wall = new THREE.MeshPhysicalMaterial({
            color: 0x34495e,
            roughness: 0.9,
            metalness: 0.1
        });

        this.materials.goal = new THREE.MeshPhysicalMaterial({
            color: 0x2c3e50,
            roughness: 0.7,
            metalness: 0.2,
            emissive: 0x0a1c2e,
            emissiveIntensity: 0.1
        });

        this.materials.player1 = new THREE.MeshPhysicalMaterial({
            color: 0x3498db,
            roughness: 0.3,
            metalness: 0.1
        });

        this.materials.player2 = new THREE.MeshPhysicalMaterial({
            color: 0xe74c3c,
            roughness: 0.3,
            metalness: 0.1
        });
    }

    /**
     * Update materials when user changes skins
     */
    async updateMaterials(newSkins: {
        boardTexture?: string;
        wallTexture?: string;
        goalTexture?: string;
    }): Promise<GameMaterials> {
        return await this.initializeMaterials(newSkins);
    }

    /**
     * Dispose of all materials and textures
     */
    dispose(): void {
        // Dispose materials
        Object.values(this.materials).forEach(material => {
            if (material) {
                material.dispose();
            }
        });

        // Dispose textures
        this.loadedTextures.forEach(textures => {
            Object.values(textures).forEach(texture => {
                if (texture) {
                    texture.dispose();
                }
            });
        });

        this.materials = {};
        this.loadedTextures.clear();
    }
}

// Utility to create materials directly (for non-React usage)
export class MaterialsFactory {
  private static textureLoader = new THREE.TextureLoader();
  
  static async createPBRMaterial(config: PBRMaterialConfig): Promise<THREE.MeshPhysicalMaterial> {
    const texturePromises: Promise<THREE.Texture>[] = [];
    const textureKeys: string[] = [];
    
    if (config.albedoPath) {
      texturePromises.push(this.textureLoader.loadAsync(config.albedoPath));
      textureKeys.push('albedo');
    }
    if (config.normalPath) {
      texturePromises.push(this.textureLoader.loadAsync(config.normalPath));
      textureKeys.push('normal');
    }
    if (config.aoPath) {
      texturePromises.push(this.textureLoader.loadAsync(config.aoPath));
      textureKeys.push('ao');
    }
    if (config.roughnessPath) {
      texturePromises.push(this.textureLoader.loadAsync(config.roughnessPath));
      textureKeys.push('roughness');
    }
    if (config.metallicPath) {
      texturePromises.push(this.textureLoader.loadAsync(config.metallicPath));
      textureKeys.push('metallic');
    }
    if (config.heightPath) {
      texturePromises.push(this.textureLoader.loadAsync(config.heightPath));
      textureKeys.push('height');
    }
    
    const textures = await Promise.all(texturePromises);
    const textureMap: Record<string, THREE.Texture> = {};
    
    textures.forEach((texture, index) => {
      const key = textureKeys[index];
      textureMap[key] = configureTexture(texture, config.repeatX || 1, config.repeatY || 1);
    });
    
    return new THREE.MeshPhysicalMaterial({
      map: textureMap.albedo,
      normalMap: textureMap.normal,
      aoMap: textureMap.ao,
      roughnessMap: textureMap.roughness,
      metalnessMap: textureMap.metallic,
      displacementMap: textureMap.height,
      displacementScale: config.displacementScale || 0,
      roughness: config.roughness || 0.5,
      metalness: config.metalness || 0.5,
      color: config.color || 0xffffff,
      clearcoat: config.clearcoat || 0,
      clearcoatRoughness: config.clearcoatRoughness || 0,
      emissive: config.emissive || 0x000000,
      emissiveIntensity: config.emissiveIntensity || 0,
      transmission: config.transmission || 0,
      thickness: config.thickness || 0,
      transparent: config.transparent || false,
      opacity: config.opacity || 1
    });
  }
  
  static createHighlightMaterial(type: keyof typeof HIGHLIGHT_MATERIALS): THREE.MeshStandardMaterial {
    const config = HIGHLIGHT_MATERIALS[type];
    
    const materialParams: THREE.MeshStandardMaterialParameters = {
      color: config.color,
      emissive: config.emissive,
      emissiveIntensity: config.emissiveIntensity,
      transparent: config.transparent || false,
      opacity: config.opacity || 1
    };
    if ('roughness' in config && typeof config.roughness === 'number') materialParams.roughness = config.roughness;
    if ('metalness' in config && typeof config.metalness === 'number') materialParams.metalness = config.metalness;
    return new THREE.MeshStandardMaterial(materialParams);
  }
  
  static createWallPlaceholderMaterial(): THREE.MeshPhysicalMaterial {
    const config = HIGHLIGHT_MATERIALS.wallPlaceholder;
    
    return new THREE.MeshPhysicalMaterial({
      color: config.color,
      emissive: config.emissive,
      emissiveIntensity: config.emissiveIntensity,
      transmission: config.transmission,
      thickness: config.thickness,
      transparent: config.transparent,
      opacity: config.opacity
    });
  }
}

// Singleton instance (Legacy support)
export const materialFactory = new MaterialFactory();

export default MaterialsFactory;