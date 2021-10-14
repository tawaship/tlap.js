import * as THREE from 'three';
import { Object3D } from './Object3D';
import { Camera } from './Camera';
import { IInteractionEvent } from './InteractionManager';
import { ITickerData } from './DisplayObject';
import { IDeliverData } from './IDeliverData';

export class View extends Object3D<THREE.Scene> {
	private _cameras: Camera[] = [];
	
	constructor($?: IDeliverData) {
		super(new THREE.Scene());
		
		this.interactive = true;
	}
	
	get scene() {
		return this._three;
	}
	
	addCamera(camera: Camera) {
		if (camera.parent) {
			camera.parent.removeChild(camera);
		}
		
		this._cameras.push(camera);
		this._three.add(camera.three);
		camera.three.userData.parent = this;
		
		return camera;
	}
	
	removeCamera(camera: Camera) {
		if (camera.parent !== this) {
			return;
		}
		
		const index = this._cameras.indexOf(camera);
		if (index === -1) {
			return;
		}
		
		this._cameras.splice(index, 1);
		this._three.remove(camera.three);
		camera.three.userData.parent = null;
		
		return camera;
	}
	
	add(three: THREE.Object3D) {
		this._three.add(three);
		
		return three;
	}
	
	remove(three: THREE.Object3D) {
		this._three.remove(three);
		
		return three;
	}
	/*
	update(e: ITickerData) {
		this.updateTask(e);
		
		const c = this._children;
		for (let i in this._children) {
			c[i].update(e);
		}
	}
	*/
	render(renderer: THREE.WebGLRenderer) {
		const c = this._cameras;
		
		for (let i = 0; i < c.length; i++) {
			renderer.clearDepth();
			c[i].render(renderer, this._three);
		}
	}
	
	onInteraction(event: IInteractionEvent, raycaster: THREE.Raycaster, mouse: THREE.Vector2) {
		if (!this.interactive) {
			return;
		}
		
		const c = this._cameras;
		
		for (let i = 0; i < c.length; i++) {
			if (event.emitted.length > 0) {
				return;
			}
			
			raycaster.setFromCamera(mouse, c[i].camera);
			
			const f: (p: THREE.Object3D) => THREE.Object3D[] = (p: THREE.Object3D) => {
				return p.children.map(p => {
					if (p instanceof THREE.Mesh) {
						return p;
					}
					
					return f(p);
				}).flat();
			}
			
			const meshes = f(this._three);
			
			const intersects = raycaster.intersectObjects(meshes);
			
			for (let i = 0; i < intersects.length; i++) {
				if (event.emitted.length > 0) {
					return;
				}
				
				let p = intersects[i].object;
				while (p !== this._three) {
					p.dispatchEvent(event);
					
					if (!p.parent) {
						break;
					}
					
					p = p.parent;
				}
			}
		}
	}
	
	updateTransform() {
	
	}
}
