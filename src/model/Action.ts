import { EActionType } from "./EActionType";

export class Action {
    type: EActionType;
    data: Record<string, any>;

    constructor(type: EActionType, data: Record<string, any>) {
        this.type = type;
        this.data = data;
    }
}
