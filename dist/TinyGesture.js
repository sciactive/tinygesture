class TinyGesture {
    constructor(element, options) {
        this.element = element;
        this.touch1 = null;
        this.touch2 = null;
        this.touchStartX = null;
        this.touchStartY = null;
        this.touchEndX = null;
        this.touchEndY = null;
        this.touchMove1 = null;
        this.touchMove2 = null;
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
        this.originalDistance = null;
        this.newDistance = null;
        this.scale = null;
        this.originalAngle = null;
        this.newAngle = null;
        this.rotation = null;
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
            pinch: [],
            pinchend: [],
            rotate: [],
            rotateend: [],
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
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0, _1;
        let didTouch1 = false;
        let didTouch2 = false;
        if (event.type !== 'mousedown') {
            if (!this.touch1) {
                this.touch1 = event.changedTouches[0];
                didTouch1 = true;
            }
            if (((didTouch1 && event.changedTouches.length > 1) || !didTouch1) && !this.touch2) {
                this.touch2 =
                    [...event.changedTouches].find((touch) => { var _a; return touch.identifier !== ((_a = this.touch1) === null || _a === void 0 ? void 0 : _a.identifier); }) ||
                        null;
                this.originalDistance = Math.sqrt(Math.pow(((_b = (_a = this.touch2) === null || _a === void 0 ? void 0 : _a.screenX) !== null && _b !== void 0 ? _b : 0) - ((_f = (_d = (_c = this.touchMove1) === null || _c === void 0 ? void 0 : _c.screenX) !== null && _d !== void 0 ? _d : (_e = this.touch1) === null || _e === void 0 ? void 0 : _e.screenX) !== null && _f !== void 0 ? _f : 0), 2) +
                    Math.pow(((_h = (_g = this.touch2) === null || _g === void 0 ? void 0 : _g.screenY) !== null && _h !== void 0 ? _h : 0) - ((_m = (_k = (_j = this.touchMove1) === null || _j === void 0 ? void 0 : _j.screenY) !== null && _k !== void 0 ? _k : (_l = this.touch1) === null || _l === void 0 ? void 0 : _l.screenY) !== null && _m !== void 0 ? _m : 0), 2));
                this.originalAngle =
                    Math.atan2(((_p = (_o = this.touch2) === null || _o === void 0 ? void 0 : _o.screenY) !== null && _p !== void 0 ? _p : 0) - ((_t = (_r = (_q = this.touchMove1) === null || _q === void 0 ? void 0 : _q.screenY) !== null && _r !== void 0 ? _r : (_s = this.touch1) === null || _s === void 0 ? void 0 : _s.screenY) !== null && _t !== void 0 ? _t : 0), ((_v = (_u = this.touch2) === null || _u === void 0 ? void 0 : _u.screenX) !== null && _v !== void 0 ? _v : 0) - ((_z = (_x = (_w = this.touchMove1) === null || _w === void 0 ? void 0 : _w.screenX) !== null && _x !== void 0 ? _x : (_y = this.touch1) === null || _y === void 0 ? void 0 : _y.screenX) !== null && _z !== void 0 ? _z : 0)) /
                        (Math.PI / 180);
                return;
            }
            if (!didTouch1 && !didTouch2) {
                return;
            }
        }
        if (didTouch1 || event.type === 'mousedown') {
            this.thresholdX = this.opts.threshold('x', this);
            this.thresholdY = this.opts.threshold('y', this);
            this.disregardVelocityThresholdX = this.opts.disregardVelocityThreshold('x', this);
            this.disregardVelocityThresholdY = this.opts.disregardVelocityThreshold('y', this);
            this.touchStartX = event.type === 'mousedown' ? event.screenX : ((_0 = this.touch1) === null || _0 === void 0 ? void 0 : _0.screenX) || 0;
            this.touchStartY = event.type === 'mousedown' ? event.screenY : ((_1 = this.touch1) === null || _1 === void 0 ? void 0 : _1.screenY) || 0;
            this.touchMoveX = null;
            this.touchMoveY = null;
            this.touchEndX = null;
            this.touchEndY = null;
            this.swipingDirection = null;
            this.longPressTimer = setTimeout(() => this.fire('longpress', event), this.opts.longPressTime);
            this.scale = 1;
            this.rotation = 0;
            this.fire('panstart', event);
        }
    }
    onTouchMove(event) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o;
        if (event.type === 'mousemove' && (!this.touchStartX || this.touchEndX !== null)) {
            return;
        }
        let touch1 = undefined;
        let touch2 = undefined;
        if (event.type !== 'mousemove') {
            touch1 = [...event.changedTouches].find((touch) => { var _a; return touch.identifier === ((_a = this.touch1) === null || _a === void 0 ? void 0 : _a.identifier); });
            this.touchMove1 = touch1 || this.touchMove1;
            touch2 = [...event.changedTouches].find((touch) => { var _a; return touch.identifier === ((_a = this.touch2) === null || _a === void 0 ? void 0 : _a.identifier); });
            this.touchMove2 = touch2 || this.touchMove2;
        }
        if (event.type === 'mousemove' || touch1) {
            const touchMoveX = (event.type === 'mousemove' ? event.screenX : (_a = touch1 === null || touch1 === void 0 ? void 0 : touch1.screenX) !== null && _a !== void 0 ? _a : 0) - ((_b = this.touchStartX) !== null && _b !== void 0 ? _b : 0);
            this.velocityX = touchMoveX - ((_c = this.touchMoveX) !== null && _c !== void 0 ? _c : 0);
            this.touchMoveX = touchMoveX;
            const touchMoveY = (event.type === 'mousemove' ? event.screenY : (_d = touch1 === null || touch1 === void 0 ? void 0 : touch1.screenY) !== null && _d !== void 0 ? _d : 0) - ((_e = this.touchStartY) !== null && _e !== void 0 ? _e : 0);
            this.velocityY = touchMoveY - ((_f = this.touchMoveY) !== null && _f !== void 0 ? _f : 0);
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
                clearTimeout((_g = this.longPressTimer) !== null && _g !== void 0 ? _g : undefined);
            }
            this.fire('panmove', event);
        }
        if (event.type !== 'mousemove' && this.touchMove1 != null && this.touchMove2 != null) {
            this.newDistance = Math.sqrt(Math.pow(this.touchMove2.screenX - this.touchMove1.screenX, 2) +
                Math.pow(this.touchMove2.screenY - this.touchMove1.screenY, 2));
            this.scale = this.newDistance / ((_h = this.originalDistance) !== null && _h !== void 0 ? _h : 0);
            this.fire('pinch', event);
            this.newAngle =
                Math.atan2(((_j = this.touchMove2.screenY) !== null && _j !== void 0 ? _j : 0) - ((_k = this.touchMove1.screenY) !== null && _k !== void 0 ? _k : 0), ((_l = this.touchMove2.screenX) !== null && _l !== void 0 ? _l : 0) - ((_m = this.touchMove1.screenX) !== null && _m !== void 0 ? _m : 0)) /
                    (Math.PI / 180);
            this.rotation = this.newAngle - ((_o = this.originalAngle) !== null && _o !== void 0 ? _o : 0);
            this.fire('rotate', event);
        }
    }
    onTouchEnd(event) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
        let touch1 = undefined;
        if (event.type !== 'mouseup') {
            touch1 = [...event.changedTouches].find((touch) => { var _a; return touch.identifier === ((_a = this.touch1) === null || _a === void 0 ? void 0 : _a.identifier); });
            if (![...event.touches].find((touch) => { var _a; return touch.identifier === ((_a = this.touch1) === null || _a === void 0 ? void 0 : _a.identifier); })) {
                this.touch1 = null;
                this.touchMove1 = null;
            }
            if (![...event.touches].find((touch) => { var _a; return touch.identifier === ((_a = this.touch2) === null || _a === void 0 ? void 0 : _a.identifier); })) {
                this.touch2 = null;
                this.touchMove2 = null;
            }
        }
        if (event.type === 'mouseup' && (!this.touchStartX || this.touchEndX !== null)) {
            return;
        }
        if (event.type === 'mouseup' || touch1) {
            this.touchEndX = event.type === 'mouseup' ? event.screenX : (_a = touch1 === null || touch1 === void 0 ? void 0 : touch1.screenX) !== null && _a !== void 0 ? _a : 0;
            this.touchEndY = event.type === 'mouseup' ? event.screenY : (_b = touch1 === null || touch1 === void 0 ? void 0 : touch1.screenY) !== null && _b !== void 0 ? _b : 0;
            this.fire('panend', event);
            clearTimeout((_c = this.longPressTimer) !== null && _c !== void 0 ? _c : undefined);
            const x = this.touchEndX - ((_d = this.touchStartX) !== null && _d !== void 0 ? _d : 0);
            const absX = Math.abs(x);
            const y = this.touchEndY - ((_e = this.touchStartY) !== null && _e !== void 0 ? _e : 0);
            const absY = Math.abs(y);
            const distance = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
            const absDistance = Math.abs(distance);
            const diagonal = absY / absX;
            if (absX > this.thresholdX ||
                absY > this.thresholdY ||
                (this.opts.diagonalSwipes && (absDistance > this.thresholdX || absDistance > this.thresholdY))) {
                this.swipedHorizontal = absX > this.thresholdX || (this.opts.diagonalSwipes && absDistance > this.thresholdX);
                this.swipedVertical = absY > this.thresholdY || (this.opts.diagonalSwipes && absDistance > this.thresholdY);
                if (!this.opts.diagonalSwipes ||
                    diagonal < Math.tan(((45 - this.opts.diagonalLimit) * Math.PI) / 180) ||
                    diagonal > Math.tan(((45 + this.opts.diagonalLimit) * Math.PI) / 180)) {
                    if (absX >= absY) {
                        this.swipedVertical = false;
                    }
                    if (absY > absX) {
                        this.swipedHorizontal = false;
                    }
                }
                if (this.swipedHorizontal) {
                    if (x < 0) {
                        if (((_f = this.velocityX) !== null && _f !== void 0 ? _f : 0) < -this.opts.velocityThreshold || distance < -this.disregardVelocityThresholdX) {
                            this.fire('swipeleft', event);
                        }
                    }
                    else {
                        if (((_g = this.velocityX) !== null && _g !== void 0 ? _g : 0) > this.opts.velocityThreshold || distance > this.disregardVelocityThresholdX) {
                            this.fire('swiperight', event);
                        }
                    }
                }
                if (this.swipedVertical) {
                    if (y < 0) {
                        if (((_h = this.velocityY) !== null && _h !== void 0 ? _h : 0) < -this.opts.velocityThreshold || distance < -this.disregardVelocityThresholdY) {
                            this.fire('swipeup', event);
                        }
                    }
                    else {
                        if (((_j = this.velocityY) !== null && _j !== void 0 ? _j : 0) > this.opts.velocityThreshold || distance > this.disregardVelocityThresholdY) {
                            this.fire('swipedown', event);
                        }
                    }
                }
            }
            else if (absX < this.opts.pressThreshold && absY < this.opts.pressThreshold) {
                if (this.doubleTapWaiting) {
                    this.doubleTapWaiting = false;
                    clearTimeout((_k = this.doubleTapTimer) !== null && _k !== void 0 ? _k : undefined);
                    this.fire('doubletap', event);
                }
                else {
                    this.doubleTapWaiting = true;
                    this.doubleTapTimer = setTimeout(() => (this.doubleTapWaiting = false), this.opts.doubleTapTime);
                    this.fire('tap', event);
                }
            }
        }
        if (!this.touch1 && !this.touch2) {
            this.fire('pinchend', event);
            this.fire('rotateend', event);
            this.originalDistance = null;
            this.newDistance = null;
            this.scale = null;
            this.originalAngle = null;
            this.newAngle = null;
            this.rotation = null;
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
    diagonalLimit: 15,
    longPressTime: 500,
    doubleTapTime: 300,
    mouseSupport: true,
};
export default TinyGesture;
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