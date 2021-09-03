import * as THREE from 'three';
import { Object2D } from './Object2D';

export class Container2D extends Object2D<THREE.Group> {
	constructor() {
		super(new THREE.Group());
		
		this._sub = new THREE.Group();
		this._three.add(this._sub);
	}
	
	_updateOrder() {
		const c = this._children;
		for (let i = 0; i < c.length; i++) {
			c[i].three.position.z = i * 0.0000001;
		}
	}
	
	updateTransform() {
		this._updateMatrix();
	}
}