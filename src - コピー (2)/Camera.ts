import * as THREE from 'three';
import { Object3D } from './Object3D';
import { IRect } from './Application';

export class Camera extends Object3D<THREE.Camera> {
	private _viewport: IRect;
	
	constructor(camera: THREE.Camera, viewport: IRect) {
		super(camera);
		
		this._viewport = viewport;
	}
	
	get camera() {
		return this._three;
	}
	
	get viewport() {
		return this._viewport;
	}
	
	render(renderer: THREE.WebGLRenderer, scene: THREE.Scene) {
		renderer.setViewport(this._viewport.x, this._viewport.y, this._viewport.width, this._viewport.height);
		renderer.render(scene, this._three);
	}
	
	updateTransform() {
	
	}
	
	updateBoundingBox() {
	
	}
}