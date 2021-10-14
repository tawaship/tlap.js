import * as THREE from 'three';
import { View } from './View';
import { ITickerData } from './DisplayObject';
import { PhysicsObject3D } from './PhysicsObject3D';
import { Shape, SensoredShape } from './Shape';
import OIMO from './OIMO';

export class PhysicsView extends View {
	private _world: any;
	private _sensoredShapes: SensoredShape[] = [];
	private _onShapeAdded: (shape: SensoredShape) => void;
	private _onShapeRemoved: (shape: SensoredShape) => void;
	declare protected _children: PhysicsObject3D[];
	physicsEnabled: boolean = true;
	
	constructor() {
		super();
		
		this._world = new OIMO.World();
		this._world.setGravity(new OIMO.Vec3(0, -9.8, 0));
		
		this._onShapeAdded = (shape: SensoredShape) => {
			const index = this._sensoredShapes.indexOf(shape);
			if (index === -1) {
				this._sensoredShapes.push(shape);
			}
		}
		
		this._onShapeRemoved = (shape: SensoredShape) => {
			const index = this._sensoredShapes.indexOf(shape);
			if (index > -1) {
				this._sensoredShapes.splice(index, 1);
			}
		}
	}
	
	get world() {
		return this._world;
	}
	
	get children() {
		return this._children;
	}
	
	addChild(object: PhysicsObject3D) {
		super.addChild(object);
		
		this._world.addRigidBody(object.body);
		
		const sensoredShapes = object.body.getSensoredShapeList();
		for (let i = 0; i < sensoredShapes.length; i++) {
			this._onShapeAdded(sensoredShapes[i]);
		}
		
		object.body.on('sensoredShapeAdded', this._onShapeAdded);
		object.body.on('sensoredShapeRemoved', this._onShapeRemoved);
		
		return object;
	}
	
	removeChild(object: PhysicsObject3D) {
		const o = super.removeChild(object);
		
		if (!o) {
			return;
		}
		
		this._world.removeRigidBody(object.body);
		
		const sensoredShapes = object.body.getSensoredShapeList();
		for (let i = 0; i < sensoredShapes.length; i++) {
			this._onShapeRemoved(sensoredShapes[i]);
		}
		
		object.body.off('sensoredShapeAdded', this._onShapeAdded);
		object.body.off('sensoredShapeRemoved', this._onShapeRemoved);
		
		return o;
	}
	
	update(e: ITickerData, taskDisabledChildren: boolean) {
		if (this.physicsEnabled) {
			this._world.step(1 / 60);
			
			/*
			let body = this._world.getRigidBodyList();
			while (body) {
				const object = body.userData.ref;
				if (object.sensorEnabled) {
					object.aabbTest(this._world);
				}
				
				body = body.getNext();
			}
			*/
			
			for (let i = 0; i < this._sensoredShapes.length; i++) {
				this._sensoredShapes[i].aabbTest(this._world);
			}
		}
		
		super.update(e, taskDisabledChildren);
	}
}
