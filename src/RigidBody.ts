import OIMO from './OIMO';
import { Shape, SensoredShape } from './Shape';
import { PhysicsObject3D } from './PhysicsObject3D';
import { Emitter, IEmitterDelegate } from '@tawaship/emitter';

export class RigidBody extends OIMO.RigidBody {
	private _emitter: Emitter = new Emitter();
	
	declare userData: { ref: PhysicsObject3D | null };
	
	constructor(rigidBodyConfig: OIMO.RigidBodyConfig) {
		super(rigidBodyConfig);
		
		this.userData = { ref: null };
	}
	
	getObject(): PhysicsObject3D | null {
		return this.userData.ref;
	}
	
	on(type: string, callback: IEmitterDelegate) {
		this._emitter.on(type, callback);
	}
	
	off(type: string, callback: IEmitterDelegate) {
		this._emitter.off(type, callback);
	}
	
	emit(type: string, ...args: any[]) {
		this._emitter.cemit(type, this, ...args);
	}
	
	getSensoredShapeList(): SensoredShape[] {
		const res: SensoredShape[] = [];
		
		let shape = this.getShapeList();
		while (shape) {
			if (shape instanceof SensoredShape) {
				res.push(shape);
			}
			shape = shape.getNext();
		}
		
		return res;
	}
	
	addShape(shape: Shape | SensoredShape) {
		super.addShape(shape);
		
		if (shape instanceof SensoredShape) {
			this.emit('sensoredShapeAdded', shape);
		}
	}
	
	removeShape(shape: Shape | SensoredShape) {
		super.removeShape(shape);
		
		if (shape instanceof SensoredShape) {
			this.emit('sensoredShapeRemoved', shape);
		}
	}
	
	setCollisionGroup(collisionGroup: number) {
		let shape = this.getShapeList();
		while (shape) {
			shape.setCollisionGroup(collisionGroup);
			
			shape = shape.getNext();
		}
	}
	
	addCollisionGroup(collisionGroup: number) {
		let shape = this.getShapeList();
		while (shape) {
			let t = shape.getCollisionGroup();
			t |= collisionGroup;
			shape.setCollisionGroup(t);
			
			shape = shape.getNext();
		}
	}
	
	removeCollisionGroup(collisionGroup: number) {
		let shape = this.getShapeList();
		while (shape) {
			let t = shape.getCollisionGroup();
			t ^= t & collisionGroup;
			shape.setCollisionGroup(t);
			
			shape = shape.getNext();
		}
	}
	
	setCollisionMask(collisionMask: number) {
		let shape = this.getShapeList();
		while (shape) {
			shape.setCollisionMask(collisionMask);
			
			shape = shape.getNext();
		}
	}
	
	addCollisionMask(collisionMask: number) {
		let shape = this.getShapeList();
		while (shape) {
			let t = shape.getCollisionMask();
			t |= collisionMask;
			shape.setCollisionMask(t);
			
			shape = shape.getNext();
		}
	}
	
	removeCollisionMask(collisionMask: number) {
		let shape = this.getShapeList();
		while (shape) {
			let t = shape.getCollisionMask();
			t ^= t & collisionMask;
			shape.setCollisionMask(t);
			
			shape = shape.getNext();
		}
	}
	
	static createStatic() {
		const rigidBodyConfig = new OIMO.RigidBodyConfig();
		rigidBodyConfig.type = OIMO.RigidBodyType.STATIC;
		
		return new RigidBody(rigidBodyConfig);
	}
	
	static createDynamic() {
		const rigidBodyConfig = new OIMO.RigidBodyConfig();
		rigidBodyConfig.type = OIMO.RigidBodyType.DYNAMIC;
		
		return new RigidBody(rigidBodyConfig);
	}
	
	static createKinematic() {
		const rigidBodyConfig = new OIMO.RigidBodyConfig();
		rigidBodyConfig.type = OIMO.RigidBodyType.KINEMATIC;
		
		return new RigidBody(rigidBodyConfig);
	}
}