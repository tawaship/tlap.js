import * as THREE from 'three';
import { DisplayObject } from './DisplayObject';

export abstract class Object2D<T extends THREE.Object3D = THREE.Object3D> extends DisplayObject<T> {
	protected _skew: THREE.Vector2 = new THREE.Vector2();
	
	constructor(three: T) {
		super(three);
		
		three.matrixAutoUpdate = false;
	}
	
	get skew() {
		return this._skew;
	}
	
	get rotation() {
		return this._three.rotation.z;
	}
	
	set rotation(value) {
		this._three.rotation.z = value;
	}
	
	updateTransform() {
		this._updateMatrix();
	}
	
	_updateMatrix() {
		const x = this.x;
		const y = this.y;
		const z = this._three.position.z;
		const scaleX = this.scale.x;
		const scaleY = this.scale.y;
		const skewX = this.skew.x;
		const skewY = this.skew.y;
		const rotation = this.rotation;
		const pivotX = this.pivot.x;
		const pivotY = this.pivot.y;
		
		const a = Math.cos(rotation + skewY) * scaleX;
		const b = Math.sin(rotation + skewY) * scaleX;
		const c = -Math.sin(rotation - skewX) * scaleY;
		const d = Math.cos(rotation - skewX) * scaleY;
		const tx = x - ((pivotX * a) + (pivotY * c));
		const ty = y - ((pivotX * b) + (pivotY * d));
		
		this._three.matrix.set(
			a, c, 0, tx, 
			b, d, 0, ty,
			0, 0, 1, z,
			0, 0, 0, 1
		);
	}
}