import * as THREE from 'three';
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader';

export interface IAssetDictionary<T> {
	[key: string]: T;
}

export interface ITextureDictionary extends IAssetDictionary<THREE.Texture> {

}

export interface IGLTFDictionary extends IAssetDictionary<GLTF> {

}

export interface IResourceDictionary {
	[key: string]: IAssetDictionary<any>;
}

export interface IVariableDictionary {
	[key: string]: any;
}

export interface IDeliverData {
	width: number;
	height: number;
	resources: IResourceDictionary;
	vars: IVariableDictionary;
}