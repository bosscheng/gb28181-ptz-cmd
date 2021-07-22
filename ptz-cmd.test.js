import {getPTZCmd, PTZ_TYPE} from "./ptz-cmd.js";


const cmd = getPTZCmd({
    type: PTZ_TYPE.leftDown
})
console.log(cmd); // A50F01067D7D00B5,A50F01067D7D00B5
