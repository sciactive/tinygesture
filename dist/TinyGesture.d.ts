export default class TinyGesture<Element extends HTMLElement = HTMLElement> {
    element: Element;
    opts: Options<Element>;
    touchStartX: number | null;
    touchStartY: number | null;
    touchEndX: number | null;
    touchEndY: number | null;
    touchMoveX: number | null;
    touchMoveY: number | null;
    velocityX: number | null;
    velocityY: number | null;
    longPressTimer: number | null;
    doubleTapTimer: number | null;
    doubleTapWaiting: boolean;
    thresholdX: number;
    thresholdY: number;
    disregardVelocityThresholdX: number;
    disregardVelocityThresholdY: number;
    swipingHorizontal: boolean;
    swipingVertical: boolean;
    swipingDirection: SwipingDirection | null;
    swipedHorizontal: boolean;
    swipedVertical: boolean;
    handlers: Handlers;
    private _onTouchStart;
    private _onTouchMove;
    private _onTouchEnd;
    constructor(element: Element, options?: Partial<Options<Element>>);
    destroy(): void;
    on<E extends keyof Events>(type: E, fn: Handler<Events[E]>): {
        type: E;
        fn: Handler<Events[E]>;
        cancel: () => void;
    } | undefined;
    off<E extends keyof Events>(type: E, fn: Handler<Events[E]>): void;
    fire<E extends keyof Events>(type: E, event: Events[E]): void;
    onTouchStart(event: MouseEvent | TouchEvent): void;
    onTouchMove(event: MouseEvent | TouchEvent): void;
    onTouchEnd(event: MouseEvent | TouchEvent): void;
    static defaults: Options<HTMLElement>;
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
}
export declare type Handler<E> = (event: E) => void;
export declare type Handlers = {
    [E in keyof Events]: Handler<Events[E]>[];
};
export declare type SwipingDirection = 'horizontal' | 'pre-horizontal' | 'vertical' | 'pre-vertical';
