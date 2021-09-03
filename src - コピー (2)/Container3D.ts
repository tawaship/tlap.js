import * as THREE from 'three';
import { Object3D } from './Object3D';

export class Container3D extends Object3D<THREE.Group> {
	constructor() {
		super(new THREE.Group());
		
		this._sub = new THREE.Group();
		this._three.add(this._sub);
	}
	
	updateTransform() {
		this._sub.position.x = -this._pivot.x;
		this._sub.position.y = -this._pivot.y;
		this._sub.position.z = -this._pivot.z;
	}
}