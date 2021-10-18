import * as THREE from 'three';
import isMobile from 'ismobilejs';
import { Emitter } from '@tawaship/emitter';
import { View } from './View';
import { IInteractionEvent } from './InteractionManager';
import { ITickerData } from './DisplayObject';
import { IDeliverData } from './IDeliverData';

export class ViewFrame extends Emitter {
	private _views: View[] = [];
	private _id: number;
	
	constructor(id: number) {
		super();
		
		this._id = id;
	}
	
	get id() {
		return this._id;
	}
	
	addView(view: View) {
		this.removeView(view);
		
		this._views.push(view);
		
		return view;
	}
	
	addViewAt(view: View, index: number) {
		this.removeView(view);
		
		this._views.splice(index, 0, view);
		
		return view;
	}
	
	removeView(view: View) {
		const index = this._views.indexOf(view);
		if (index === -1) {
			return;
		}
		
		this._views.splice(index, 1);
		
		return view;
	}
	
	removeAllViews() {
		this._views = [];
	}
	
	onInteraction(event: IInteractionEvent, raycaster: THREE.Raycaster, mouse: THREE.Vector2) {
		const c = this._views;
		for (let i = c.length - 1; i >= 0; i--) {
			if (event.emitted.length > 0) {
				return;
			}
			
			c[i].onInteraction(event, raycaster, mouse);
		}
	}
	
	update(e: ITickerData) {
		const c = this._views;
		
		for (let i = 0; i < c.length; i++) {
			c[i].update(e, false);
		}
	}
	
	render(renderer: THREE.WebGLRenderer) {
		const c = this._views;
		for (let i = 0; i < c.length; i++) {
			c[i].render(renderer);
		}
	}
}
