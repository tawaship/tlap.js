import * as THREE from 'three';
import { Object3D } from './Object3D';
import OIMO from './OIMO';
import { BodyPosition } from './BodyPosition';
import { BodyRotation } from './BodyRotation';

export class PhysicsObject3D extends Object3D<THREE.Object3D> {
	private _body: any;
	private _contantEnabled: boolean = false;
	private _position: BodyPosition;
	private _rotation: BodyRotation;
	
	constructor(three: THREE.Object3D, body: any) {
		super(three);
		
		this._body = body;
		this._position = new BodyPosition(this);
		this._rotation = new BodyRotation(this);
		
		body.userData = {};
		body.userData.ref = this;
	}
	
	get body() {
		return this._body;
	}
	
	get x() {
		return this._position.x;
	}
	
	set x(value) {
		this._position.x = value;
	}
	
	get y() {
		return this._position.y;
	}
	
	set y(value) {
		this._position.y = value;
	}
	
	get z() {
		return this._position.z;
	}
	
	set z(value) {
		this._position.z = value;
	}
	
	get position() {
		return this._position;
	}
	
	// @ts-ignore
	get rotation() {
		return this._rotation;
	}
	
	get contactEnabled() {
		return this._contantEnabled;
	}
	
	set contactEnabled(value) {
		this._contantEnabled = value;
		
		if (!value) {
			let shape = this._body.getShapeList();
			while (shape) {
				shape.setContactCallback(null);
				shape = shape.getNext();
			}
			
			return;
		}
		
		const callback = new OIMO.ContactCallback();
		const event = { hit: null, originalEvent: null };
		
		callback.beginContact = (e: any) => {
			event.hit = e.getShape2().getRigidBody().userData.ref;
			event.originalEvent = e;
			this.emit('beginContact', event);
		};
		callback.endContact = (e: any) => {
			event.hit = e.getShape2().getRigidBody().userData.ref;
			event.originalEvent = e;
			this.emit('endContact', event);
		};
		callback.preSolve = (e: any) => {
			event.hit = e.getShape2().getRigidBody().userData.ref;
			event.originalEvent = e;
			this.emit('preSolve', event);
		};
		callback.postSolve = (e: any) => {
			event.hit = e.getShape2().getRigidBody().userData.ref;
			event.originalEvent = e;
			this.emit('postSolve', event);
		};
		
		let shape = this._body.getShapeList();
		while (shape) {
			shape.setContactCallback(callback);
			shape = shape.getNext();
		}
	}
	
	updateTransform() {
		this._three.position.copy(this._body.getPosition());
		this._three.quaternion.copy(this._body.getOrientation());
	}
	
	updateBoundingBox() {
	
	}
}