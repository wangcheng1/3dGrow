import { _decorator, Camera, Component, error, EventTouch, geometry, input, Input, math, Node, PhysicsSystem, Quat, RigidBody, v3, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Camera2')
export class Camera2 extends Component {
    @property(Camera)
    camera1: Camera = null;
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


        // const worldPoint = new Vec3();
        // const touchLocation = eventMouse.getLocation();
        // this.camera1.screenToWorld(v3(touchLocation.x, touchLocation.y, 0), worldPoint);
        // console.error('射线起点:', worldPoint);
        //    console.error('射线起点:', ray.o.toString());
        // return;
        // // 创建射线对象
        // const ray = new geometry.Ray();

        // //   设置射线的起点为屏幕点击的世界坐标
        // ray.o.set(worldPoint);

        // // 设置射线的方向为-y轴（世界空间）
        // ray.d.set(0, -1, 0);




        // // 归一化方向向量
        // ray.d.normalize();

        console.error('射线起点:', ray.o.toString());
        console.error('射线方向:', ray.d.toString());


        const mask = 0xffffffff;
        const maxDistance = 10000000;
        const queryTrigger = true;

        // 以下参数可选

        if (PhysicsSystem.instance.raycastClosest(ray, mask, maxDistance, queryTrigger)) {
            const raycastClosestResult = PhysicsSystem.instance.raycastClosestResult;
            const hitPoint = raycastClosestResult.hitPoint
            const hitNormal = raycastClosestResult.hitNormal;
            const collider = raycastClosestResult.collider;
            const distance = raycastClosestResult.distance;
            console.error("raycastClosestResult::", raycastClosestResult['_collider'].node.name);

            // 获取碰撞物体的RigidBody组件（用于施加力）
            const rigidBody = collider.node.getComponent(RigidBody);
            if (rigidBody) {


       
                const forceMagnitude = 100;
                // 计算最终的力向量（方向×大小）
                // 计算力方向：射线方向 * 力大小
                const forceDir = new Vec3(ray.d.x, ray.d.y, ray.d.z).multiplyScalar(forceMagnitude);

                // 在碰撞点施加力
                rigidBody.applyForce(forceDir, hitPoint);

            }



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

