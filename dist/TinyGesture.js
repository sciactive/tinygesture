export default class TinyGesture {
    constructor(element, options) {
        this.element = element;
        this.touchStartX = null;
        this.touchStartY = null;
        this.touchEndX = null;
        this.touchEndY = null;
        this.touchMoveX = null;
        this.touchMoveY = null;
        this.velocityX = null;
        this.velocityY = null;
        this.longPressTimer = null;
        this.doubleTapTimer = null;
        this.doubleTapWaiting = false;
        this.thresholdX = 0;
        this.thresholdY = 0;
        this.disregardVelocityThresholdX = 0;
        this.disregardVelocityThresholdY = 0;
        this.swipingHorizontal = false;
        this.swipingVertical = false;
        this.swipingDirection = null;
        this.swipedHorizontal = false;
        this.swipedVertical = false;
        this.handlers = {
            panstart: [],
            panmove: [],
            panend: [],
            swipeleft: [],
            swiperight: [],
            swipeup: [],
            swipedown: [],
            tap: [],
            doubletap: [],
            longpress: [],
        };
        this._onTouchStart = this.onTouchStart.bind(this);
        this._onTouchMove = this.onTouchMove.bind(this);
        this._onTouchEnd = this.onTouchEnd.bind(this);
        this.opts = Object.assign({}, TinyGesture.defaults, options);
        this.element.addEventListener('touchstart', this._onTouchStart, passiveIfSupported);
        this.element.addEventListener('touchmove', this._onTouchMove, passiveIfSupported);
        this.element.addEventListener('touchend', this._onTouchEnd, passiveIfSupported);
        if (this.opts.mouseSupport && !('ontouchstart' in window)) {
            this.element.addEventListener('mousedown', this._onTouchStart, passiveIfSupported);
            document.addEventListener('mousemove', this._onTouchMove, passiveIfSupported);
            document.addEventListener('mouseup', this._onTouchEnd, passiveIfSupported);
        }
    }
    destroy() {
        var _a, _b;
        this.element.removeEventListener('touchstart', this._onTouchStart);
        this.element.removeEventListener('touchmove', this._onTouchMove);
        this.element.removeEventListener('touchend', this._onTouchEnd);
        this.element.removeEventListener('mousedown', this._onTouchStart);
        document.removeEventListener('mousemove', this._onTouchMove);
        document.removeEventListener('mouseup', this._onTouchEnd);
        clearTimeout((_a = this.longPressTimer) !== null && _a !== void 0 ? _a : undefined);
        clearTimeout((_b = this.doubleTapTimer) !== null && _b !== void 0 ? _b : undefined);
    }
    on(type, fn) {
        if (this.handlers[type]) {
            this.handlers[type].push(fn);
            return {
                type,
                fn,
                cancel: () => this.off(type, fn),
            };
        }
    }
    off(type, fn) {
        if (this.handlers[type]) {
            const idx = this.handlers[type].indexOf(fn);
            if (idx !== -1) {
                this.handlers[type].splice(idx, 1);
            }
        }
    }
    fire(type, event) {
        for (let i = 0; i < this.handlers[type].length; i++) {
            this.handlers[type][i](event);
        }
    }
    onTouchStart(event) {
        this.thresholdX = this.opts.threshold('x', this);
        this.thresholdY = this.opts.threshold('y', this);
        this.disregardVelocityThresholdX = this.opts.disregardVelocityThreshold('x', this);
        this.disregardVelocityThresholdY = this.opts.disregardVelocityThreshold('y', this);
        this.touchStartX =
            event.type === 'mousedown' ? event.screenX : event.changedTouches[0].screenX;
        this.touchStartY =
            event.type === 'mousedown' ? event.screenY : event.changedTouches[0].screenY;
        this.touchMoveX = null;
        this.touchMoveY = null;
        this.touchEndX = null;
        this.touchEndY = null;
        this.swipingDirection = null;
        this.longPressTimer = setTimeout(() => this.fire('longpress', event), this.opts.longPressTime);
        this.fire('panstart', event);
    }
    onTouchMove(event) {
        var _a, _b, _c, _d, _e;
        if (event.type === 'mousemove' && (!this.touchStartX || this.touchEndX !== null)) {
            return;
        }
        const touchMoveX = (event.type === 'mousemove' ? event.screenX : event.changedTouches[0].screenX) -
            ((_a = this.touchStartX) !== null && _a !== void 0 ? _a : 0);
        this.velocityX = touchMoveX - ((_b = this.touchMoveX) !== null && _b !== void 0 ? _b : 0);
        this.touchMoveX = touchMoveX;
        const touchMoveY = (event.type === 'mousemove' ? event.screenY : event.changedTouches[0].screenY) -
            ((_c = this.touchStartY) !== null && _c !== void 0 ? _c : 0);
        this.velocityY = touchMoveY - ((_d = this.touchMoveY) !== null && _d !== void 0 ? _d : 0);
        this.touchMoveY = touchMoveY;
        const absTouchMoveX = Math.abs(this.touchMoveX);
        const absTouchMoveY = Math.abs(this.touchMoveY);
        this.swipingHorizontal = absTouchMoveX > this.thresholdX;
        this.swipingVertical = absTouchMoveY > this.thresholdY;
        this.swipingDirection =
            absTouchMoveX > absTouchMoveY
                ? this.swipingHorizontal
                    ? 'horizontal'
                    : 'pre-horizontal'
                : this.swipingVertical
                    ? 'vertical'
                    : 'pre-vertical';
        if (Math.max(absTouchMoveX, absTouchMoveY) > this.opts.pressThreshold) {
            clearTimeout((_e = this.longPressTimer) !== null && _e !== void 0 ? _e : undefined);
        }
        this.fire('panmove', event);
    }
    onTouchEnd(event) {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        if (event.type === 'mouseup' && (!this.touchStartX || this.touchEndX !== null)) {
            return;
        }
        this.touchEndX =
            event.type === 'mouseup' ? event.screenX : event.changedTouches[0].screenX;
        this.touchEndY =
            event.type === 'mouseup' ? event.screenY : event.changedTouches[0].screenY;
        this.fire('panend', event);
        clearTimeout((_a = this.longPressTimer) !== null && _a !== void 0 ? _a : undefined);
        const x = this.touchEndX - ((_b = this.touchStartX) !== null && _b !== void 0 ? _b : 0);
        const absX = Math.abs(x);
        const y = this.touchEndY - ((_c = this.touchStartY) !== null && _c !== void 0 ? _c : 0);
        const absY = Math.abs(y);
        if (absX > this.thresholdX || absY > this.thresholdY) {
            this.swipedHorizontal = this.opts.diagonalSwipes
                ? Math.abs(x / y) <= this.opts.diagonalLimit
                : absX >= absY && absX > this.thresholdX;
            this.swipedVertical = this.opts.diagonalSwipes
                ? Math.abs(y / x) <= this.opts.diagonalLimit
                : absY > absX && absY > this.thresholdY;
            if (this.swipedHorizontal) {
                if (x < 0) {
                    if (((_d = this.velocityX) !== null && _d !== void 0 ? _d : 0) < -this.opts.velocityThreshold || x < -this.disregardVelocityThresholdX) {
                        this.fire('swipeleft', event);
                    }
                }
                else {
                    if (((_e = this.velocityX) !== null && _e !== void 0 ? _e : 0) > this.opts.velocityThreshold || x > this.disregardVelocityThresholdX) {
                        this.fire('swiperight', event);
                    }
                }
            }
            if (this.swipedVertical) {
                if (y < 0) {
                    if (((_f = this.velocityY) !== null && _f !== void 0 ? _f : 0) < -this.opts.velocityThreshold || y < -this.disregardVelocityThresholdY) {
                        this.fire('swipeup', event);
                    }
                }
                else {
                    if (((_g = this.velocityY) !== null && _g !== void 0 ? _g : 0) > this.opts.velocityThreshold || y > this.disregardVelocityThresholdY) {
                        this.fire('swipedown', event);
                    }
                }
            }
        }
        else if (absX < this.opts.pressThreshold && absY < this.opts.pressThreshold) {
            if (this.doubleTapWaiting) {
                this.doubleTapWaiting = false;
                clearTimeout((_h = this.doubleTapTimer) !== null && _h !== void 0 ? _h : undefined);
                this.fire('doubletap', event);
            }
            else {
                this.doubleTapWaiting = true;
                this.doubleTapTimer = setTimeout(() => (this.doubleTapWaiting = false), this.opts.doubleTapTime);
                this.fire('tap', event);
            }
        }
    }
}
TinyGesture.defaults = {
    threshold: (type, _self) => Math.max(25, Math.floor(0.15 *
        (type === 'x'
            ? window.innerWidth || document.body.clientWidth
            : window.innerHeight || document.body.clientHeight))),
    velocityThreshold: 10,
    disregardVelocityThreshold: (type, self) => Math.floor(0.5 * (type === 'x' ? self.element.clientWidth : self.element.clientHeight)),
    pressThreshold: 8,
    diagonalSwipes: false,
    diagonalLimit: Math.tan(((45 * 1.5) / 180) * Math.PI),
    longPressTime: 500,
    doubleTapTime: 300,
    mouseSupport: true,
};
let passiveIfSupported = false;
try {
    window.addEventListener('test', null, Object.defineProperty({}, 'passive', {
        get: function () {
            passiveIfSupported = { passive: true };
        },
    }));
}
catch (err) { }
//# sourceMappingURL=TinyGesture.js.map