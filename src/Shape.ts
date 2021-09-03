import OIMO from './OIMO';
import { PhysicsObject3D } from './PhysicsObject3D';
import { RigidBody } from './RigidBody';
import { Emitter, IEmitterDelegate } from '@tawaship/emitter';

export interface IContactData {
	hit: Shape;
	originalEvent: any;
}

/**
 * @ignore
 */
const contactCallback = new OIMO.ContactCallback();

/**
 * @ignore
 */
function contactHandler(type: string, e: any) {
	const selfShape: Shape = e.getShape1();
	const opponentShape: Shape = e.getShape2();
	
	event.originalEvent = e;
	event.hit = opponentShape;
	selfShape.emit(type, event);
}

contactCallback.beginContact = (e: any) => {
	contactHandler('beginContact', e);
};
contactCallback.endContact = (e: any) => {
	contactHandler('endContact', e);
};
contactCallback.preSolve = (e: any) => {
	contactHandler('preSolve', e);
};
contactCallback.postSolve = (e: any) => {
	contactHandler('postSolve', e);
};

export class Shape extends OIMO.Shape {
	protected _collisionGroup: number;
	protected _collisionMask: number;
	protected _collisionEnabled: boolean = true;
	protected _contactEnabled: boolean = false;
	private _emitter: Emitter = new Emitter();
	
	constructor(shapeConfig: OIMO.ShapeConfig) {
		super(shapeConfig);
		
		this._collisionGroup = this.getCollisionGroup();
		this._collisionMask = this.getCollisionMask();
		
		this._updateCollisionGroup();
		this._updateCollisionMask();
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
	
	get collisionGroup() {
		return this._collisionGroup;
	}
	
	get collisionMask() {
		return this._collisionMask;
	}
	
	get collisionEnabled() {
		return this._collisionEnabled;
	}
	
	set collisionEnabled(value: boolean) {
		this._collisionEnabled = value;
		
		this._updateCollisionGroup();
		this._updateCollisionMask();
	}
	
	get contectEnabled() {
		return this._contactEnabled;
	}
	
	set contactEnabled(value: boolean) {
		this._contactEnabled = value;
		
		if (value) {
			this.setContactCallback(contactCallback);
		} else {
			this.setContactCallback(null);
		}
	}
	
	setCollisionGroup(collisionGroup: number) {
		this._collisionGroup = collisionGroup;
		
		this._updateCollisionGroup();
	}
	
	setCollisionMask(collisionMask: number) {
		this._collisionMask = collisionMask;
		
		this._updateCollisionMask();
	}
	
	protected _setCollisionGroup(collisionGroup: number) {
		super.setCollisionGroup(collisionGroup);
	}
	
	protected _setCollisionMask(collisionMask: number) {
		super.setCollisionMask(collisionMask);
	}
	
	protected _updateCollisionGroup() {
		if (!this._collisionEnabled) {
			this._setCollisionGroup(0);
		} else {
			this._setCollisionMask(this._collisionGroup);
		}
	}
	
	protected _updateCollisionMask() {
		if (!this._collisionEnabled) {
			this._setCollisionMask(0);
		} else {
			this._setCollisionMask(this._collisionMask);
		}
	}
	
	getObject() {
		const body = this.getRigidBody();
		if (!body) {
			return;
		}
		
		return body.getObject();
	}
}

/**
 * @ignore
 */
const event: IContactData = { hit: new Shape(new OIMO.ShapeConfig()), originalEvent: null };

/**
 * @ignore
 */
function sensorHandler(type: string, selfShape: SensoredShape, opponentShape: Shape) {
	event.originalEvent = null;
	event.hit = opponentShape;
	selfShape.emit(type, event);
}

/**
 * @ignore
 */
function getObject(shape: SensoredShape) {
	const body = shape.getRigidBody();
	if (!body) {
		return;
	}
	
	return body.getObject();
}

export class SensoredShape extends Shape {
	private _sensorEnabled: boolean = true;
	protected _aabbTestCallback: OIMO.AabbTestCallback = new OIMO.AabbTestCallback();
	protected _touchedShapes: Shape[] = [];
	protected _touchShapes: Shape[] = [];
	
	constructor(shapeConfig: OIMO.ShapeConfig) {
		super(shapeConfig);
		
		this.contactEnabled = true;
		
		this._updateCollisionGroup();
		this._updateCollisionMask();
		
		this._aabbTestCallback.process = (shape: Shape) => {
			if ((this._collisionMask & shape.collisionGroup) === 0) {
				return;
			}
			
			if ((this._collisionGroup & shape.collisionMask) === 0) {
				return;
			}
			
			const index = this._touchedShapes.indexOf(shape);
			if (index === -1) {
				sensorHandler('beginContact', this, shape);
			} else {
				this._touchedShapes.splice(index, 1);
			}
			
			this._touchShapes.push(shape);
		};
	}
	
	get sensorEnabled() {
		return this._sensorEnabled;
	}
	
	set sensorEnabled(value: boolean) {
		this._sensorEnabled = value;
		
		this._updateCollisionGroup();
		this._updateCollisionMask();
	}
	
	get isSensor() {
		return this._collisionEnabled && this._contactEnabled && this._sensorEnabled;
	}
	
	aabbTest(world: OIMO.World) {
		if (!this.isSensor) {
			return;
		}
		
		this._touchedShapes = this._touchShapes;
		this._touchShapes = [];
		
		world.aabbTest(this.getAabb(), this._aabbTestCallback);
		
		for (let i = 0; i < this._touchedShapes.length; i++) {
			sensorHandler('endContact', this, this._touchedShapes[i]);
		}
	}
	
	protected _updateCollisionGroup() {
		if (!this._collisionEnabled) {
			this._setCollisionGroup(0);
		} else if (this._sensorEnabled) {
			this._setCollisionGroup(0);
		} else {
			this._setCollisionGroup(this._collisionGroup);
		}
	}
	
	protected _updateCollisionMask() {
		if (!this._collisionEnabled) {
			this._setCollisionMask(0);
		} else if (this._sensorEnabled) {
			this._setCollisionMask(0);
		} else {
			this._setCollisionMask(this._collisionMask);
		}
	}
}