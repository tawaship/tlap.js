declare namespace OIMO {
	class CommonConstructor {
		constructor(...args: any[]);
		[key: string]: any;
	}
	
	export class World extends CommonConstructor {}
	
	export class RigidBody extends CommonConstructor {}
	
	export class Shape extends CommonConstructor {}
	
	export class ContactCallback extends CommonConstructor {}
	
	export class AabbTestCallback extends CommonConstructor {}
	
	export class Vec3 extends CommonConstructor {}
}

export default OIMO;