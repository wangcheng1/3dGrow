import { _decorator, Camera, Component, error, EventTouch, geometry, input, Input, Node, PhysicsSystem, Quat, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Camera2')
export class Camera2 extends Component {
    @property(Camera)
    camera1: any = null;
    start() {
        input.on(Input.EventType.TOUCH_MOVE, this.rotateCamera, this);
        input.on(Input.EventType.TOUCH_START, this.addtest, this);
    }

    update(deltaTime: number) {

    }
    rotateCamera(event: EventTouch) {
        let delta = event.getDelta();
        let speed = 0.002;
        // 水平绕 Y 轴旋转
        let tempQuat = new Quat();
        Quat.rotateAround(tempQuat, this.node.rotation, Vec3.UP, delta.x * speed);
        // 垂直绕 X 轴旋转（注意限制角度范围）
        // Quat.rotateAround(tempQuat, this.node.rotation, Vec3.RIGHT, -delta.y * speed);
        this.node.setRotation(tempQuat);
    }


    addtest(eventMouse: EventTouch) {
        let ray = new geometry.Ray();
        this.camera1.screenPointToRay(eventMouse.getLocationX(), eventMouse.getLocationY(), ray);
        // 以下参数可选
        const mask = 0xffffffff;
        const maxDistance = 10000000;
        const queryTrigger = true;

        if (PhysicsSystem.instance.raycastClosest(ray, mask, maxDistance, queryTrigger)) {
            const raycastClosestResult = PhysicsSystem.instance.raycastClosestResult;
            const hitPoint = raycastClosestResult.hitPoint
            const hitNormal = raycastClosestResult.hitNormal;
            const collider = raycastClosestResult.collider;
            const distance = raycastClosestResult.distance;
            console.error("raycastClosestResult::", raycastClosestResult['_collider'].node.name);
        }


        // const worldRay = new geometry.Ray(0, -1, 0, 0, 1, 0);
        // // 以下参数可选
        // const mask = 0xffffffff;
        // const maxDistance = 10000000;
        // const queryTrigger = true;

        // const bResult = PhysicsSystem.instance.raycast(worldRay, mask, maxDistance, queryTrigger);
        // if (bResult) {
        //     const results = PhysicsSystem.instance.raycastResults;

        //     for (let i = 0; i < results.length; i++) {
        //         const result = results[i];
        //         const collider = result.collider;
        //         const distance = result.distance;
        //         const hitPoint = result.hitPoint;
        //         const hitNormal = result.hitNormal;
        //     }
        //     console.error("result::", result);
        // }
    }
}

