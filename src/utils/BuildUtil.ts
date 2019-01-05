export class BuildUtil {

    public static async build(opt: BuildOption) {

    }

    private static publish(opt: BuildOption) {

    }
}
export interface BuildOption {
    /**
     * 类型，build、publish
     */
    type: string;
    /**
     * 目标，nightly、wxgame
     */
    target: string;
    /**
     * 项目名（目录）
     */
    project: string;
}

