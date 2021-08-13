import * as THREE from 'three';
import { Object2D } from './Object2D';
import { Anchor } from './Anchor';
import { IMesh } from './IMesh'

export class Sprite extends Object2D<THREE.Mesh> implements IMesh {
	private _texture: THREE.Texture;
	private _anchor: Anchor;
	private _material: THREE.MeshBasicMaterial;
	private _width: number = 0;
	private _height: number = 0;
	
	constructor(texture: THREE.Texture) {
		super(new THREE.Mesh());
		
		this._anchor = new Anchor(0, 0, 0, this);
		
		this._material = new THREE.MeshBasicMaterial();
		this._material.transparent = true;
		
		this._three.material = this._material;
		
		this._texture = texture;
		this.texture = texture;
	}
	
	get texture() {
		return this._texture;
	}
	
	set texture(texture) {
		this._texture = texture;
		this._material.needsUpdate = true;
		this._material.map = texture;
		
		if (texture && texture.image) {
			this._updateGeometry(texture.image.width, texture.image.height);
		} else {
			this._updateGeometry(0, 0);
		}
	}
	
	get anchor() {
		return this._anchor;
	}
	
	_updateGeometry(width: number, height: number) {
		this._three.geometry = new THREE.PlaneGeometry(width, height);
		this._width = width;
		this._height = height;
		this.updateGeometryPosition();
	}
	
	updateGeometryPosition() {
		this._three.geometry.center();
		this._three.geometry.translate(this._width * (0.5 - this._anchor.x), this._height * (0.5 - this._anchor.y), 0)
	}
	
	updateBoundingBox() {
		this._three.geometry.computeBoundingBox();
		this._three.geometry.boundingBox && this._three.geometry.boundingBox.getSize(this._size);
		this._size.multiply(this.scale);
	}
	
	updateTransform() {
		
	}
	
	static from(url: string, callback: (sprite: Sprite) => void) {
		const sprite = new Sprite(new THREE.TextureLoader().load(url, texture => {
			sprite.texture = texture;
			callback && callback(sprite);
		}));
		
		return sprite;
	}
}