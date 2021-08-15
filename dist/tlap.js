/*!
 * tlap.js - v1.0.0
 * 
 * @require three.js v0.127.0
 * @author tawaship (makazu.mori@gmail.com)
 * @license MIT
 */
!function(exports, THREE, GLTFLoader) {
    "use strict";
    var Anchor = function(x, y, z, mesh) {
        this._x = x, this._y = y, this._z = z, this._mesh = mesh;
    }, prototypeAccessors = {
        x: {
            configurable: !0
        },
        y: {
            configurable: !0
        },
        z: {
            configurable: !0
        }
    };
    prototypeAccessors.x.get = function() {
        return this._x;
    }, prototypeAccessors.x.set = function(value) {
        this._x = value, this._mesh.updateGeometryPosition();
    }, prototypeAccessors.y.get = function() {
        return this._y;
    }, prototypeAccessors.y.set = function(value) {
        this._y = value, this._mesh.updateGeometryPosition();
    }, prototypeAccessors.z.get = function() {
        return this._z;
    }, prototypeAccessors.z.set = function(value) {
        this._z = value, this._mesh.updateGeometryPosition();
    }, Anchor.prototype.set = function(x, y, z) {
        void 0 === y && (y = x), void 0 === z && (z = y), this._x = x, this._y = y, this._z = z, 
        this._mesh.updateGeometryPosition();
    }, Object.defineProperties(Anchor.prototype, prototypeAccessors);
    var appleIphone = /iPhone/i, appleIpod = /iPod/i, appleTablet = /iPad/i, appleUniversal = /\biOS-universal(?:.+)Mac\b/i, androidPhone = /\bAndroid(?:.+)Mobile\b/i, androidTablet = /Android/i, amazonPhone = /(?:SD4930UR|\bSilk(?:.+)Mobile\b)/i, amazonTablet = /Silk/i, windowsPhone = /Windows Phone/i, windowsTablet = /\bWindows(?:.+)ARM\b/i, otherBlackBerry = /BlackBerry/i, otherBlackBerry10 = /BB10/i, otherOpera = /Opera Mini/i, otherChrome = /\b(CriOS|Chrome)(?:.+)Mobile/i, otherFirefox = /Mobile(?:.+)Firefox\b/i, isAppleTabletOnIos13 = function(navigator) {
        return void 0 !== navigator && "MacIntel" === navigator.platform && "number" == typeof navigator.maxTouchPoints && navigator.maxTouchPoints > 1 && "undefined" == typeof MSStream;
    };
    var Application = function(options) {
        var this$1 = this;
        void 0 === options && (options = {}), this._views = [], this._lastTime = 0, this._playing = !1, 
        this._autoAdjuster = null, this._basepath = "", this._version = "", this.interactionDown = !0, 
        this.interactionMove = !1, this.interactionUp = !0;
        var canvas = options.canvas || void 0, container = options.container || document.body, rendererOptions = {
            canvas: canvas,
            alpha: options.transparent || !1,
            antialias: options.antialias || !1
        }, renderer = new THREE.WebGLRenderer(rendererOptions), width = options.width || 600, height = options.height || 400, resolution = options.resolution || 1, backgroundColor = options.backgroundColor || 0, autoAdjust = options.autoAdjust || !1, basepath = options.basepath || "./", version = options.version || "";
        renderer.setClearColor(backgroundColor, 0), renderer.setSize(width, height), renderer.setPixelRatio(resolution), 
        renderer.autoClear = !1, this._container = container, this._renderer = renderer, 
        this._rendererSize = new THREE.Vector2(width, height), this._basepath = basepath, 
        this._version = version;
        var dom = renderer.domElement;
        dom.style.position = "absolute";
        var isSP = function(param) {
            var nav = {
                userAgent: "",
                platform: "",
                maxTouchPoints: 0
            };
            param || "undefined" == typeof navigator ? "string" == typeof param ? nav.userAgent = param : param && param.userAgent && (nav = {
                userAgent: param.userAgent,
                platform: param.platform,
                maxTouchPoints: param.maxTouchPoints || 0
            }) : nav = {
                userAgent: navigator.userAgent,
                platform: navigator.platform,
                maxTouchPoints: navigator.maxTouchPoints || 0
            };
            var userAgent = nav.userAgent, tmp = userAgent.split("[FBAN");
            void 0 !== tmp[1] && (userAgent = tmp[0]), void 0 !== (tmp = userAgent.split("Twitter"))[1] && (userAgent = tmp[0]);
            var match = function(userAgent) {
                return function(regex) {
                    return regex.test(userAgent);
                };
            }(userAgent), result = {
                apple: {
                    phone: match(appleIphone) && !match(windowsPhone),
                    ipod: match(appleIpod),
                    tablet: !match(appleIphone) && (match(appleTablet) || isAppleTabletOnIos13(nav)) && !match(windowsPhone),
                    universal: match(appleUniversal),
                    device: (match(appleIphone) || match(appleIpod) || match(appleTablet) || match(appleUniversal) || isAppleTabletOnIos13(nav)) && !match(windowsPhone)
                },
                amazon: {
                    phone: match(amazonPhone),
                    tablet: !match(amazonPhone) && match(amazonTablet),
                    device: match(amazonPhone) || match(amazonTablet)
                },
                android: {
                    phone: !match(windowsPhone) && match(amazonPhone) || !match(windowsPhone) && match(androidPhone),
                    tablet: !match(windowsPhone) && !match(amazonPhone) && !match(androidPhone) && (match(amazonTablet) || match(androidTablet)),
                    device: !match(windowsPhone) && (match(amazonPhone) || match(amazonTablet) || match(androidPhone) || match(androidTablet)) || match(/\bokhttp\b/i)
                },
                windows: {
                    phone: match(windowsPhone),
                    tablet: match(windowsTablet),
                    device: match(windowsPhone) || match(windowsTablet)
                },
                other: {
                    blackberry: match(otherBlackBerry),
                    blackberry10: match(otherBlackBerry10),
                    opera: match(otherOpera),
                    firefox: match(otherFirefox),
                    chrome: match(otherChrome),
                    device: match(otherBlackBerry) || match(otherBlackBerry10) || match(otherOpera) || match(otherFirefox) || match(otherChrome)
                },
                any: !1,
                phone: !1,
                tablet: !1
            };
            return result.any = result.apple.device || result.android.device || result.windows.device || result.other.device, 
            result.phone = result.apple.phone || result.android.phone || result.windows.phone, 
            result.tablet = result.apple.tablet || result.android.tablet || result.windows.tablet, 
            result;
        }(navigator.userAgent).any, raycaster = new THREE.Raycaster, mouse = new THREE.Vector2, event = {
            type: "",
            emitted: [],
            originalEvent: null
        }, down = [], over = [], cast = function(e, x, y) {
            event.originalEvent = e, event.emitted = [];
            var w = dom.offsetWidth, h = dom.offsetHeight;
            mouse.x = x / w * 2 - 1, mouse.y = -y / h * 2 + 1;
            for (var c = this$1._views, i = c.length - 1; i >= 0; i--) {
                if (event.emitted.length > 0) {
                    return;
                }
                c[i].onInteraction(event, raycaster, mouse);
            }
        }, dispatch = function(targets, type) {
            for (var i = 0; i < targets.length; i++) {
                targets[i].emit(type, event);
            }
        }, separate = function(_first, _emitted) {
            for (var first = _first.concat([]), emitted = _emitted.concat([]), both = [], i = first.length - 1; i >= 0; i--) {
                var p = first[i], index = emitted.indexOf(p);
                index > -1 && (first.splice(i, 1), emitted.splice(index, 1), both.push(p));
            }
            return {
                both: both,
                first: first,
                emitted: emitted
            };
        }, startHandler = function(e, x, y) {
            down = [], this$1.interactionDown && (event.type = "system:interaction:pointerdown", 
            cast(e, x, y), 0 !== event.emitted.length && (dispatch(event.emitted, "pointerdown"), 
            down = event.emitted));
        }, moveHandler = function(e, x, y) {
            if (this$1.interactionMove) {
                if (event.type = "system:interaction:pointermove", cast(e, x, y), 0 !== over.length) {
                    if (0 === event.emitted.length) {
                        return dispatch(over, "pointerout"), void (over = []);
                    }
                    var saparated = separate(over, event.emitted);
                    dispatch(saparated.emitted, "pointerover"), dispatch(saparated.first, "pointerout"), 
                    over = event.emitted, dispatch(saparated.both, "pointermove");
                } else {
                    event.emitted.length > 0 && (dispatch(event.emitted, "pointerover"), over = event.emitted);
                }
            }
        }, endHandler = function(e, x, y) {
            if (this$1.interactionUp) {
                if (event.type = "system:interaction:pointerup", cast(e, x, y), 0 !== down.length) {
                    if (0 === event.emitted.length) {
                        return dispatch(down, "pointerupoutside"), void (down = []);
                    }
                    var saparated = separate(down, event.emitted);
                    dispatch(saparated.emitted, "pointerup"), dispatch(saparated.first, "pointerupoutside"), 
                    dispatch(saparated.both, "pointerup"), dispatch(saparated.both, "pointertap"), down = [];
                } else {
                    event.emitted.length > 0 && dispatch(event.emitted, "pointerup");
                }
            }
        };
        isSP ? (dom.addEventListener("touchstart", (function(e) {
            startHandler(e, e.touches[0].clientX - dom.offsetLeft, e.touches[0].clientY - dom.offsetTop);
        })), dom.addEventListener("touchmove", (function(e) {
            moveHandler(e, e.touches[0].clientX - dom.offsetLeft, e.touches[0].clientY - dom.offsetTop);
        })), dom.addEventListener("touchend", (function(e) {
            endHandler(e, e.changedTouches[0].clientX - dom.offsetLeft, e.changedTouches[0].clientY - dom.offsetTop);
        }))) : (dom.addEventListener("mousedown", (function(e) {
            startHandler(e, e.offsetX, e.offsetY);
        })), dom.addEventListener("mousemove", (function(e) {
            moveHandler(e, e.offsetX, e.offsetY);
        })), dom.addEventListener("mouseup", (function(e) {
            endHandler(e, e.offsetX, e.offsetY);
        }))), window.addEventListener("visibilitychange", (function(e) {
            this$1._lastTime = e.timeStamp;
        }));
        var step = function(timestamp) {
            var delta = .06 * (timestamp - this$1._lastTime);
            this$1._lastTime = timestamp, this$1._playing ? (this$1.update(delta), requestAnimationFrame(step)) : requestAnimationFrame(step);
        };
        requestAnimationFrame(step), autoAdjust && (this.autoAdjuster = !0 === autoAdjust ? function() {
            this$1.fullScreen();
        } : function() {
            autoAdjust(this$1);
        });
    }, prototypeAccessors$1 = {
        element: {
            configurable: !0
        },
        width: {
            configurable: !0
        },
        height: {
            configurable: !0
        },
        autoAdjuster: {
            configurable: !0
        }
    };
    Application.prototype.attachAsync = function(content) {
        var this$1 = this;
        return content.loadAssetsAsync(this._basepath, this._version).then((function(resources) {
            return {
                width: this$1._rendererSize.width,
                height: this$1._rendererSize.height,
                resources: resources,
                vars: content.vars
            };
        })).then((function($) {
            for (var viewClasses = content.viewClasses, i = 0; i < viewClasses.length; i++) {
                this$1.addView(new viewClasses[i]($));
            }
            return this$1;
        }));
    }, prototypeAccessors$1.element.get = function() {
        return this._renderer.domElement;
    }, prototypeAccessors$1.width.get = function() {
        return this._rendererSize.x;
    }, prototypeAccessors$1.height.get = function() {
        return this._rendererSize.y;
    }, Application.prototype.addView = function(view) {
        return this._views.push(view), view;
    }, Application.prototype.removeView = function(view) {
        var index = this._views.indexOf(view);
        if (-1 !== index) {
            return this._views.splice(index, 1), view;
        }
    }, Application.prototype.play = function() {
        return this._container.appendChild(this._renderer.domElement), this.start();
    }, Application.prototype.start = function() {
        return this._playing = !0, this;
    }, Application.prototype.stop = function() {
        return this._playing = !1, this;
    }, Application.prototype.update = function(delta) {
        for (var c = this._views, e = {
            delta: delta
        }, i = 0; i < c.length; i++) {
            c[i].update(e);
        }
        this.render();
    }, Application.prototype.render = function() {
        this._renderer.setViewport(0, 0, this._rendererSize.x, this._rendererSize.y), this._renderer.clear();
        for (var c = this._views, i = 0; i < c.length; i++) {
            c[i].render(this._renderer);
        }
    }, prototypeAccessors$1.autoAdjuster.get = function() {
        return this._autoAdjuster;
    }, prototypeAccessors$1.autoAdjuster.set = function(autoAdjuster) {
        this._autoAdjuster && window.removeEventListener("resize", this._autoAdjuster), 
        autoAdjuster ? (this._autoAdjuster = autoAdjuster, window.addEventListener("resize", autoAdjuster), 
        autoAdjuster()) : this._autoAdjuster = null;
    }, Application.prototype.fullScreen = function(rect) {
        var view = this._renderer.domElement, r = rect || {
            x: 0,
            y: 0,
            width: this._container.offsetWidth || window.innerWidth,
            height: this._container.offsetHeight || window.innerHeight
        };
        return r.width / r.height > view.width / view.height ? this.adjustHeight(r.height).toCenter(r).toTop(r) : this.adjustWidth(r.width).toMiddle(r).toLeft(r);
    }, Application.prototype.adjustWidth = function(width) {
        var view = this._renderer.domElement, w = width || this._container.offsetWidth || window.innerWidth, h = w / view.width * view.height;
        return view.style.width = w + "px", view.style.height = h + "px", this;
    }, Application.prototype.adjustHeight = function(height) {
        var view = this._renderer.domElement, h = height || this._container.offsetHeight || window.innerHeight, w = h / view.height * view.width;
        return view.style.height = h + "px", view.style.width = w + "px", this;
    }, Application.prototype.toLeft = function(horizontal) {
        var view = this._renderer.domElement, hol = horizontal || {
            x: 0,
            width: this._container.offsetWidth || window.innerWidth
        };
        return view.style.left = hol.x + "px", this;
    }, Application.prototype.toCenter = function(horizontal) {
        var view = this._renderer.domElement, hol = horizontal || {
            x: 0,
            width: this._container.offsetWidth || window.innerWidth
        };
        return view.style.left = (hol.width - this._getViewRect().width) / 2 + hol.x + "px", 
        this;
    }, Application.prototype.toRight = function(horizontal) {
        var view = this._renderer.domElement, hol = horizontal || {
            x: 0,
            width: this._container.offsetWidth || window.innerWidth
        };
        return view.style.left = hol.width - this._getViewRect().width + hol.x + "px", this;
    }, Application.prototype.toTop = function(vertical) {
        var view = this._renderer.domElement, ver = vertical || {
            y: 0,
            height: this._container.offsetHeight || window.innerHeight
        };
        return view.style.top = ver.y + "px", this;
    }, Application.prototype.toMiddle = function(vertical) {
        var view = this._renderer.domElement, ver = vertical || {
            y: 0,
            height: this._container.offsetHeight || window.innerHeight
        };
        return view.style.top = (ver.height - this._getViewRect().height) / 2 + ver.y + "px", 
        this;
    }, Application.prototype.toBottom = function(vertical) {
        var view = this._renderer.domElement, ver = vertical || {
            y: 0,
            height: this._container.offsetHeight || window.innerHeight
        };
        return view.style.top = ver.height - this._getViewRect().height + ver.y + "px", 
        this;
    }, Application.prototype._getViewRect = function() {
        var view = this._renderer.domElement;
        return {
            x: parseInt(view.style.left.replace("px", "")),
            y: parseInt(view.style.top.replace("px", "")),
            width: parseInt(view.style.width.replace("px", "")),
            height: parseInt(view.style.height.replace("px", ""))
        };
    }, Object.defineProperties(Application.prototype, prototypeAccessors$1);
    var BodyPosition = function(object) {
        this._object = object;
    }, prototypeAccessors$2 = {
        x: {
            configurable: !0
        },
        y: {
            configurable: !0
        },
        z: {
            configurable: !0
        }
    };
    prototypeAccessors$2.x.get = function() {
        return this._object.body.getPosition().x;
    }, prototypeAccessors$2.x.set = function(value) {
        var position = this._object.body.getPosition();
        position.x = value, this._object.body.setPosition(position), this._object.updateTransform();
    }, prototypeAccessors$2.y.get = function() {
        return this._object.body.getPosition().y;
    }, prototypeAccessors$2.y.set = function(value) {
        var position = this._object.body.getPosition();
        position.y = value, this._object.body.setPosition(position), this._object.updateTransform();
    }, prototypeAccessors$2.z.get = function() {
        return this._object.body.getPosition().z;
    }, prototypeAccessors$2.z.set = function(value) {
        var position = this._object.body.getPosition();
        position.z = value, this._object.body.setPosition(position), this._object.updateTransform();
    }, BodyPosition.prototype.set = function(x, y, z) {
        void 0 === y && (y = x), void 0 === z && (z = y);
        var position = this._object.body.getPosition();
        position.x = x, position.y = y, position.z = z, this._object.body.setPosition(position), 
        this._object.updateTransform();
    }, Object.defineProperties(BodyPosition.prototype, prototypeAccessors$2);
    var BodyRotation = function(object) {
        this._object = object;
    }, prototypeAccessors$3 = {
        x: {
            configurable: !0
        },
        y: {
            configurable: !0
        },
        z: {
            configurable: !0
        }
    };
    prototypeAccessors$3.x.get = function() {
        return this._object.body.getRotation().toEulerXyz().x;
    }, prototypeAccessors$3.x.set = function(value) {
        var rotation = this._object.body.getRotation().toEulerXyz();
        rotation.x = value, this._object.body.setRotationXyz(rotation), this._object.updateTransform();
    }, prototypeAccessors$3.y.get = function() {
        return this._object.body.getRotation().toEulerXyz().y;
    }, prototypeAccessors$3.y.set = function(value) {
        var rotation = this._object.body.getRotation().toEulerXyz();
        rotation.y = value, this._object.body.setRotationXyz(rotation), this._object.updateTransform();
    }, prototypeAccessors$3.z.get = function() {
        return this._object.body.getRotation().toEulerXyz().z;
    }, prototypeAccessors$3.z.set = function(value) {
        var rotation = this._object.body.getRotation().toEulerXyz();
        rotation.z = value, this._object.body.setRotationXyz(rotation), this._object.updateTransform();
    }, BodyRotation.prototype.set = function(x, y, z) {
        void 0 === y && (y = x), void 0 === z && (z = y);
        var rotation = this._object.body.getRotation().toEulerXyz();
        rotation.x = x, rotation.y = y, rotation.z = z, this._object.body.setRotationXyz(rotation), 
        this._object.updateTransform();
    }, Object.defineProperties(BodyRotation.prototype, prototypeAccessors$3);
    /*!
     * @tawaship/emitter - v3.1.1
     * 
     * @author tawaship (makazu.mori@gmail.com)
     * @license MIT
     */
    var Emitter = function() {
        this._events = {};
    };
    Emitter.prototype._on = function(type, callback, once) {
        if (!type || !callback) {
            return this;
        }
        for (var events = this._events[type] = this._events[type] || [], i = 0; i < events.length; i++) {
            if (events[i].callback === callback) {
                return this;
            }
        }
        return events.push({
            callback: callback,
            once: once
        }), this;
    }, Emitter.prototype.on = function(type, callback) {
        return this._on(type, callback, !1);
    }, Emitter.prototype.once = function(type, callback) {
        return this._on(type, callback, !0);
    }, Emitter.prototype.off = function(type, callback) {
        if (!type || !callback) {
            return this;
        }
        for (var events = this._events[type] || [], i = 0; i < events.length; i++) {
            if (events[i].callback === callback) {
                return events.splice(i, 1), this;
            }
        }
        return this;
    }, Emitter.prototype._emit = function(type, context) {
        for (var args = [], len = arguments.length - 2; len-- > 0; ) {
            args[len] = arguments[len + 2];
        }
        if (!type) {
            return this;
        }
        for (var events = this._events[type] || [], targets = [], i = events.length - 1; i >= 0; i--) {
            var event = events[i];
            event.once && events.splice(i, 1), targets.push(event);
        }
        for (var i$1 = targets.length - 1; i$1 >= 0; i$1--) {
            targets[i$1].callback.apply(context, args);
        }
        return this;
    }, Emitter.prototype.emit = function(type) {
        for (var ref, args = [], len = arguments.length - 1; len-- > 0; ) {
            args[len] = arguments[len + 1];
        }
        return (ref = this)._emit.apply(ref, [ type, this ].concat(args));
    }, Emitter.prototype.cemit = function(type, context) {
        for (var ref, args = [], len = arguments.length - 2; len-- > 0; ) {
            args[len] = arguments[len + 2];
        }
        return (ref = this)._emit.apply(ref, [ type, context ].concat(args));
    }, Emitter.prototype._emitAll = function(context) {
        for (var args = [], len = arguments.length - 1; len-- > 0; ) {
            args[len] = arguments[len + 1];
        }
        if (null == context) {
            return this;
        }
        var targets = [];
        for (var type in this._events) {
            for (var events = this._events[type] || [], i = events.length - 1; i >= 0; i--) {
                var event = events[i];
                event.once && events.splice(i, 1), targets.push(event);
            }
        }
        for (var i$1 = targets.length - 1; i$1 >= 0; i$1--) {
            targets[i$1].callback.apply(context, args);
        }
        return this;
    }, Emitter.prototype.emitAll = function() {
        for (var ref, args = [], len = arguments.length; len--; ) {
            args[len] = arguments[len];
        }
        return (ref = this)._emitAll.apply(ref, [ this ].concat(args));
    }, Emitter.prototype.cemitAll = function(context) {
        for (var ref, args = [], len = arguments.length - 1; len-- > 0; ) {
            args[len] = arguments[len + 1];
        }
        return (ref = this)._emitAll.apply(ref, [ context ].concat(args));
    }, Emitter.prototype.clear = function(type) {
        return void 0 === type && (type = ""), type ? delete this._events[type] : this._events = {}, 
        this;
    };
    /*!
     * @tawaship/task - v1.1.0
     * 
     * @author tawaship (makazu.mori@gmail.com)
     * @license MIT
     */
    var Task = function(callbacks, context) {
        this._taskData = {
            context: null == context ? this : context,
            enabled: !0,
            index: -1,
            callbacks: [],
            value: null
        }, this.add(callbacks);
    }, prototypeAccessors$4 = {
        enabled: {
            configurable: !0
        },
        value: {
            configurable: !0
        }
    };
    prototypeAccessors$4.enabled.get = function() {
        return this._taskData.enabled;
    }, prototypeAccessors$4.enabled.set = function(enabled) {
        this._taskData.enabled = enabled;
    }, Task.prototype.add = function(callbacks) {
        Array.isArray(callbacks) || (callbacks = [ callbacks ]);
        for (var list = this._taskData.callbacks, i = (list.length, 0); i < callbacks.length; i++) {
            callbacks[i] instanceof Function && list.push(callbacks[i]);
        }
        return this;
    }, Task.prototype.done = function() {
        for (var args = [], len = arguments.length; len--; ) {
            args[len] = arguments[len];
        }
        if (this._taskData.enabled) {
            var task = this._taskData.callbacks[this._taskData.index];
            if (task) {
                return this._taskData.value = task.apply(this._taskData.context, args);
            }
        }
    }, Task.prototype._to = function(index) {
        return this._taskData.index = Number(index), this;
    }, Task.prototype.first = function() {
        return this._to(0);
    }, Task.prototype.prev = function() {
        return this._to(this._taskData.index - 1);
    }, Task.prototype.next = function() {
        return this._to(this._taskData.index + 1);
    }, Task.prototype.to = function(index) {
        return this._to(index);
    }, Task.prototype.finish = function() {
        return this._taskData.index = -1, this;
    }, Task.prototype.reset = function() {
        return this._taskData.callbacks = [], this._taskData.index = -1, this._taskData.value = null, 
        this;
    }, Task.prototype.destroy = function() {
        this.reset();
    }, prototypeAccessors$4.value.get = function() {
        return this._taskData.value;
    }, Object.defineProperties(Task.prototype, prototypeAccessors$4);
    var _box = new THREE.Box3, DisplayObject = function(Emitter) {
        function DisplayObject(three) {
            var this$1 = this;
            Emitter.call(this), this._size = new THREE.Vector3, this._pivot = new THREE.Vector3, 
            this._children = [], this.interactive = !1, this._three = this._sub = three, three.addEventListener("system:interaction:pointerdown", (function(event) {
                this$1.interactive && event.emitted.push(this$1);
            })), three.addEventListener("system:interaction:pointerup", (function(event) {
                this$1.interactive && event.emitted.push(this$1);
            })), three.addEventListener("system:interaction:pointermove", (function(event) {
                this$1.interactive && event.emitted.push(this$1);
            })), three.addEventListener("system:interaction:pointerupoutside", (function(event) {
                this$1.interactive && event.emitted.push(this$1);
            })), this._task = new Task([], this), this._task.first();
        }
        Emitter && (DisplayObject.__proto__ = Emitter), DisplayObject.prototype = Object.create(Emitter && Emitter.prototype), 
        DisplayObject.prototype.constructor = DisplayObject;
        var prototypeAccessors = {
            three: {
                configurable: !0
            },
            task: {
                configurable: !0
            },
            parent: {
                configurable: !0
            },
            children: {
                configurable: !0
            },
            width: {
                configurable: !0
            },
            height: {
                configurable: !0
            },
            depth: {
                configurable: !0
            },
            x: {
                configurable: !0
            },
            y: {
                configurable: !0
            },
            z: {
                configurable: !0
            },
            scale: {
                configurable: !0
            },
            pivot: {
                configurable: !0
            }
        };
        return prototypeAccessors.three.get = function() {
            return this._three;
        }, prototypeAccessors.task.get = function() {
            return this._task;
        }, prototypeAccessors.parent.get = function() {
            return this._three.userData.parent;
        }, prototypeAccessors.children.get = function() {
            return this._children;
        }, DisplayObject.prototype.updateTask = function(e) {
            this._task.done(e);
        }, prototypeAccessors.width.get = function() {
            return this.updateBoundingBox(), this._size.x;
        }, prototypeAccessors.height.get = function() {
            return this.updateBoundingBox(), this._size.y;
        }, prototypeAccessors.depth.get = function() {
            return this.updateBoundingBox(), this._size.z * this.scale.z;
        }, prototypeAccessors.x.get = function() {
            return this._three.position.x;
        }, prototypeAccessors.x.set = function(value) {
            this._three.position.x = value;
        }, prototypeAccessors.y.get = function() {
            return this._three.position.y;
        }, prototypeAccessors.y.set = function(value) {
            this._three.position.y = value;
        }, prototypeAccessors.z.get = function() {
            return this._three.position.z;
        }, prototypeAccessors.z.set = function(value) {
            this._three.position.z = value;
        }, prototypeAccessors.scale.get = function() {
            return this._three.scale;
        }, prototypeAccessors.pivot.get = function() {
            return this._pivot;
        }, DisplayObject.prototype.update = function(e) {
            this.updateTransform(), this.updateTask(e);
            for (var c = this._children, i = 0; i < c.length; i++) {
                c[i].update(e);
            }
        }, DisplayObject.prototype.updateBoundingBox = function() {
            this.updateTransform(), this._three.remove(this._sub), _box.setFromObject(this._sub), 
            this._three.add(this._sub), _box.getSize(this._size), this._size.multiply(this.scale);
        }, DisplayObject.prototype.addChild = function(object) {
            return object.parent && object.parent.removeChild(object), this._children.push(object), 
            this._sub.add(object.three), object.three.userData.parent = this, object;
        }, DisplayObject.prototype.removeChild = function(object) {
            if (object.parent === this) {
                var index = this._children.indexOf(object);
                if (-1 !== index) {
                    return this._children.splice(index, 1), this._sub.remove(object.three), object.three.userData.parent = null, 
                    object;
                }
            }
        }, Object.defineProperties(DisplayObject.prototype, prototypeAccessors), DisplayObject;
    }(Emitter), Object3D = function(DisplayObject) {
        function Object3D() {
            DisplayObject.apply(this, arguments);
        }
        DisplayObject && (Object3D.__proto__ = DisplayObject), Object3D.prototype = Object.create(DisplayObject && DisplayObject.prototype), 
        Object3D.prototype.constructor = Object3D;
        var prototypeAccessors = {
            rotation: {
                configurable: !0
            }
        };
        return prototypeAccessors.rotation.get = function() {
            return this._three.rotation;
        }, Object.defineProperties(Object3D.prototype, prototypeAccessors), Object3D;
    }(DisplayObject), Camera = function(Object3D) {
        function Camera(camera, viewport) {
            Object3D.call(this, camera), this._viewport = viewport;
        }
        Object3D && (Camera.__proto__ = Object3D), Camera.prototype = Object.create(Object3D && Object3D.prototype), 
        Camera.prototype.constructor = Camera;
        var prototypeAccessors = {
            camera: {
                configurable: !0
            },
            viewport: {
                configurable: !0
            }
        };
        return prototypeAccessors.camera.get = function() {
            return this._three;
        }, prototypeAccessors.viewport.get = function() {
            return this._viewport;
        }, Camera.prototype.render = function(renderer, scene) {
            renderer.setViewport(this._viewport.x, this._viewport.y, this._viewport.width, this._viewport.height), 
            renderer.render(scene, this._three);
        }, Camera.prototype.updateTransform = function() {}, Camera.prototype.updateBoundingBox = function() {}, 
        Object.defineProperties(Camera.prototype, prototypeAccessors), Camera;
    }(Object3D), Object2D = function(DisplayObject) {
        function Object2D(three) {
            DisplayObject.call(this, three), this._skew = new THREE.Vector2, three.matrixAutoUpdate = !1;
        }
        DisplayObject && (Object2D.__proto__ = DisplayObject), Object2D.prototype = Object.create(DisplayObject && DisplayObject.prototype), 
        Object2D.prototype.constructor = Object2D;
        var prototypeAccessors = {
            skew: {
                configurable: !0
            },
            rotation: {
                configurable: !0
            }
        };
        return prototypeAccessors.skew.get = function() {
            return this._skew;
        }, prototypeAccessors.rotation.get = function() {
            return this._three.rotation.z;
        }, prototypeAccessors.rotation.set = function(value) {
            this._three.rotation.z = value;
        }, Object2D.prototype.updateTransform = function() {
            this._updateMatrix();
        }, Object2D.prototype._updateMatrix = function() {
            var x = this.x, y = this.y, z = this._three.position.z, scaleX = this.scale.x, scaleY = this.scale.y, skewX = this.skew.x, skewY = this.skew.y, rotation = this.rotation, pivotX = this.pivot.x, pivotY = this.pivot.y, a = Math.cos(rotation + skewY) * scaleX, b = Math.sin(rotation + skewY) * scaleX, c = -Math.sin(rotation - skewX) * scaleY, d = Math.cos(rotation - skewX) * scaleY, tx = x - (pivotX * a + pivotY * c), ty = y - (pivotX * b + pivotY * d);
            this._three.matrix.set(a, c, 0, tx, b, d, 0, ty, 0, 0, 1, z, 0, 0, 0, 1);
        }, Object.defineProperties(Object2D.prototype, prototypeAccessors), Object2D;
    }(DisplayObject), Container2D = function(Object2D) {
        function Container2D() {
            Object2D.call(this, new THREE.Group), this._sub = new THREE.Group, this._three.add(this._sub);
        }
        return Object2D && (Container2D.__proto__ = Object2D), Container2D.prototype = Object.create(Object2D && Object2D.prototype), 
        Container2D.prototype.constructor = Container2D, Container2D.prototype._updateOrder = function() {
            for (var c = this._children, i = 0; i < c.length; i++) {
                c[i].three.position.z = 1e-7 * i;
            }
        }, Container2D.prototype.updateTransform = function() {
            this._updateMatrix();
        }, Container2D;
    }(Object2D), Container3D = function(Object3D) {
        function Container3D() {
            Object3D.call(this, new THREE.Group), this._sub = new THREE.Group, this._three.add(this._sub);
        }
        return Object3D && (Container3D.__proto__ = Object3D), Container3D.prototype = Object.create(Object3D && Object3D.prototype), 
        Container3D.prototype.constructor = Container3D, Container3D.prototype.updateTransform = function() {
            this._sub.position.x = -this._pivot.x, this._sub.position.y = -this._pivot.y, this._sub.position.z = -this._pivot.z;
        }, Container3D;
    }(Object3D);
    function resolvePath(path, basepath) {
        return 0 === path.indexOf("http://") || 0 === path.indexOf("https://") || 0 === path.indexOf("//") || 0 === path.indexOf("/") ? path : basepath.replace(/^(.+)\/$/, "$1") + "/" + path;
    }
    function resolveVersion(url, version) {
        return version ? url + (url.match(/\?/) ? "&" : "?") + "_fv=" + version : url;
    }
    function loadTexturesAsync(data, basepath, version) {
        var loader = new THREE.TextureLoader, promises = [], textures = {}, loop = function(i) {
            promises.push(new Promise((function(resolve, reject) {
                var url = resolveVersion(resolvePath(data[i], basepath), version);
                loader.load(url, (function(texture) {
                    textures[i] = texture, resolve();
                }), void 0, (function(e) {
                    reject(e);
                }));
            })));
        };
        for (var i in data) {
            loop(i);
        }
        return Promise.all(promises).then((function() {
            return textures;
        }));
    }
    function loadGLTFsAsync(data, basepath, version) {
        var loader = new GLTFLoader.GLTFLoader, promises = [], models = {}, loop = function(i) {
            promises.push(new Promise((function(resolve, reject) {
                var url = resolveVersion(resolvePath(data[i], basepath), version);
                loader.load(url, (function(model) {
                    models[i] = model, resolve();
                }), void 0, (function(e) {
                    reject(e);
                }));
            })));
        };
        for (var i in data) {
            loop(i);
        }
        return Promise.all(promises).then((function() {
            return models;
        }));
    }
    var _assetLoaders = {}, Content = function() {
        this._assetDefines = {}, this._viewClasses = [], this._vars = {};
    }, prototypeAccessors$5 = {
        viewClasses: {
            configurable: !0
        },
        vars: {
            configurable: !0
        }
    };
    prototypeAccessors$5.viewClasses.get = function() {
        return this._viewClasses;
    }, prototypeAccessors$5.vars.get = function() {
        return Object.assign({}, this._vars);
    }, Content.prototype.defineAssets = function(key, data) {
        for (var i in this._assetDefines[key] = this._assetDefines[key] || {}, data) {
            this._assetDefines[key][i] = data[i];
        }
    }, Content.prototype.defineTextures = function(data) {
        this.defineAssets("textures", data);
    }, Content.prototype.defineGLBs = function(data) {
        this.defineAssets("glbs", data);
    }, Content.prototype.loadAssetsAsync = function(basepath, version) {
        var this$1 = this, promises = [], resources = {}, loop = function(i) {
            i in _assetLoaders && promises.push(_assetLoaders[i](this$1._assetDefines[i], basepath, version).then((function(assets) {
                return resources[i] = assets;
            })));
        };
        for (var i in this$1._assetDefines) {
            loop(i);
        }
        return Promise.all(promises).then((function() {
            return resources;
        }));
    }, Content.prototype.setView = function(viewClass) {
        this._viewClasses.push(viewClass);
    }, Content.prototype.addVars = function(data) {
        for (var i in data) {
            this._vars[i] = data[i];
        }
    }, Content.registerLoader = function(key, delegate) {
        _assetLoaders[key] = delegate;
    }, Object.defineProperties(Content.prototype, prototypeAccessors$5), Content.registerLoader("textures", loadTexturesAsync), 
    Content.registerLoader("glbs", loadGLTFsAsync);
    var Mesh = function(Object3D) {
        function Mesh(geometry, material) {
            Object3D.call(this, new THREE.Mesh(geometry, material)), this._anchor = new Anchor(0, 0, 0, this), 
            material.transparent = !0, this.updateGeometryPosition();
        }
        Object3D && (Mesh.__proto__ = Object3D), Mesh.prototype = Object.create(Object3D && Object3D.prototype), 
        Mesh.prototype.constructor = Mesh;
        var prototypeAccessors = {
            anchor: {
                configurable: !0
            }
        };
        return prototypeAccessors.anchor.get = function() {
            return this._anchor;
        }, Mesh.prototype.updateGeometryPosition = function() {
            this._three.geometry.center(), this.updateBoundingBox(), this._three.geometry.translate(this._size.x * (.5 - this._anchor.x), this._size.y * (.5 - this._anchor.y), this._size.z * (.5 - this._anchor.z));
        }, Mesh.prototype.updateBoundingBox = function() {
            this._three.geometry.computeBoundingBox(), this._three.geometry.boundingBox && this._three.geometry.boundingBox.getSize(this._size), 
            this._size.multiply(this.scale);
        }, Mesh.prototype.updateTransform = function() {}, Object.defineProperties(Mesh.prototype, prototypeAccessors), 
        Mesh;
    }(Object3D), OIMO$1 = OIMO, PhysicsObject3D = function(Object3D) {
        function PhysicsObject3D(three, body) {
            Object3D.call(this, three), this._contantEnabled = !1, this._body = body, this._position = new BodyPosition(this), 
            this._rotation = new BodyRotation(this), body.userData = {}, body.userData.ref = this;
        }
        Object3D && (PhysicsObject3D.__proto__ = Object3D), PhysicsObject3D.prototype = Object.create(Object3D && Object3D.prototype), 
        PhysicsObject3D.prototype.constructor = PhysicsObject3D;
        var prototypeAccessors = {
            body: {
                configurable: !0
            },
            x: {
                configurable: !0
            },
            y: {
                configurable: !0
            },
            z: {
                configurable: !0
            },
            position: {
                configurable: !0
            },
            rotation: {
                configurable: !0
            },
            contactEnabled: {
                configurable: !0
            }
        };
        return prototypeAccessors.body.get = function() {
            return this._body;
        }, prototypeAccessors.x.get = function() {
            return this._position.x;
        }, prototypeAccessors.x.set = function(value) {
            this._position.x = value;
        }, prototypeAccessors.y.get = function() {
            return this._position.y;
        }, prototypeAccessors.y.set = function(value) {
            this._position.y = value;
        }, prototypeAccessors.z.get = function() {
            return this._position.z;
        }, prototypeAccessors.z.set = function(value) {
            this._position.z = value;
        }, prototypeAccessors.position.get = function() {
            return this._position;
        }, prototypeAccessors.rotation.get = function() {
            return this._rotation;
        }, prototypeAccessors.contactEnabled.get = function() {
            return this._contantEnabled;
        }, prototypeAccessors.contactEnabled.set = function(value) {
            var this$1 = this;
            if (this._contantEnabled = value, value) {
                var callback = new OIMO$1.ContactCallback, event = {
                    hit: null,
                    originalEvent: null
                };
                callback.beginContact = function(e) {
                    event.hit = e.getShape2().getRigidBody().userData.ref, event.originalEvent = e, 
                    this$1.emit("beginContact", event);
                }, callback.endContact = function(e) {
                    event.hit = e.getShape2().getRigidBody().userData.ref, event.originalEvent = e, 
                    this$1.emit("endContact", event);
                }, callback.preSolve = function(e) {
                    event.hit = e.getShape2().getRigidBody().userData.ref, event.originalEvent = e, 
                    this$1.emit("preSolve", event);
                }, callback.postSolve = function(e) {
                    event.hit = e.getShape2().getRigidBody().userData.ref, event.originalEvent = e, 
                    this$1.emit("postSolve", event);
                };
                for (var shape = this._body.getShapeList(); shape; ) {
                    shape.setContactCallback(callback), shape = shape.getNext();
                }
            } else {
                for (var shape$1 = this._body.getShapeList(); shape$1; ) {
                    shape$1.setContactCallback(null), shape$1 = shape$1.getNext();
                }
            }
        }, PhysicsObject3D.prototype.updateTransform = function() {
            this._three.position.copy(this._body.getPosition()), this._three.quaternion.copy(this._body.getOrientation());
        }, PhysicsObject3D.prototype.updateBoundingBox = function() {}, Object.defineProperties(PhysicsObject3D.prototype, prototypeAccessors), 
        PhysicsObject3D;
    }(Object3D), View = function(Object3D) {
        function View($) {
            Object3D.call(this, new THREE.Scene), this._cameras = [], this.interactive = !0;
        }
        Object3D && (View.__proto__ = Object3D), View.prototype = Object.create(Object3D && Object3D.prototype), 
        View.prototype.constructor = View;
        var prototypeAccessors = {
            scene: {
                configurable: !0
            }
        };
        return prototypeAccessors.scene.get = function() {
            return this._three;
        }, View.prototype.addCamera = function(camera) {
            return camera.parent && camera.parent.removeChild(camera), this._cameras.push(camera), 
            this._three.add(camera.three), camera.three.userData.parent = this, camera;
        }, View.prototype.removeCamera = function(camera) {
            if (camera.parent === this) {
                var index = this._cameras.indexOf(camera);
                if (-1 !== index) {
                    return this._cameras.splice(index, 1), this._three.remove(camera.three), camera.three.userData.parent = null, 
                    camera;
                }
            }
        }, View.prototype.add = function(three) {
            return this._three.add(three), three;
        }, View.prototype.remove = function(three) {
            return this._three.remove(three), three;
        }, View.prototype.update = function(e) {
            this.updateTask(e);
            var c = this._children;
            for (var i in this._children) {
                c[i].update(e);
            }
        }, View.prototype.render = function(renderer) {
            for (var c = this._cameras, i = 0; i < c.length; i++) {
                renderer.clearDepth(), c[i].render(renderer, this._three);
            }
        }, View.prototype.onInteraction = function(event, raycaster, mouse) {
            var this$1 = this;
            if (this.interactive) {
                for (var c = this._cameras, loop = function(i) {
                    if (event.emitted.length > 0) {
                        return {};
                    }
                    raycaster.setFromCamera(mouse, c[i].camera);
                    for (var f = function(p) {
                        return p.children.map((function(p) {
                            return p instanceof THREE.Mesh ? p : f(p);
                        })).flat();
                    }, meshes = f(this$1._three), intersects = raycaster.intersectObjects(meshes), i$1 = 0; i$1 < intersects.length; i$1++) {
                        if (event.emitted.length > 0) {
                            return;
                        }
                        for (var p = intersects[i$1].object; p !== this$1._three && (p.dispatchEvent(event), 
                        p.parent); ) {
                            p = p.parent;
                        }
                    }
                }, i = 0; i < c.length; i++) {
                    var returned = loop(i);
                    if (returned) {
                        return returned.v;
                    }
                }
            }
        }, View.prototype.updateTransform = function() {}, Object.defineProperties(View.prototype, prototypeAccessors), 
        View;
    }(Object3D), PhysicsView = function(View) {
        function PhysicsView() {
            View.call(this), this.physicsEnabled = !0, this._world = new OIMO$1.World, this._world.setGravity(new OIMO$1.Vec3(0, -9.8, 0));
        }
        View && (PhysicsView.__proto__ = View), PhysicsView.prototype = Object.create(View && View.prototype), 
        PhysicsView.prototype.constructor = PhysicsView;
        var prototypeAccessors = {
            world: {
                configurable: !0
            }
        };
        return prototypeAccessors.world.get = function() {
            return this._world;
        }, PhysicsView.prototype.addChild = function(object) {
            return View.prototype.addChild.call(this, object), this._world.addRigidBody(object.body), 
            object;
        }, PhysicsView.prototype.removeChild = function(object) {
            var o = View.prototype.removeChild.call(this, object);
            if (o) {
                return this._world.removeRigidBody(object.body), o;
            }
        }, PhysicsView.prototype.update = function(e) {
            this.physicsEnabled && this._world.step(1 / 60), this.updateTask(e);
            var c = this._children;
            for (var i in this._children) {
                c[i].update(e);
            }
        }, Object.defineProperties(PhysicsView.prototype, prototypeAccessors), PhysicsView;
    }(View), Sprite = function(Object2D) {
        function Sprite(texture) {
            Object2D.call(this, new THREE.Mesh), this._width = 0, this._height = 0, this._anchor = new Anchor(0, 0, 0, this), 
            this._material = new THREE.MeshBasicMaterial, this._material.transparent = !0, this._three.material = this._material, 
            this._texture = texture, this.texture = texture;
        }
        Object2D && (Sprite.__proto__ = Object2D), Sprite.prototype = Object.create(Object2D && Object2D.prototype), 
        Sprite.prototype.constructor = Sprite;
        var prototypeAccessors = {
            texture: {
                configurable: !0
            },
            anchor: {
                configurable: !0
            }
        };
        return prototypeAccessors.texture.get = function() {
            return this._texture;
        }, prototypeAccessors.texture.set = function(texture) {
            this._texture = texture, this._material.needsUpdate = !0, this._material.map = texture, 
            texture && texture.image ? this._updateGeometry(texture.image.width, texture.image.height) : this._updateGeometry(0, 0);
        }, prototypeAccessors.anchor.get = function() {
            return this._anchor;
        }, Sprite.prototype._updateGeometry = function(width, height) {
            this._three.geometry = new THREE.PlaneGeometry(width, height), this._width = width, 
            this._height = height, this.updateGeometryPosition();
        }, Sprite.prototype.updateGeometryPosition = function() {
            this._three.geometry.center(), this._three.geometry.translate(this._width * (.5 - this._anchor.x), this._height * (.5 - this._anchor.y), 0);
        }, Sprite.prototype.updateBoundingBox = function() {
            this._three.geometry.computeBoundingBox(), this._three.geometry.boundingBox && this._three.geometry.boundingBox.getSize(this._size), 
            this._size.multiply(this.scale);
        }, Sprite.prototype.updateTransform = function() {}, Sprite.from = function(url, callback) {
            var sprite = new Sprite((new THREE.TextureLoader).load(url, (function(texture) {
                sprite.texture = texture, callback && callback(sprite);
            })));
            return sprite;
        }, Object.defineProperties(Sprite.prototype, prototypeAccessors), Sprite;
    }(Object2D);
    exports.Anchor = Anchor, exports.Application = Application, exports.BodyPosition = BodyPosition, 
    exports.BodyRotation = BodyRotation, exports.Camera = Camera, exports.Container2D = Container2D, 
    exports.Container3D = Container3D, exports.Content = Content, exports.DisplayObject = DisplayObject, 
    exports.Mesh = Mesh, exports.Object2D = Object2D, exports.Object3D = Object3D, exports.PhysicsObject3D = PhysicsObject3D, 
    exports.PhysicsView = PhysicsView, exports.Sprite = Sprite, exports.View = View, 
    exports.loadGLTFsAsync = loadGLTFsAsync, exports.loadTexturesAsync = loadTexturesAsync, 
    exports.resolvePath = resolvePath, exports.resolveVersion = resolveVersion;
}(this.TLAP = this.TLAP || {}, THREE, {
    GLTFLoader: THREE.GLTFLoader
});
//# sourceMappingURL=tlap.js.map
