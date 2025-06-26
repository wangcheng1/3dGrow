import { _decorator, Component, easing, EventTouch, Input, input, Node, Quat, randomRangeInt, SkeletalAnimation, tween, Tween, v3, Vec2, Vec3 } from 'cc';
import { Quad } from 'puppeteer';
const { ccclass, property } = _decorator;

@ccclass('RotePlayAnimation')
export class RotePlayAnimation extends Component {

    @property({ type: Number })
    public rotateSpeed: number = 0.03; // 旋转速度系数

    @property({ type: Number })
    public inertiaDuration: number = 5; // 惯性持续时间（秒）

    // public easingType: easing.TweenEasing = "sineOut";
    private _isTouching: boolean = false;
    private _startTouchPos: Vec2 = new Vec2();
    private _currentRotation: Quat = new Quat();
    private _inertiaVelocity: number = 0; // 惯性旋转速度

    @property(Node)
    roteNode: Node = null;


    @property(SkeletalAnimation)
    skeletalAnim: SkeletalAnimation | null = null;


    animList: string[] = [];
    _currentAnim: string = "";

    interval: number = 5;
    _timer: number = 0;

    start() {
        for (let i = 0; i < this.skeletalAnim.clips.length; i++) {
            this.animList.push(this.skeletalAnim.clips[i].name);
        }
        input.on(Input.EventType.TOUCH_START, this.onTouchStart, this);
        input.on(Input.EventType.TOUCH_MOVE, this.onTouchMove, this);
        input.on(Input.EventType.TOUCH_END, this.onTouchEnd, this);
        input.on(Input.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
        // this._currentRotation.y = 0;
        // this.schedule(() => {
        //     this._currentRotation.y += 1;
        //     this.roteNode.setRotationFromEuler(v3(0, this._currentRotation.y, 0));
        // }, 0.1)
    }

    onTouchStart(event: EventTouch) {
        this._isTouching = true;
        this._inertiaVelocity = 0; // 停止当前惯性
        Tween.stopAllByTarget(this.roteNode);
        event.getStartLocation(this._startTouchPos);
    }

    onTouchMove(event: EventTouch) {

        if (!this._isTouching) return;

        const currentPos = new Vec2();
        event.getLocation(currentPos);

        // 计算滑动方向与速度
        const deltaX = currentPos.x - this._startTouchPos.x;




        this._startTouchPos.set(currentPos); // 更新起点
        this._inertiaVelocity = deltaX; // 记录速度用于惯性

        // // 应用旋转（Y轴旋转控制左右转向）
        // this._currentRotation = this.node.getRotation();
        // this._currentRotation.y += rotationDelta;
        // this.roteNode.setRotationFromEuler(v3(0, this._currentRotation.y, 0));


        let tempQuat = new Quat();
        Quat.rotateAround(tempQuat, this.roteNode.rotation, Vec3.UP, deltaX * ((2 * Math.PI) / (1280)));
        // // 垂直绕 X 轴旋转（注意限制角度范围）
        // // Quat.rotateAround(tempQuat, this.node.rotation, Vec3.RIGHT, -delta.y * speed);
        this.roteNode.setRotation(tempQuat);


    }


    onTouchEnd() {
        this._isTouching = false;
        if (Math.abs(this._inertiaVelocity) < 0.1) return;

        tween(this.roteNode)
            .by(this.inertiaDuration, {
            }, {
                easing: "sineOut", // 使用预设缓动函数[8](@ref)
                onUpdate: (target, ratio: number) => {
                    if (Math.abs(this._inertiaVelocity) < 0.1) {
                        Tween.stopAllByTarget(this.roteNode);
                        return;
                    }
                    // 动态衰减惯性速度
                    this._inertiaVelocity *= 0.95;

                    let tempQuat = new Quat();
                    Quat.rotateAround(tempQuat, this.roteNode.rotation, Vec3.UP, this._inertiaVelocity * ((2 * Math.PI) / (1280)));
                    // // 垂直绕 X 轴旋转（注意限制角度范围）
                    // // Quat.rotateAround(tempQuat, this.node.rotation, Vec3.RIGHT, -delta.y * speed);
                    target.setRotation(tempQuat);
                }
            })
            .call(() => this._inertiaVelocity = 0) // 清理状态
            .start();
    }

    update(deltaTime: number) {
        if (this.interval <= 0) return;
        this._timer += deltaTime;
        if (this._timer >= this.interval) {
            this.playRandomAnim();
            this._timer = 0;
        }
    }


    playRandomAnim() {
        const anims = this.animList.filter(anim => anim !== this._currentAnim);
        const nextAnim = anims[randomRangeInt(0, anims.length)] || this.animList[0];

        if (this._currentAnim) {
            this.skeletalAnim?.crossFade(nextAnim, 0.3);
        } else {
            this.skeletalAnim?.play(nextAnim);
        }
        this._currentAnim = nextAnim;
    }
}

