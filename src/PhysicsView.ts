import * as THREE from 'three';
import { View } from './View';
import { ITickerData } from './DisplayObject';
import { PhysicsObject3D } from './PhysicsObject3D';
import OIMO from './OIMO';

export class PhysicsView extends View {
	private _world: any;
	physicsEnabled: boolean = true;
	
	constructor() {
		super();
		
		this._world = new OIMO.World();
		this._world.setGravity(new OIMO.Vec3(0, -9.8, 0));
	}
	
	get world() {
		return this._world;
	}
	
	addChild(object: PhysicsObject3D) {
		super.addChild(object);
		
		this._world.addRigidBody(object.body);
		
		return object;
	}
	
	removeChild(object: PhysicsObject3D) {
		const o = super.removeChild(object);
		
		if (!o) {
			return;
		}
		
		this._world.removeRigidBody(object.body);
		
		return o;
	}
	
	update(e: ITickerData) {
		if (this.physicsEnabled) {
			this._world.step(1 / 60);
		}
		
		this.updateTask(e);
		
		const c = this._children;
		for (let i in this._children) {
			c[i].update(e);
		}
	}
}
