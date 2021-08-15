import * as THREE from 'three';
import isMobile from 'ismobilejs';
import { View } from './View';
import { DisplayObject, IInteractionEvent, ITickerData } from './DisplayObject';
import { Content } from './Content';
import { IDeliverData } from './IDeliverData';

export interface IApplicationOption {
	canvas?: HTMLCanvasElement;
	container?: HTMLElement;
	width?: number;
	height?: number;
	transparent?: boolean;
	resolution?: number;
	backgroundColor?: number;
	antialias?: boolean;
	autoAdjust?: TAutoAdjust;
	basepath?: string;
	version?: string;
}

export interface IAdjustDelegate {
	(app: Application): void;
}

export type TAutoAdjust = boolean | IAdjustDelegate;

export interface IAutoAdjustDelegate {
	(): void;
}

export type TAutoAdjuster = IAutoAdjustDelegate | null;

export interface ISize {
	width: number;
	height: number;
}

export interface IPosition {
	x: number;
	y: number;
}

export interface IHorizontal {
	x: number;
	width: number;
}

export interface IVertical {
	y: number;
	height: number;
}

export interface IRect extends ISize, IPosition {}

export class Application {
	private _container: HTMLElement;
	private _renderer: THREE.WebGLRenderer;
	private _views: View[] = [];
	private _lastTime: number = 0;
	private _playing: boolean = false;
	private _rendererSize: THREE.Vector2;
	private _autoAdjuster: TAutoAdjuster = null;
	private _basepath: string = '';
	private _version: string = '';
	
	interactionDown: boolean = true;
	interactionMove: boolean = false;
	interactionUp: boolean = true;
	
	constructor(options: IApplicationOption = {}) {
		const canvas = options.canvas || undefined;
		const container = options.container || document.body;
		const transparent = options.transparent || false;
		const antialias = options.antialias || false;
		const rendererOptions = {
			canvas, alpha: transparent, antialias
		}
		
		const renderer = new THREE.WebGLRenderer(rendererOptions);
		
		const width = options.width || 600;
		const height = options.height || 400;
		const resolution = options.resolution || 1;
		const backgroundColor = options.backgroundColor || 0;
		const opacity = transparent ? 0 : 1;
		const autoAdjust = options.autoAdjust || false;
		const basepath = options.basepath || './';
		const version = options.version || '';
		
		renderer.setClearColor(backgroundColor, 0);
		renderer.setSize(width, height);
		renderer.setPixelRatio(resolution);
		renderer.autoClear = false;
		
		this._container = container;
		this._renderer = renderer;
		this._rendererSize = new THREE.Vector2(width, height);
		this._basepath = basepath;
		this._version = version;
		
		const dom = renderer.domElement;
		dom.style.position = 'absolute';
		const isSP = isMobile(navigator.userAgent).any;
		
		const raycaster = new THREE.Raycaster();
		const mouse = new THREE.Vector2();
		const event: IInteractionEvent = { type: '', emitted: [], originalEvent: null };
		let down: DisplayObject[] = [];
		let over: DisplayObject[] = [];
		
		const cast = (e: Event, x: number, y: number) => {
			event.originalEvent = e;
			event.emitted = [];
			
			const w = dom.offsetWidth;
			const h = dom.offsetHeight;
			
			mouse.x = (x / w) * 2 - 1;
			mouse.y = -(y / h) * 2 + 1;
			
			const c = this._views;
			for (let i = c.length - 1; i >= 0; i--) {
				if (event.emitted.length > 0) {
					return;
				}
				
				c[i].onInteraction(event, raycaster, mouse);
			}
		};
		
		const dispatch = (targets: DisplayObject[], type: string) => {
			for (let i = 0; i < targets.length; i++) {
				targets[i].emit(type, event);
			}
		};
		
		const separate = (_first: DisplayObject[], _emitted: DisplayObject[]) => {
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
		
		const startHandler = (e: Event, x: number, y: number) => {
			down = [];
			if (!this.interactionDown) {
				return;
			}
			
			event.type = 'system:interaction:pointerdown';
			cast(e, x, y);
			
			if (event.emitted.length === 0) {
				return;
			}
			
			dispatch(event.emitted, 'pointerdown');
			down = event.emitted;
		};
		
		const moveHandler = (e: Event, x: number, y: number) => {
			if (!this.interactionMove) {
				return;
			}
			
			event.type = 'system:interaction:pointermove';
			cast(e, x, y);
			
			// 開始がない
			if (over.length === 0) {
				if (event.emitted.length > 0) {
					dispatch(event.emitted, 'pointerover');
					over = event.emitted;
				}
				
				return;
			}
			
			// 開始はあるが乗っていない
			if (event.emitted.length === 0) {
				dispatch(over, 'pointerout');
				over = [];
				
				return;
			}
			
			const saparated = separate(over, event.emitted);
			
			// 共にあるが一致していない
			dispatch(saparated.emitted, 'pointerover');
			dispatch(saparated.first, 'pointerout');
			over = event.emitted;
			
			// 共にあって一致
			dispatch(saparated.both, 'pointermove');
		}
		
		const endHandler = (e: Event, x: number, y: number) => {
			if (!this.interactionUp) {
				return;
			}
			
			event.type = 'system:interaction:pointerup';
			cast(e, x, y);
			
			// 開始がない
			if (down.length === 0) {
				if (event.emitted.length > 0) {
					dispatch(event.emitted, 'pointerup');
				}
				
				return;
			}
			
			// 開始はあるが終了がない
			if (event.emitted.length === 0) {
				dispatch(down, 'pointerupoutside');
				down = [];
				
				return;
			}
			
			const saparated = separate(down, event.emitted);
			
			// 共にあるが一致していない
			dispatch(saparated.emitted, 'pointerup');
			dispatch(saparated.first, 'pointerupoutside');
			
			// 共にあって一致
			dispatch(saparated.both, 'pointerup');
			dispatch(saparated.both, 'pointertap');
			down = [];
		}
		
		if (isSP) {
			dom.addEventListener('touchstart', e => {
				startHandler(e, e.touches[0].clientX - dom.offsetLeft, e.touches[0].clientY - dom.offsetTop);
			});
			
			dom.addEventListener('touchmove', e => {
				moveHandler(e, e.touches[0].clientX - dom.offsetLeft, e.touches[0].clientY - dom.offsetTop);
			});
			
			dom.addEventListener('touchend', e => {
				endHandler(e, e.changedTouches[0].clientX - dom.offsetLeft, e.changedTouches[0].clientY - dom.offsetTop);
			});
		} else {
			dom.addEventListener('mousedown', e => {
				startHandler(e, e.offsetX, e.offsetY);
			});
			
			dom.addEventListener('mousemove', e => {
				moveHandler(e, e.offsetX, e.offsetY);
			});
			
			dom.addEventListener('mouseup', e => {
				endHandler(e, e.offsetX, e.offsetY);
			});
		}
		
		window.addEventListener('visibilitychange', e => {
			this._lastTime = e.timeStamp;
		});
		
		const step = (timestamp: number) => {
			const delta = (timestamp - this._lastTime) * 0.06;
			this._lastTime = timestamp;
			
			if (!this._playing) {
				requestAnimationFrame(step);
				return;
			}
			
			this.update(delta);
			requestAnimationFrame(step);
		};
		
		requestAnimationFrame(step);
		
		if (autoAdjust) {
			if (autoAdjust === true) {
				this.autoAdjuster = () => {
					this.fullScreen()
				};
			} else {
				this.autoAdjuster = () => {
					autoAdjust(this);
				};
			}
		}
	}
	
	attachAsync(content: Content) {
		return content.loadAssetsAsync(this._basepath, this._version)
			.then(resources => {
				return {
					width: this._rendererSize.width,
					height: this._rendererSize.height,
					resources,
					vars: content.vars
				};
			})
			.then(($: IDeliverData) => {
				const viewClasses = content.viewClasses;
				for (let i = 0; i < viewClasses.length; i++) {
					this.addView(new viewClasses[i]($));
				}
				
				return this;
			});
	}
	
	get element() {
		return this._renderer.domElement;
	}
	
	get width() {
		return this._rendererSize.x;
	}
	
	get height() {
		return this._rendererSize.y;
	}
	
	addView(view: View) {
		this._views.push(view);
		
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
	
	play() {
		this._container.appendChild(this._renderer.domElement);
		
		return this.start();
	}
	
	start() {
		this._playing = true;
		
		return this;
	}
	
	stop() {
		this._playing = false;
		
		return this;
	}
	
	update(delta: number) {
		const c = this._views;
		const e: ITickerData = { delta };
		
		for (let i = 0; i < c.length; i++) {
			c[i].update(e);
		}
		
		this.render();
	}
	
	render() {
		this._renderer.setViewport(0, 0, this._rendererSize.x, this._rendererSize.y);
		this._renderer.clear();
		
		const c = this._views;
		for (let i = 0; i < c.length; i++) {
			c[i].render(this._renderer);
		}
	}
	
	get autoAdjuster() {
		return this._autoAdjuster;
	}
	
	set autoAdjuster(autoAdjuster: TAutoAdjuster) {
		if (this._autoAdjuster) {
			window.removeEventListener('resize', this._autoAdjuster);
		}
		
		if (!autoAdjuster) {
			this._autoAdjuster = null;
			return;
		}
		
		this._autoAdjuster = autoAdjuster;
		window.addEventListener('resize', autoAdjuster);
		autoAdjuster();
	}
	
	/**
	 * Resize canvas to fit specified rectangle.
	 * 
	 * @param rect Rectangle to adjust.
	 */
	fullScreen(rect?: IRect) {
		const view: HTMLCanvasElement = this._renderer.domElement;
		const r: IRect = rect || {
			x: 0,
			y: 0,
			width: this._container.offsetWidth || window.innerWidth,
			height: this._container.offsetHeight || window.innerHeight
		};
		
		if (r.width / r.height > view.width / view.height) {
			return this.adjustHeight(r.height).toCenter(r).toTop(r);
		}
		
		return this.adjustWidth(r.width).toMiddle(r).toLeft(r);
	}
	
	/**
	 * Resize canvas to fit specified width.
	 * 
	 * @param width Width to adjust.
	 */
	adjustWidth(width?: number) {
		const view: HTMLCanvasElement = this._renderer.domElement;
		const w: number = width || this._container.offsetWidth || window.innerWidth;
		
		const h: number = w / view.width * view.height;
		
		//const frame = this._piximData.frame;
		view.style.width = `${w}px`;
		view.style.height = `${h}px`;
		
		return this;
	}
	
	/**
	 * Resize canvas to fit specified height.
	 * 
	 * @param height Height to adjust.
	 */
	adjustHeight(height?: number) {
		const view = this._renderer.domElement;
		const h: number = height || this._container.offsetHeight || window.innerHeight;
		
		const w = h / view.height * view.width;
		
		//const frame = this._piximData.frame;
		view.style.height = `${h}px`;
		view.style.width = `${w}px`;
		
		return this;
	}
	
	/**
	 * Left justified with respect to the reference data.
	 * 
	 * @param horizontal Horizontal data used to calculate the position.
	 */
	toLeft(horizontal?: IHorizontal) {
		const view = this._renderer.domElement;
		const hol: IHorizontal = horizontal || {
			x: 0,
			width: this._container.offsetWidth || window.innerWidth
		};
		
		view.style.left = `${hol.x}px`;
		
		return this;
	}
	
	/**
	 * Center justified with respect to the reference data.
	 * 
	 * @param horizontal Horizontal data used to calculate the position.
	 */
	toCenter(horizontal?: IHorizontal) {
		const view = this._renderer.domElement;
		const hol: IHorizontal = horizontal || {
			x: 0,
			width: this._container.offsetWidth || window.innerWidth
		};
		
		view.style.left = `${(hol.width - this._getViewRect().width) / 2 + hol.x}px`;
		
		return this;
	}
	
	/**
	 * Right justified with respect to the reference data.
	 * 
	 * @param horizontal Horizontal data used to calculate the position.
	 */
	toRight(horizontal?: IHorizontal) {
		const view = this._renderer.domElement;
		const hol: IHorizontal = horizontal || {
			x: 0,
			width: this._container.offsetWidth || window.innerWidth
		};
		
		view.style.left = `${hol.width - this._getViewRect().width + hol.x}px`;
		
		return this;
	}
	
	/**
	 * Top justified with respect to the reference data.
	 * 
	 * @param vertical Vertical data used to calculate the position.
	 */
	toTop(vertical?: IVertical) {
		const view = this._renderer.domElement;
		const ver: IVertical = vertical || {
			y: 0,
			height: this._container.offsetHeight || window.innerHeight
		};
		
		view.style.top = `${ver.y}px`;
		
		return this;
	}
	
	/**
	 * Middle justified with respect to the reference data.
	 * 
	 * @param vertical Vertical data used to calculate the position.
	 */
	toMiddle(vertical?: IVertical) {
		const view = this._renderer.domElement;
		const ver: IVertical = vertical || {
			y: 0,
			height: this._container.offsetHeight || window.innerHeight
		};
		
		view.style.top = `${(ver.height - this._getViewRect().height) / 2 + ver.y}px`;
		
		return this;
	}
	
	/**
	 * Bottom justified with respect to the reference data.
	 * 
	 * @param vertical Vertical data used to calculate the position.
	 */
	toBottom(vertical?: IVertical) {
		const view = this._renderer.domElement;
		const ver: IVertical = vertical || {
			y: 0,
			height: this._container.offsetHeight || window.innerHeight
		};
		
		view.style.top = `${ver.height - this._getViewRect().height + ver.y}px`;
		
		return this;
	}
	
	private _getViewRect(): IRect {
		const view = this._renderer.domElement;
		
		return {
			x: parseInt(view.style.left.replace('px', '')),
			y: parseInt(view.style.top.replace('px', '')),
			width: parseInt(view.style.width.replace('px', '')),
			height: parseInt(view.style.height.replace('px', ''))
		};
	}
}
