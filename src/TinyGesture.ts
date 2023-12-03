/**
 * TinyGesture.js
 *
 * This service uses passive listeners, so you can't call event.preventDefault()
 * on any of the events.
 *
 * Adapted from https://gist.github.com/SleepWalker/da5636b1abcbaff48c4d
 * and https://github.com/uxitten/xwiper
 * plus a bunch more of my own code.
 */
export default class TinyGesture<Element extends HTMLElement = HTMLElement> {
  public opts: Options<Element>;
  public touch1: Touch | null = null;
  public touch2: Touch | null = null;
  public touchStartX: number | null = null;
  public touchStartY: number | null = null;
  public touchEndX: number | null = null;
  public touchEndY: number | null = null;
  public touchMove1: Touch | null = null;
  public touchMove2: Touch | null = null;
  public touchMoveX: number | null = null;
  public touchMoveY: number | null = null;
  public velocityX: number | null = null;
  public velocityY: number | null = null;

  public longPressTimer: number | null = null;
  public doubleTapTimer: number | null = null;

  public doubleTapWaiting: boolean = false;
  public thresholdX: number = 0;
  public thresholdY: number = 0;
  public disregardVelocityThresholdX: number = 0;
  public disregardVelocityThresholdY: number = 0;

  public swipingHorizontal: boolean = false;
  public swipingVertical: boolean = false;
  public swipingDirection: SwipingDirection | null = null;
  public swipedHorizontal: boolean = false;
  public swipedVertical: boolean = false;

  public originalDistance: number | null = null;
  public newDistance: number | null = null;
  public scale: number | null = null;

  public originalAngle: number | null = null;
  public newAngle: number | null = null;
  public rotation: number | null = null;

  public handlers: Handlers = {
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

  private _onTouchStart: (typeof this)['onTouchStart'] = this.onTouchStart.bind(this);
  private _onTouchMove: (typeof this)['onTouchMove'] = this.onTouchMove.bind(this);
  private _onTouchEnd: (typeof this)['onTouchEnd'] = this.onTouchEnd.bind(this);

  constructor(
    public element: Element,
    options?: Partial<Options<Element>>,
  ) {
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
    this.element.removeEventListener('touchstart', this._onTouchStart);
    this.element.removeEventListener('touchmove', this._onTouchMove);
    this.element.removeEventListener('touchend', this._onTouchEnd);
    this.element.removeEventListener('mousedown', this._onTouchStart);
    document.removeEventListener('mousemove', this._onTouchMove);
    document.removeEventListener('mouseup', this._onTouchEnd);
    clearTimeout(this.longPressTimer ?? undefined);
    clearTimeout(this.doubleTapTimer ?? undefined);
  }

  on<E extends keyof Events>(type: E, fn: Handler<Events[E]>) {
    if (this.handlers[type]) {
      this.handlers[type].push(fn);
      return {
        type,
        fn,
        cancel: () => this.off(type, fn),
      };
    }
  }

  off<E extends keyof Events>(type: E, fn: Handler<Events[E]>) {
    if (this.handlers[type]) {
      const idx = this.handlers[type].indexOf(fn);
      if (idx !== -1) {
        this.handlers[type].splice(idx, 1);
      }
    }
  }

  fire<E extends keyof Events>(type: E, event: Events[E]) {
    for (let i = 0; i < this.handlers[type].length; i++) {
      this.handlers[type][i](event);
    }
  }

  onTouchStart(event: MouseEvent | TouchEvent) {
    let didTouch1 = false;
    let didTouch2 = false;
    if (event.type !== 'mousedown') {
      if (!this.touch1) {
        this.touch1 = (event as TouchEvent).changedTouches[0];
        didTouch1 = true;
      }
      if (((didTouch1 && (event as TouchEvent).changedTouches.length > 1) || !didTouch1) && !this.touch2) {
        this.touch2 =
          [...(event as TouchEvent).changedTouches].find((touch) => touch.identifier !== this.touch1?.identifier) ||
          null;
        this.originalDistance = Math.sqrt(
          Math.pow((this.touch2?.screenX ?? 0) - (this.touchMove1?.screenX ?? this.touch1?.screenX ?? 0), 2) +
            Math.pow((this.touch2?.screenY ?? 0) - (this.touchMove1?.screenY ?? this.touch1?.screenY ?? 0), 2),
        );
        this.originalAngle =
          Math.atan2(
            (this.touch2?.screenY ?? 0) - (this.touchMove1?.screenY ?? this.touch1?.screenY ?? 0),
            (this.touch2?.screenX ?? 0) - (this.touchMove1?.screenX ?? this.touch1?.screenX ?? 0),
          ) /
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
      this.touchStartX = event.type === 'mousedown' ? (event as MouseEvent).screenX : this.touch1?.screenX || 0;
      this.touchStartY = event.type === 'mousedown' ? (event as MouseEvent).screenY : this.touch1?.screenY || 0;
      this.touchMoveX = null;
      this.touchMoveY = null;
      this.touchEndX = null;
      this.touchEndY = null;
      this.swipingDirection = null;
      // Long press.
      this.longPressTimer = setTimeout(() => this.fire('longpress', event), this.opts.longPressTime);
      this.scale = 1;
      this.rotation = 0;
      this.fire('panstart', event);
    }
  }

  onTouchMove(event: MouseEvent | TouchEvent) {
    if (event.type === 'mousemove' && (!this.touchStartX || this.touchEndX !== null)) {
      return;
    }

    let touch1: Touch | undefined = undefined;
    let touch2: Touch | undefined = undefined;
    if (event.type !== 'mousemove') {
      touch1 = [...(event as TouchEvent).changedTouches].find((touch) => touch.identifier === this.touch1?.identifier);
      this.touchMove1 = touch1 || this.touchMove1;
      touch2 = [...(event as TouchEvent).changedTouches].find((touch) => touch.identifier === this.touch2?.identifier);
      this.touchMove2 = touch2 || this.touchMove2;
    }

    if (event.type === 'mousemove' || touch1) {
      const touchMoveX =
        (event.type === 'mousemove' ? (event as MouseEvent).screenX : touch1?.screenX ?? 0) - (this.touchStartX ?? 0);
      this.velocityX = touchMoveX - (this.touchMoveX ?? 0);
      this.touchMoveX = touchMoveX;
      const touchMoveY =
        (event.type === 'mousemove' ? (event as MouseEvent).screenY : touch1?.screenY ?? 0) - (this.touchStartY ?? 0);
      this.velocityY = touchMoveY - (this.touchMoveY ?? 0);
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
        clearTimeout(this.longPressTimer ?? undefined);
      }
      this.fire('panmove', event);
    }

    if (event.type !== 'mousemove' && this.touchMove1 != null && this.touchMove2 != null) {
      this.newDistance = Math.sqrt(
        Math.pow(this.touchMove2.screenX - this.touchMove1.screenX, 2) +
          Math.pow(this.touchMove2.screenY - this.touchMove1.screenY, 2),
      );
      this.scale = this.newDistance / (this.originalDistance ?? 0);
      this.fire('pinch', event as TouchEvent);

      this.newAngle =
        Math.atan2(
          (this.touchMove2.screenY ?? 0) - (this.touchMove1.screenY ?? 0),
          (this.touchMove2.screenX ?? 0) - (this.touchMove1.screenX ?? 0),
        ) /
        (Math.PI / 180);
      this.rotation = this.newAngle - (this.originalAngle ?? 0);
      this.fire('rotate', event as TouchEvent);
    }
  }

  onTouchEnd(event: MouseEvent | TouchEvent) {
    let touch1: Touch | undefined = undefined;
    if (event.type !== 'mouseup') {
      touch1 = [...(event as TouchEvent).changedTouches].find((touch) => touch.identifier === this.touch1?.identifier);
      if (![...(event as TouchEvent).touches].find((touch) => touch.identifier === this.touch1?.identifier)) {
        this.touch1 = null;
        this.touchMove1 = null;
      }
      if (![...(event as TouchEvent).touches].find((touch) => touch.identifier === this.touch2?.identifier)) {
        this.touch2 = null;
        this.touchMove2 = null;
      }
    }

    if (event.type === 'mouseup' && (!this.touchStartX || this.touchEndX !== null)) {
      return;
    }

    if (event.type === 'mouseup' || touch1) {
      this.touchEndX = event.type === 'mouseup' ? (event as MouseEvent).screenX : touch1?.screenX ?? 0;
      this.touchEndY = event.type === 'mouseup' ? (event as MouseEvent).screenY : touch1?.screenY ?? 0;
      this.fire('panend', event);
      clearTimeout(this.longPressTimer ?? undefined);

      const x = this.touchEndX - (this.touchStartX ?? 0);
      const absX = Math.abs(x);
      const y = this.touchEndY - (this.touchStartY ?? 0);
      const absY = Math.abs(y);
      const distance = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
      const absDistance = Math.abs(distance);
      const diagonal = absY / absX;

      if (
        absX > this.thresholdX ||
        absY > this.thresholdY ||
        (this.opts.diagonalSwipes && (absDistance > this.thresholdX || absDistance > this.thresholdY))
      ) {
        this.swipedHorizontal = absX > this.thresholdX || (this.opts.diagonalSwipes && absDistance > this.thresholdX);
        this.swipedVertical = absY > this.thresholdY || (this.opts.diagonalSwipes && absDistance > this.thresholdY);
        if (
          !this.opts.diagonalSwipes ||
          diagonal < Math.tan(((45 - this.opts.diagonalLimit) * Math.PI) / 180) ||
          diagonal > Math.tan(((45 + this.opts.diagonalLimit) * Math.PI) / 180)
        ) {
          if (absX >= absY) {
            this.swipedVertical = false;
          }
          if (absY > absX) {
            this.swipedHorizontal = false;
          }
        }
        if (this.swipedHorizontal) {
          if (x < 0) {
            // Left swipe.
            if ((this.velocityX ?? 0) < -this.opts.velocityThreshold || distance < -this.disregardVelocityThresholdX) {
              this.fire('swipeleft', event);
            }
          } else {
            // Right swipe.
            if ((this.velocityX ?? 0) > this.opts.velocityThreshold || distance > this.disregardVelocityThresholdX) {
              this.fire('swiperight', event);
            }
          }
        }
        if (this.swipedVertical) {
          if (y < 0) {
            // Upward swipe.
            if ((this.velocityY ?? 0) < -this.opts.velocityThreshold || distance < -this.disregardVelocityThresholdY) {
              this.fire('swipeup', event);
            }
          } else {
            // Downward swipe.
            if ((this.velocityY ?? 0) > this.opts.velocityThreshold || distance > this.disregardVelocityThresholdY) {
              this.fire('swipedown', event);
            }
          }
        }
      } else if (absX < this.opts.pressThreshold && absY < this.opts.pressThreshold) {
        // Tap.
        if (this.doubleTapWaiting) {
          this.doubleTapWaiting = false;
          clearTimeout(this.doubleTapTimer ?? undefined);
          this.fire('doubletap', event);
        } else {
          this.doubleTapWaiting = true;
          this.doubleTapTimer = setTimeout(() => (this.doubleTapWaiting = false), this.opts.doubleTapTime);
          this.fire('tap', event);
        }
      }
    }

    if (!this.touch1 && !this.touch2) {
      this.fire('pinchend', event as TouchEvent);
      this.fire('rotateend', event as TouchEvent);

      this.originalDistance = null;
      this.newDistance = null;
      this.scale = null;
      this.originalAngle = null;
      this.newAngle = null;
      this.rotation = null;
    }
  }

  static defaults: Options<HTMLElement> = {
    threshold: (type, _self) =>
      Math.max(
        25,
        Math.floor(
          0.15 *
            (type === 'x'
              ? window.innerWidth || document.body.clientWidth
              : window.innerHeight || document.body.clientHeight),
        ),
      ),
    velocityThreshold: 10,
    disregardVelocityThreshold: (type, self: TinyGesture) =>
      Math.floor(0.5 * (type === 'x' ? self.element.clientWidth : self.element.clientHeight)),
    pressThreshold: 8,
    diagonalSwipes: false,
    diagonalLimit: 15,
    longPressTime: 500,
    doubleTapTime: 300,
    mouseSupport: true,
  };
}

export interface Options<Element extends HTMLElement = HTMLElement> {
  diagonalLimit: number;
  diagonalSwipes: boolean;
  doubleTapTime: number;
  disregardVelocityThreshold(type: 'x' | 'y', self: TinyGesture<Element>): number;
  longPressTime: number;
  mouseSupport: boolean;
  pressThreshold: number;
  threshold(type: 'x' | 'y', self: TinyGesture<Element>): number;
  velocityThreshold: number;
}

export interface Events {
  doubletap: MouseEvent | TouchEvent;
  longpress: MouseEvent | TouchEvent;
  panend: MouseEvent | TouchEvent;
  panmove: MouseEvent | TouchEvent;
  panstart: MouseEvent | TouchEvent;
  swipedown: MouseEvent | TouchEvent;
  swipeleft: MouseEvent | TouchEvent;
  swiperight: MouseEvent | TouchEvent;
  swipeup: MouseEvent | TouchEvent;
  tap: MouseEvent | TouchEvent;
  pinch: TouchEvent;
  pinchend: TouchEvent;
  rotate: TouchEvent;
  rotateend: TouchEvent;
}

export type Handler<E> = (event: E) => void;
export type Handlers = {
  [E in keyof Events]: Handler<Events[E]>[];
};

export type SwipingDirection = 'horizontal' | 'pre-horizontal' | 'vertical' | 'pre-vertical';

// Passive feature detection.
let passiveIfSupported: false | { passive: true } = false;

try {
  window.addEventListener(
    'test',
    null as any,
    Object.defineProperty({}, 'passive', {
      get: function () {
        passiveIfSupported = { passive: true };
      },
    }),
  );
} catch (err) {}
