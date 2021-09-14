import * as THREE from 'three';
import { Emitter } from '@tawaship/emitter';
import { Task } from '@tawaship/task';

export interface ITickerData {
	delta: number;
}

/**
 * @ignore
 */
const _box = new THREE.Box3();

export abstract class DisplayObject<T extends THREE.Object3D = THREE.Object3D> extends Emitter {
	protected _three: T;
	protected _sub: T;
	protected _size: THREE.Vector3 = new THREE.Vector3();
	protected _pivot: THREE.Vector3 = new THREE.Vector3();
	protected _children: DisplayObject[] = [];
	protected _task: Task;
	
	interactive: boolean = false;
	
	constructor(three: T) {
		super();
		
		this._three = this._sub = three;
		
		three.addEventListener('system:interaction:pointerdown', event => {
			if (!this.interactive) {
				return;
			}
			
			event.emitted.push(this);
		});
		
		three.addEventListener('system:interaction:pointerup', event => {
			if (!this.interactive) {
				return;
			}
			
			event.emitted.push(this);
		});
		
		three.addEventListener('system:interaction:pointermove', event => {
			if (!this.interactive) {
				return;
			}
			
			event.emitted.push(this);
		});
		
		three.addEventListener('system:interaction:pointerupoutside', event => {
			if (!this.interactive) {
				return;
			}
			
			event.emitted.push(this);
		});
		
		this._task = new Task([], this);
		this._task.first();
	}
	
	get three() {
		return this._three;
	}
	
	get task() {
		return this._task;
	}
	
	get parent(): DisplayObject | null {
		return this._three.userData.parent;
	}
	
	get children() {
		return this._children;
	}
	
	updateTask(e: ITickerData) {
		this._task.done(e);
	}
	
	get width() {
		this.updateBoundingBox();
		return this._size.x;
	}
	
	get height() {
		this.updateBoundingBox();
		return this._size.y;
	}
	
	get depth() {
		this.updateBoundingBox();
		return this._size.z * this.scale.z;
	}
	
	get x() {
		return this._three.position.x;
	}
	
	set x(value) {
		this._three.position.x = value;
	}
	
	get y() {
		return this._three.position.y;
	}
	
	set y(value) {
		this._three.position.y = value;
	}
	
	get z() {
		return this._three.position.z;
	}
	
	set z(value) {
		this._three.position.z = value;
	}
	
	/*
	get position() {
		return this._three.position;
	}
	*/
	
	get scale() {
		return this._three.scale;
	}
	
	get pivot() {
		return this._pivot;
	}
	
	update(e: ITickerData) {
		this.updateTransform();
		this.updateTask(e);
		
		const c = this._children;
		for (let i = 0; i < c.length; i++) {
			c[i].update(e);
		}
	}
	
	abstract updateTransform(): void;
	
	updateBoundingBox() {
		this.updateTransform();
		
		_box.setFromObject(this._sub);
		_box.getSize(this._size);
		this._size.multiply(this.scale);
	}
	
	addChild(object: DisplayObject) {
		if (object.parent) {
			object.parent.removeChild(object);
		}
		
		this._children.push(object);
		this._sub.add(object.three);
		object.three.userData.parent = this;
		
		return object;
	}
	
	removeChild(object: DisplayObject) {
		if (object.parent !== this) {
			return;
		}
		
		const index = this._children.indexOf(object);
		if (index === -1) {
			return;
		}
		
		this._children.splice(index, 1);
		this._sub.remove(object.three);
		object.three.userData.parent = null;
		
		return object;
	}
}
