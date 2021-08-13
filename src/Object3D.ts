import * as THREE from 'three';
import { DisplayObject } from './DisplayObject';

export abstract class Object3D<T extends THREE.Object3D = THREE.Object3D> extends DisplayObject<T> {
	get rotation() {
		return this._three.rotation;
	}
}