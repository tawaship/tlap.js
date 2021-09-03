import * as THREE from 'three';
import { Object3D } from './Object3D';
import OIMO from './OIMO';
import { BodyPosition } from './BodyPosition';
import { BodyRotation } from './BodyRotation';

export class PhysicsObject3D extends Object3D<THREE.Object3D> {
	protected _body: OIMO.RigidBody;
	protected _contactEnabled: boolean = false;
	protected _position: BodyPosition;
	protected _rotation: BodyRotation;
	
	constructor(three: THREE.Object3D, body: OIMO.RigidBody) {
		super(three);
		
		this._body = body;
		this._position = new BodyPosition(this);
		this._rotation = new BodyRotation(this);
		
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
	
	updateTransform() {
		this._three.position.copy(this._body.getPosition());
		this._three.quaternion.copy(this._body.getOrientation());
	}
}