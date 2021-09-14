import * as THREE from 'three';
import isMobile from 'ismobilejs';
import { View } from './View';
import { DisplayObject, ITickerData } from './DisplayObject';
import { InteractionManager, IInteractionEvent } from './InteractionManager';
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
	interactionCanvas?: HTMLCanvasElement;
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
	private _interactionManager = new InteractionManager();
	
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
		
		renderer.domElement.style.position = 'absolute';
		
		const raycaster = new THREE.Raycaster();
		
		this._interactionManager.addCanvas(renderer.domElement);
		
		this._interactionManager.on('cast', (event: IInteractionEvent, mouse: THREE.Vector2) => {
			const c = this._views;
			for (let i = c.length - 1; i >= 0; i--) {
				if (event.emitted.length > 0) {
					return;
				}
				
				c[i].onInteraction(event, raycaster, mouse);
			}
		});
		
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
	
	get renderer() {
		return this._renderer;
	}
	
	get interactionManager() {
		return this._interactionManager;
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
