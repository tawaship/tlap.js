import { PhysicsObject3D } from './PhysicsObject3D';

export class BodyPosition {
	private _object: PhysicsObject3D;
	
	constructor(object: PhysicsObject3D) {
		this._object = object;
	}
	
	get x() {
		return this._object.body.getPosition().x;
	}
	
	set x(value) {
		const position = this._object.body.getPosition();
		position.x = value;
		this._object.body.setPosition(position);
		this._object.updateTransform();
	}
	
	get y() {
		return this._object.body.getPosition().y;
	}
	
	set y(value) {
		const position = this._object.body.getPosition();
		position.y = value;
		this._object.body.setPosition(position);
		this._object.updateTransform();
	}
	
	get z() {
		return this._object.body.getPosition().z;
	}
	
	set z(value) {
		const position = this._object.body.getPosition();
		position.z = value;
		this._object.body.setPosition(position);
		this._object.updateTransform();
	}
	
	set(x: number, y?: number, z?: number) {
		if (y === undefined) {
			y = x;
		}
		
		if (z === undefined) {
			z = y;
		}
		
		const position = this._object.body.getPosition();
		position.x = x;
		position.y = y;
		position.z = z;
		
		this._object.body.setPosition(position);
		this._object.updateTransform();
	}
}