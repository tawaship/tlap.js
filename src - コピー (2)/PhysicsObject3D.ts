import * as THREE from 'three';
import { Object3D } from './Object3D';
import OIMO from './OIMO';
import { BodyPosition } from './BodyPosition';
import { BodyRotation } from './BodyRotation';

/**
 * @ignore
 */
const event = { hit: null, originalEvent: null };

export class PhysicsObject3D extends Object3D<THREE.Object3D> {
	protected _body: OIMO.RigidBody;
	protected _contactEnabled: boolean = false;
	protected _position: BodyPosition;
	protected _rotation: BodyRotation;
	
	protected _collisionGroup: number = 1;
	protected _collisionMask: number = 1;
	protected _contactCallback: OIMO.ContactCallback;
	protected _isSensor: boolean = false;
	protected _aabbTestCallback: OIMO.AabbTestCallback;
	protected _touchedShapes: OIMO.Shape[] = [];
	protected _touchShapes: OIMO.Shape[] = [];
	protected _sensorEnabled: boolean = false;
	
	constructor(three: THREE.Object3D, body: OIMO.RigidBody) {
		super(three);
		
		this._body = body;
		this._position = new BodyPosition(this);
		this._rotation = new BodyRotation(this);
		
		body.userData = {};
		body.userData.ref = this;
		
		const contactCallback = new OIMO.ContactCallback();
		
		contactCallback.beginContact = (e: any) => {
			event.hit = e.getShape2().getRigidBody().userData.ref;
			event.originalEvent = e;
			this.emit('beginContact', event);
		};
		contactCallback.endContact = (e: any) => {
			event.hit = e.getShape2().getRigidBody().userData.ref;
			event.originalEvent = e;
			this.emit('endContact', event);
		};
		contactCallback.preSolve = (e: any) => {
			event.hit = e.getShape2().getRigidBody().userData.ref;
			event.originalEvent = e;
			this.emit('preSolve', event);
		};
		contactCallback.postSolve = (e: any) => {
			event.hit = e.getShape2().getRigidBody().userData.ref;
			event.originalEvent = e;
			this.emit('postSolve', event);
		};
		
		this._contactCallback = contactCallback;
		
		const aabbTestCallback = new OIMO.AabbTestCallback();
		
		aabbTestCallback.process = (shape: OIMO.Shape) => {
			const object = shape.getRigidBody().userData.ref;
			
			if ((this._collisionMask & object.collisionGroup) === 0) {
				return;
			}
			
			event.hit = object;
			event.originalEvent = null;
			
			const idx = this._touchedShapes.indexOf(shape);
			if (idx === -1) {
				this.emit('beginContact', event);
			} else {
				this._touchedShapes.splice(idx, 1);
			}
			
			this._touchShapes.push(shape);
		};
		
		this._aabbTestCallback = aabbTestCallback;
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
	
	get sensorEnabled() {
		return this._sensorEnabled;
	}
	
	get isSensor() {
		return this._isSensor;
	}
	
	set isSensor(value) {
		this._isSensor = value;
		this._sensorEnabled = value && this._contactEnabled;
		
		this.contactEnabled = this._contactEnabled;
		this.collisionGroup = this._collisionGroup;
		this.collisionMask = this._collisionMask;
	}
	
	get contactEnabled() {
		return this._contactEnabled;
	}
	
	set contactEnabled(value) {
		this._contactEnabled = value;
		this._sensorEnabled = value && this._isSensor;
		
		const callback = (!value || this._isSensor) ? null : this._contactCallback;
		
		let shape = this._body.getShapeList();
		while (shape) {
			shape.setContactCallback(callback);
			shape = shape.getNext();
		}
	}
	
	get collisionGroup() {
		return this._collisionGroup;
	}
	
	set collisionGroup(value) {
		const v = this._isSensor ? 0 : value;
		this._collisionGroup = value;
		
		let shape = this._body.getShapeList();
		while (shape) {
			shape.setCollisionGroup(v);
			shape = shape.getNext();
		}
	}
	
	get collisionMask() {
		return this._collisionMask;
	}
	
	set collisionMask(value) {
		const v = this._isSensor ? 0 : value;
		this._collisionMask = value;
		
		let shape = this._body.getShapeList();
		while (shape) {
			shape.setCollisionMask(v);
			shape = shape.getNext();
		}
	}
	
	aabbTest(world: OIMO.World) {
		this._touchedShapes = this._touchShapes;
		this._touchShapes = [];
		
		let shape = this._body.getShapeList();
		while (shape) {
			world.aabbTest(shape.getAabb(), this._aabbTestCallback);
			shape = shape.getNext();
		}
		
		for (let i = 0; i < this._touchedShapes.length; i++) {
			const shape = this._touchedShapes[i];
			event.hit = shape.getRigidBody().userData.ref;
			event.originalEvent = null;
			this.emit('endContact', event);
		}
	}
	
	updateTransform() {
		this._three.position.copy(this._body.getPosition());
		this._three.quaternion.copy(this._body.getOrientation());
	}
	
	updateBoundingBox() {
	
	}
}