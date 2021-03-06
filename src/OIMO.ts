declare namespace OIMO {
	class CommonConstructor {
		constructor(...args: any[]);
		[key: string]: any;
	}
	
	export class World extends CommonConstructor {}
	
	export class RigidBody extends CommonConstructor {}
	
	export class RigidBodyConfig extends CommonConstructor {}
	
	export class Shape extends CommonConstructor {}
	
	export class ShapeConfig extends CommonConstructor {}
	
	export class ContactCallback extends CommonConstructor {}
	
	export class AabbTestCallback extends CommonConstructor {}
	
	export class Vec3 extends CommonConstructor {}
	
	export namespace RigidBodyType {
		export const STATIC: number;
		export const DYNAMIC: number;
		export const KINEMATIC: number;
	}
}

export default OIMO;