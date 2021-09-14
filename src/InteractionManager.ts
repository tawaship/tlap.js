import * as THREE from 'three';
import isMobile from 'ismobilejs';
import { DisplayObject } from './DisplayObject';
import { Emitter } from '@tawaship/emitter';

/**
 * @ignore
 */
const isSP = isMobile(navigator.userAgent).any;

/**
 * @ignore
 */
function separate(_first: DisplayObject[], _emitted: DisplayObject[]) {
	const first: DisplayObject[] = _first.concat([]);
	const emitted: DisplayObject[] = _emitted.concat([]);
	const both: DisplayObject[] = [];
	
	for (let i = first.length - 1; i >= 0; i--) {
		const p = first[i];
		const index = emitted.indexOf(p);
		
		if (index > -1) {
			first.splice(i, 1);
			emitted.splice(index, 1);
			both.push(p);
		}
	}
	
	return { both, first, emitted };
}

/**
 * @ignore
 */
function dispatch(targets: DisplayObject[], type: string, event: IInteractionEvent) {
	for (let i = 0; i < targets.length; i++) {
		targets[i].emit(type, event);
	}
};

export interface IInteractionEvent extends THREE.Event {
	type: string;
	emitted: DisplayObject[];
	originalEvent: Event | null;
};

export class InteractionManager extends Emitter {
	protected _mouse: THREE.Vector2 = new THREE.Vector2();
	protected _event: IInteractionEvent = { type: '', emitted: [], originalEvent: null };
	protected _down: DisplayObject[] = [];
	protected _over: DisplayObject[] = [];
	
	interactive: boolean = true;
	interactiveDown: boolean = true;
	interactiveMove: boolean = false;
	interactiveUp: boolean = true;
	
	/**
	 * @fire cast
	 */
	protected _cast(e: Event, x: number, y: number, width: number, height: number) {
		this._event.originalEvent = e;
		this._event.emitted = [];
		
		this._mouse.x = (x / width) * 2 - 1;
		this._mouse.y = -(y / height) * 2 + 1;
		
		this.emit('cast', this._event, this._mouse);
	}
	
	onDown(e: Event, x: number, y: number, width: number, height: number) {
		this._down = [];
		if (!this.interactive || !this.interactiveDown) {
			return;
		}
		
		this._event.type = 'system:interaction:pointerdown';
		this._cast(e, x, y, width, height);
		
		if (this._event.emitted.length === 0) {
			return;
		}
		
		dispatch(this._event.emitted, 'pointerdown', this._event);
		this._down = this._event.emitted;
	}
	
	onMove(e: Event, x: number, y: number, width: number, height: number) {
		if (!this.interactive || !this.interactiveMove) {
			return;
		}
		
		this._event.type = 'system:interaction:pointermove';
		this._cast(e, x, y, width, height);
		
		if (this._over.length === 0) {
			if (this._event.emitted.length > 0) {
				dispatch(this._event.emitted, 'pointerover', this._event);
				this._over = this._event.emitted;
			}
			
			return;
		}
		
		if (this._event.emitted.length === 0) {
			dispatch(this._over, 'pointerout', this._event);
			this._over = [];
			
			return;
		}
		
		const saparated = separate(this._over, this._event.emitted);
		
		dispatch(saparated.emitted, 'pointerover', this._event);
		dispatch(saparated.first, 'pointerout', this._event);
		this._over = this._event.emitted;
		
		dispatch(saparated.both, 'pointermove', this._event);
	}
	
	onUp(e: Event, x: number, y: number, width: number, height: number) {
		if (!this.interactive || !this.interactiveUp) {
			return;
		}
		
		this._event.type = 'system:interaction:pointerup';
		this._cast(e, x, y, width, height);
		
		if (this._down.length === 0) {
			if (this._event.emitted.length > 0) {
				dispatch(this._event.emitted, 'pointerup', this._event);
			}
			
			return;
		}
		
		if (this._event.emitted.length === 0) {
			dispatch(this._down, 'pointerupoutside', this._event);
			this._down = [];
			
			return;
		}
		
		const saparated = separate(this._down, this._event.emitted);
		
		dispatch(saparated.emitted, 'pointerup', this._event);
		dispatch(saparated.first, 'pointerupoutside', this._event);
		
		dispatch(saparated.both, 'pointerup', this._event);
		dispatch(saparated.both, 'pointertap', this._event);
		this._down = [];
	}
	
	addCanvas(canvas: HTMLCanvasElement) {
		if (isSP) {
			canvas.addEventListener('touchstart', (e: TouchEvent) => {
				this.onDown(e, e.touches[0].clientX - canvas.offsetLeft, e.touches[0].clientY - canvas.offsetTop, canvas.offsetWidth, canvas.offsetHeight);
			});
			
			canvas.addEventListener('touchmove', (e: TouchEvent) => {
				this.onMove(e, e.touches[0].clientX - canvas.offsetLeft, e.touches[0].clientY - canvas.offsetTop, canvas.offsetWidth, canvas.offsetHeight);
			});
			
			canvas.addEventListener('touchend', (e: TouchEvent) => {
				this.onUp(e, e.changedTouches[0].clientX - canvas.offsetLeft, e.changedTouches[0].clientY - canvas.offsetTop, canvas.offsetWidth, canvas.offsetHeight);
			});
		} else {
			canvas.addEventListener('mousedown', (e: MouseEvent) => {
				this.onDown(e, e.offsetX, e.offsetY, canvas.offsetWidth, canvas.offsetHeight);
			});
			
			canvas.addEventListener('mousemove', (e: MouseEvent) => {
				this.onMove(e, e.offsetX, e.offsetY, canvas.offsetWidth, canvas.offsetHeight);
			});
			
			canvas.addEventListener('mouseup', (e: MouseEvent) => {
				this.onUp(e, e.offsetX, e.offsetY, canvas.offsetWidth, canvas.offsetHeight);
			});
		}
	}
}
