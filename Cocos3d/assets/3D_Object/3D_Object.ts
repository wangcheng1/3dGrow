import { _decorator, clamp, clamp01, Color, Component, EventTouch, geometry, MeshRenderer, Node, PointLight, Quat, v3, Vec2, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('3D_Object')
export class threeD_Object extends Component {
    @property(Node)
    testNode: Node = null;

    @property(Node)
    guadianNode: Node = null;


    @property(MeshRenderer)
    mrList: MeshRenderer[] = [];

    start() {

        // const lightNode = new Node('PointLight');

        // // 2. 添加点光源组件并配置参数
        // const pointLight = lightNode.addComponent(PointLight);
        // pointLight.color = Color.fromHexString('#FFA500'); // 光源颜色（橙色）
        // pointLight.intensity = 500;                        // 光照强度
        // pointLight.range = 10;                             // 光照范围
        // pointLight.position = new Vec3(0, 5, 0);           // 光源位置

        // // 3. 将光源节点添加到场景中
        // this.node.scene.addChild(lightNode);




        console.log(this.node.getChildByPath("highPoly_female/high_poly_girl"));

        let v33 = v3(0, 0, 1);
        console.log(v33.equals(v3(0, 0, 1)));
        console.log(v33.equals(v3(0, 0, 0.89), 0.1));
        // lerp  当前向量 与目标向量的差值，0.1
        console.log(v33.lerp(v3(1, 1, 1), 0.1));
        console.log(v3(1, 1, 1).lerp(v33, 0.1));

        console.log(v3(1, 2, 3).add(v3(1, 1, 1))); //2,3,4

        console.log(clamp01(1.1)) //0~1 之间
        console.log(clamp(-0.2, -0.1, 1)); //-0.1

        console.log(v3(1, 2, 3).dot(v3(1, 2, 3)))//14 x*x1+y*y1+z*z2  大于0 锐角， 方向相同，等于0 垂直， 小于0方向相反 ，返回a 在b向量 投影长度


        console.log(v3(1, 2, 3).cross(v3(4, 5, 6))) //叉乘  求法线获得一个向量 垂直于这两个向量 
        //  a × b = ( (2×6 - 3×5), (3×4 - 1×6), (1×5 - 2×4) )
        //  = (12-15, （12-6), 5-8)
        // = (-3, 6, -3)

        console.log(v3(-3, 6, -3).dot(v3(4, 5, 6)));

        console.log(v3(2, 2, 2).normalize()); //单位向量

        // 两点之间距离
        console.log(v3(3, 4, 5).subtract(v3(1, 2, 3)).length());

        // this.testNode.rotation=

        let out = new Quat();

        const axis = new Vec3(0, 1, 0); // Y轴（需归一化）
        const angle = - Math.PI / 2;
        const currentRot = this.node.getRotation();
        Quat.rotateAround(out, currentRot, axis, angle); // axis 为旋转轴向量

        // console.error("out::", out);
        // this.testNode.setRotation(out);
        let progress: number = 0;
        this.schedule((dt: any) => {
            console.error(dt)
            progress += Number(dt) / 1;
            if (progress >= 1) {
                this.testNode.setRotation(out);
                this.unscheduleAllCallbacks();
                return;
            }

            const newRot = new Quat();
            Quat.slerp(newRot, currentRot, out, progress);
            this.testNode.setRotation(newRot);

        }, 0.1);


        this.mrList[0].priority = 1;
        this.mrList[1].priority = 0;
        this.guadianNode.setScale(v3(0.1, 0.1, 0.1));
    }



    // lookAtTarget(targetPos: Vec3) {
    //     let currentPos = this.testNode.worldPosition;
    //     // 计算指向目标的方向向量
    //     let dir = new Vec3();
    //     Vec3.subtract(dir, targetPos, currentPos).normalize();
    //     // 生成目标旋转四元数
    //     Quat.fromViewUp(targetRot, dir, Vec3.UP);
    //     // 使用 Slerp 平滑过渡
    //     Quat.slerp(currentRot, node.rotation, targetRot, 0.1);
    //     node.setRotation(currentRot);
    // }



    update(deltaTime: number) {

    }
}

