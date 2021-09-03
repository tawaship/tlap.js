import { PhysicsObject3D } from './PhysicsObject3D';

export class BodyRotation {
	private _object: PhysicsObject3D;
	
	constructor(object: PhysicsObject3D) {
		this._object = object;
	}
	
	get x() {
		return this._object.body.getRotation().toEulerXyz().x;
	}
	
	set x(value) {
		const rotation = this._object.body.getRotation().toEulerXyz();
		rotation.x = value;
		this._object.body.setRotationXyz(rotation);
		this._object.updateTransform();
	}
	
	get y() {
		return this._object.body.getRotation().toEulerXyz().y;
	}
	
	set y(value) {
		const rotation = this._object.body.getRotation().toEulerXyz();
		rotation.y = value;
		this._object.body.setRotationXyz(rotation);
		this._object.updateTransform();
	}
	
	get z() {
		return this._object.body.getRotation().toEulerXyz().z;
	}
	
	set z(value) {
		const rotation = this._object.body.getRotation().toEulerXyz();
		rotation.z = value;
		this._object.body.setRotationXyz(rotation);
		this._object.updateTransform();
	}
	
	set(x: number, y?: number, z?: number) {
		if (y === undefined) {
			y = x;
		}
		
		if (z === undefined) {
			z = y;
		}
		
		const rotation = this._object.body.getRotation().toEulerXyz();
		rotation.x = x;
		rotation.y = y;
		rotation.z = z;
		
		this._object.body.setRotationXyz(rotation);
		this._object.updateTransform();
	}
}