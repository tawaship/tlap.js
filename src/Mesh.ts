import * as THREE from 'three';
import { Object3D } from './Object3D';
import { Anchor } from './Anchor';
import { IMesh } from './IMesh'

export class Mesh extends Object3D<THREE.Mesh> implements IMesh {
	private _anchor: Anchor;
	
	constructor(geometry: THREE.BufferGeometry, material: THREE.Material) {
		super(new THREE.Mesh(geometry, material));
		
		this._anchor = new Anchor(0, 0, 0, this);
		material.transparent = true;
		this.updateGeometryPosition();
	}
	
	get anchor() {
		return this._anchor;
	}
	
	updateGeometryPosition() {
		this._three.geometry.center();
		this.updateBoundingBox();
		this._three.geometry.translate(this._size.x * (0.5 - this._anchor.x), this._size.y * (0.5 - this._anchor.y), this._size.z * (0.5 - this._anchor.z))
	}
	
	updateBoundingBox() {
		this._three.geometry.computeBoundingBox();
		this._three.geometry.boundingBox && this._three.geometry.boundingBox.getSize(this._size);
		this._size.multiply(this.scale);
	}
}