import { _decorator, Component, Node, SkeletalAnimation } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('AnimnalComponent')
export class AnimnalComponent extends Component {
    @property(SkeletalAnimation)
    sa: SkeletalAnimation = null;

    start() {
        this.sa.play("Idle");
        // this.scheduleOnce(() => {
        //     this.sa.crossFade("Tpose");
        // }, 2)
        // 
    }

    update(deltaTime: number) {

    }
}

