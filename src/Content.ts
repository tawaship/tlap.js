import * as THREE from 'three';
import { GLTFLoader, GLTF } from 'three/examples/jsm/loaders/GLTFLoader';
import { View } from './View';

export function resolvePath(path: string, basepath: string) {
	if (path.indexOf('http://') === 0 || path.indexOf('https://') === 0 || path.indexOf('//') === 0 || path.indexOf('/') === 0) {
		return path;
	} else {
		return basepath.replace(/^(.+)\/$/, '$1') + '/' + path;
	}
}

export function resolveVersion(url: string, version: string) {
	if (!version) {
		return url;
	}
	
	return `${url}${url.match(/\?/) ? '&' : '?'}_fv=${version}`;
}

export interface IAssetDefinitionDictionary<T> {
	[key: string]: T;
}

export interface IAssetDictionary<T> {
	[key: string]: T;
}

export interface ITextureDefinitionDictionary extends IAssetDefinitionDictionary<string> {

}

export interface ITextureDictionary extends IAssetDictionary<THREE.Texture> {

}

export function loadTexturesAsync(data: ITextureDefinitionDictionary, basepath: string, version: string): Promise<ITextureDictionary> {
	const loader = new THREE.TextureLoader();
	const promises: Promise<void>[] = [];
	const textures: ITextureDictionary = {};
	
	for (let i in data) {
		promises.push(
			new Promise<void>((resolve, reject) => {
				const url = resolveVersion(resolvePath(data[i], basepath), version);
				loader.load(url, texture => {
					textures[i] = texture;
					resolve();
				}, undefined, e => {
					reject(e);
				});
			})
		);
	}
	
	return Promise.all(promises).then(() => textures);
}

export interface IGLTFDefinitionDictionary extends IAssetDefinitionDictionary<string> {

}

export interface IGLTFDictionary extends IAssetDictionary<GLTF> {

}

export function loadGLTFsAsync(data: IGLTFDefinitionDictionary, basepath: string, version: string): Promise<IGLTFDictionary> {
	const loader = new GLTFLoader();
	const promises: Promise<void>[] = [];
	const models: IGLTFDictionary = {};
	
	for (let i in data) {
		promises.push(
			new Promise<void>((resolve, reject) => {
				const url = resolveVersion(resolvePath(data[i], basepath), version);
				loader.load(url, model => {
					models[i] = model;
					resolve();
				}, undefined, e => {
					reject(e);
				});
			})
		);
	}
	
	return Promise.all(promises).then(() => models);
}

export interface IAssetLoaderDelegate<T> {
	(data: { [key: string]: any }, basepath: string, version: string): Promise<IAssetDictionary<T>>;
}

export interface IResourceDictionary {
	[key: string]: IAssetDictionary<any>;
}

export interface IVariableDictionary {
	[key: string]: any;
}

/**
 * @ignore
 */
const _assetLoaders: { [key: string]: IAssetLoaderDelegate<any> } = {};

export class Content {
	private _assetDefines: { [ley: string]: IAssetDictionary<any> } = {};
	private _viewClasses: typeof View[] = [];
	private _vars: IVariableDictionary = {};
	
	get viewClasses() {
		return this._viewClasses;
	}
	
	get vars() {
		return Object.assign({}, this._vars);
	}
	
	defineAssets<T>(key: string, data: IAssetDefinitionDictionary<T>) {
		this._assetDefines[key] = this._assetDefines[key] || {};
		
		for (let i in data) {
			this._assetDefines[key][i] = data[i];
		}
	}
	
	defineTextures(data: ITextureDefinitionDictionary) {
		this.defineAssets<string>('textures', data);
	}
	
	defineGLBs(data: IGLTFDefinitionDictionary) {
		this.defineAssets<string>('glbs', data);
	}
	
	loadAssetsAsync(basepath: string, version: string) {
		const promises: Promise<IAssetDictionary<any>>[] = [];
		const resources: IResourceDictionary = {};
		
		for (let i in this._assetDefines) {
			if (!(i in _assetLoaders)) {
				continue;
			}
			
			promises.push(
				_assetLoaders[i](this._assetDefines[i], basepath, version)
					.then((assets: IAssetDictionary<any>) => {
						return resources[i] = assets;
					})
			);
		}
		
		return Promise.all(promises).then(() => resources);
	}
	
	setView(viewClass: typeof View) {
		this._viewClasses.push(viewClass);
	}
	
	addVars(data: IVariableDictionary) {
		for (let i in data) {
			this._vars[i] = data[i];
		}
	}
	
	static registerLoader<T>(key: string, delegate: IAssetLoaderDelegate<T>) {
		_assetLoaders[key] = delegate;
	}
}

Content.registerLoader<THREE.Texture>('textures', loadTexturesAsync);
Content.registerLoader<GLTF>('glbs', loadGLTFsAsync);