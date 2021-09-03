import * as THREE from 'three';
import { IMesh } from './IMesh';

export class Anchor {
	private _x: number;
	private _y: number;
	private _z: number;
	private _mesh: IMesh;
	
	constructor(x: number, y: number, z: number, mesh: IMesh) {
		this._x = x;
		this._y = y;
		this._z = z;
		this._mesh = mesh;
	}
	
	get x() {
		return this._x;
	}
	
	set x(value) {
		this._x = value;
		this._mesh.updateGeometryPosition();
	}
	
	get y() {
		return this._y;
	}
	
	set y(value) {
		this._y = value;
		this._mesh.updateGeometryPosition();
	}
	
	get z() {
		return this._z;
	}
	
	set z(value) {
		this._z = value;
		this._mesh.updateGeometryPosition();
	}
	
	set(x: number, y?: number, z?: number) {
		if (y === undefined) {
			y = x;
		}
		
		if (z === undefined) {
			z = y;
		}
		
		this._x = x;
		this._y = y;
		this._z = z;
		
		this._mesh.updateGeometryPosition();
	}
}