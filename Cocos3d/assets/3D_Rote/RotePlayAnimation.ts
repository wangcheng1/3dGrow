import { _decorator, Camera, Component, easing, EventTouch, geometry, Input, input, Node, Quat, randomRangeInt, SkeletalAnimation, systemEvent, SystemEventType, tween, Tween, v3, Vec2, Vec3 } from 'cc';
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


    @property(Camera)
    came: Camera = null;


    @property(SkeletalAnimation)
    skeletalAnim: SkeletalAnimation | null = null;


    animList: string[] = [];
    _currentAnim: string = "";

    interval: number = 5;
    _timer: number = 0;
    _lastHitPoint: Vec3 = v3(0, 0, 0);
    deltaQuat: Quat = new Quat();


    private _ray: geometry.Ray = new geometry.Ray();

    start() {
        for (let i = 0; i < this.skeletalAnim.clips.length; i++) {
            this.animList.push(this.skeletalAnim.clips[i].name);
        }
        // input.on(Input.EventType.TOUCH_START, this.onTouchStart, this);
        input.on(Input.EventType.TOUCH_MOVE, this.onTouchMove, this);
        input.on(Input.EventType.TOUCH_END, this.onTouchEnd, this);
        input.on(Input.EventType.TOUCH_CANCEL, this.onTouchEnd, this);


        input.on(Input.EventType.TOUCH_START, (touch: EventTouch) => {
            this._isTouching = true;
            const hitPoint = this.getSphereHitPoint(touch.getLocation());
            if (hitPoint) Vec3.copy(this._lastHitPoint, hitPoint);
        });





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


    // 从屏幕发射射线检测球面碰撞
    private getSphereHitPoint(screenPos: Vec2): Vec3 | null {
        // 通过相机生成射线
        this.came.screenPointToRay(screenPos.x, screenPos.y, this._ray);
        console.error(this._ray);

        // 球体参数（假设球心在原点，半径R）
        const sphereCenter = new Vec3(0, 1, 0);
        const sphereRadius = 2.0;

        // 计算射线与球体的交点 [2,5](@ref)
        const hitPoint = new Vec3();
        const oc = Vec3.subtract(new Vec3(), this._ray.o, sphereCenter);
        console.error("oc::", oc);
        const a = Vec3.dot(this._ray.d, this._ray.d);
        const b = 2.0 * Vec3.dot(oc, this._ray.d);
        const c = Vec3.dot(oc, oc) - sphereRadius * sphereRadius;
        const discriminant = b * b - 4 * a * c;

        if (discriminant >= 0) {
            const t = (-b - Math.sqrt(discriminant)) / (2 * a);
            if (t > 0) {
                Vec3.scaleAndAdd(hitPoint, this._ray.o, this._ray.d, t);
                return hitPoint;
            }
        }
        return null;
    }

    // 计算两点在球面上的旋转轴和角度 [5,9](@ref)
    private calculateRotationDelta(hitPoint1: Vec3, hitPoint2: Vec3): Quat {
        // 归一化向量（球心到碰撞点）
        const v1 = hitPoint1.normalize();
        const v2 = hitPoint2.normalize();

        // 计算旋转轴（叉乘）
        const rotationAxis = new Vec3();
        Vec3.cross(rotationAxis, v1, v2);
        rotationAxis.normalize();

        // 计算旋转角度（点乘反余弦）
        const dot = Vec3.dot(v1, v2);
        const angle = Math.acos(Math.min(Math.max(dot, -1), 1)); // 限制范围避免NaN

        // 返回四元数旋转
        const deltaQuat = new Quat();
        Quat.fromAxisAngle(deltaQuat, rotationAxis, angle);
        return deltaQuat;
    }


    onTouchMove(event: EventTouch) {


        const hitPoint = this.getSphereHitPoint(event.getLocation());
        console.error("hitPoint:::", hitPoint);
        if (!hitPoint || !this._lastHitPoint) return;
        // 计算旋转偏移
        const deltaQuat = this.calculateRotationDelta(this._lastHitPoint, hitPoint);

        // 应用旋转到目标物体
        const currentRot = this.roteNode.getRotation();
        const newQuat = new Quat();

        Quat.multiply(newQuat, deltaQuat, currentRot); // 组合旋转
        this.roteNode.setRotation(newQuat);

        // 更新上一次碰撞点
        Vec3.copy(this._lastHitPoint, hitPoint);

        console.error("deltaQuat::", deltaQuat);
        this.deltaQuat = deltaQuat;
        return;



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
        let num = 20;
        tween(this.roteNode)
            .by(this.inertiaDuration, {
            }, {
                easing: "sineOut", // 使用预设缓动函数[8](@ref)
                onUpdate: (target, ratio: number) => {
                    const currentRot = this.roteNode.getRotation();
                    // console.error("currentRot:::", currentRot)
                    const newQuat = new Quat();
                    const newDetalQuat = new Quat();
                    Quat.multiplyScalar(newDetalQuat, this.deltaQuat, 1);

                    Quat.multiply(newQuat, newDetalQuat, currentRot); // 组合旋转
                    const angle = Quat.angle(currentRot, newQuat) * 180 / Math.PI;
                    // if (Math.abs(angle) < 1) {
                    num--;
                    if (num < 0) {
                        Tween.stopAllByTarget(this.roteNode);
                        return;
                    }

                    // return;
                    // }
                    // 动态衰减惯性速度
                    target.setRotation(newQuat);
                    this.deltaQuat = newDetalQuat;


                    console.error("hheheh:::", this.roteNode.getRotation())
                }
            })
            .call(() => { }) // 清理状态
            .start();


        return



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

