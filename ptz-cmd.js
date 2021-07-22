/**
 * Date:2020/11/2
 * Desc: ptz cmd 封装
 * cmd[0] //首字节以05H开头
 * cmd[1] //组合码，高4位为版本信息v1.0,版本信息0H，低四位为校验码
 *        //  校验码 = (cmd[0]的高4位+cmd[0]的低4位+cmd[1]的高4位)%16
 * cmd[2] //地址的低8位？？？什么地址，地址范围000h ~ FFFh(0~4095),其中000h为广播地址
 * cmd[3] //指令码
 * cmd[4] //数据1,水平控制速度、聚焦速度
 * cmd[5] //数据2，垂直控制速度、光圈速度
 * cmd[6] // 高4位为数据3=变倍控制速度，低4位为地址高4位
 */

// 所以对一个内存地址，也就是8位二进制，如：0000 0001，0000就是高四位，0001就是低四位，

const PTZ_TYPE = {
    stop: 'stop',
    right: 'right',
    left: 'left',
    up: 'up',
    down: 'down',
    leftUp: 'leftUp',
    leftDown: 'leftDown',
    rightUp: 'rightUp',
    rightDown: 'rightDown',
    zoomFar: 'zoomFar',
    zoomNear: 'zoomNear',
    apertureFar: 'apertureFar',
    apertureNear: 'apertureNear',
    focusFar: 'focusFar',
    focusNear: 'focusNear',
    setPos: 'setPos',
    calPos: 'calPos',
    delPos: 'delPos',
    wiperOpen: 'wiperOpen',
    wiperClose: 'wiperClose'
};

const PTZ_CMD_TYPE = {
    stop: 0x00,

    right: 0x01, // 0000 0001
    left: 0x02,// 0000 0010
    up: 0x08, // 0000 1000
    down: 0x04,// 0000 0100

    leftUp: 0x0A, // 0000 1010
    leftDown: 0x06,// 0000 0110
    rightUp: 0x09, // 0000 1001
    rightDown: 0x05, // 0000 0101

    zoomFar: 0x10, // 镜头 放大
    zoomNear: 0x20,  // 镜头 缩小

    apertureFar: 0x48, // 光圈 缩小 //
    apertureNear: 0x44, // 光圈 放大

    focusFar: 0x42, // 聚焦 近
    focusNear: 0x41, // 聚焦 远

    setPos: 0x81, // 设置预设点
    calPos: 0x82, // 调用预设点
    delPos: 0x83, // 删除预设点

    wiperOpen: 0x8C, // 雨刷开
    wiperClose: 0x8D, // 雨刷关
};

// 0x19 :00011001
// 0x32 :00110010
// 0x4b :01001011
// 0x64 :01100100
// 0xFA :11111010
// 速度范围： 为00H~FFH
const SPEED_ARRAY = [0x19, 0x32, 0x4b, 0x64, 0x7d, 0x96, 0xAF, 0xC8, 0xE1, 0xFA];

// 0x01 :000000001
// 0x02 :000000010
// 0x03 :000000011
//
// 0x10 :000010000
// 预置位范围：01H~FFH
const POSITION_ARRAY = [0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09, 0x10];
// 0H~FH; 低四位地址是高四位0000
// 1,3,5,7,9,10,a,c,d,f
const ZOOM_ARRAY = [0x10, 0x30, 0x50, 0x70, 0x90, 0xA0, 0xB0, 0xC0, 0xd0, 0xe0];

// 获取 direction 方向型
/**
 *
 * @param options
 *        type:
 *        speed:default 5
 *        index:
 * @returns {string}
 */
function getPTZCmd(options) {
    const {type, speed, index} = options;
    const ptzSpeed = getPTZSpeed(speed);
    let indexValue3, indexValue4, indexValue5, indexValue6;
    // 第四个字节。
    indexValue3 = PTZ_CMD_TYPE[type];
    switch (type) {
        case PTZ_TYPE.up:
        case PTZ_TYPE.down:
            // 字节6 垂直控制速度相对值
            indexValue5 = ptzSpeed;
            // 字节7 地址高四位ob0000_0000
            // indexValue6 = 0x00;
            break;
        case PTZ_TYPE.apertureFar:
        case PTZ_TYPE.apertureNear:
            // 字节6 光圈速度
            indexValue5 = ptzSpeed;
            // 字节7 地址高四位ob0000_0000
            // indexValue6 = 0x00;
            break;
        case PTZ_TYPE.right:
        case PTZ_TYPE.left:
            // 字节5 水平控制速度相对值
            indexValue4 = ptzSpeed;
            // 字节7 地址高四位ob0000_0000
            // indexValue6 = 0x00;
            break;
        case PTZ_TYPE.focusFar:
        case PTZ_TYPE.focusNear:
            // 字节5 聚焦速度
            indexValue4 = ptzSpeed;
            // 字节7 地址高四位ob0000_0000
            // indexValue6 = 0x00;
            break;
        case PTZ_TYPE.leftUp:
        case PTZ_TYPE.leftDown:
        case PTZ_TYPE.rightUp:
        case PTZ_TYPE.rightDown:
            // 字节5 水平控制速度相对值
            indexValue4 = ptzSpeed;
            // 字节6 垂直控制速度相对值
            indexValue5 = ptzSpeed;
            // 字节7 地址高四位ob0000_0000
            // indexValue6 = 0x00;
            break;
        case PTZ_TYPE.zoomFar:
        case PTZ_TYPE.zoomNear:
            // 字节7 镜头变倍控制速度相对值 zoom
            indexValue6 = getZoomSpeed(speed);
            break;
        case PTZ_TYPE.calPos:
        case PTZ_TYPE.delPos:
        case PTZ_TYPE.setPos:
            // 第五个字节 00H
            // indexValue4 = 0x00;
            // 字节6 01H~FFH 位置。
            indexValue5 = getPTZPositionIndex(index);
            break;
        case PTZ_TYPE.wiperClose:
        case PTZ_TYPE.wiperOpen:
            // 字节5为辅助开关编号,取值为“1”表示雨刷控制。
            indexValue4 = 0x01
            break;
        default:
            break;
    }
    return ptzCmdToString(indexValue3, indexValue4, indexValue5, indexValue6);
}

function getPTZSpeed(speed) {
    speed = speed || 5;
    const speedIndex = speed - 1;
    const ptzSpeed = SPEED_ARRAY[speedIndex] || SPEED_ARRAY[4];
    return ptzSpeed;
}

function getZoomSpeed(speed) {
    speed = speed || 5;
    const speedIndex = speed - 1;
    const ptzSpeed = ZOOM_ARRAY[speedIndex] || ZOOM_ARRAY[4];
    return ptzSpeed;
}


function getPTZPositionIndex(index) {
    return POSITION_ARRAY[index - 1];
}

function ptzCmdToString(indexValue3, indexValue4, indexValue5, indexValue6) {
    //
    let cmd = Buffer.alloc(8);
    // 首字节以05H开头
    cmd[0] = 0xA5;
    // 组合码，高4位为版本信息v1.0,版本信息0H，低四位为校验码
    cmd[1] = 0x0F;
    // 校验码 = (cmd[0]的高4位+cmd[0]的低4位+cmd[1]的高4位)%16
    cmd[2] = 0x01;
    //
    if (indexValue3) {
        cmd[3] = indexValue3;
    }
    if (indexValue4) {
        cmd[4] = indexValue4;
    }
    if (indexValue5) {
        cmd[5] = indexValue5;
    }
    if (indexValue6) {
        cmd[6] = indexValue6;
    }

    cmd[7] = (cmd[0] + cmd[1] + cmd[2] + cmd[3] + cmd[4] + cmd[5] + cmd[6]) % 256;

    return bytes2HexString(cmd);
}

function bytes2HexString(byte) {
    let hexs = "";
    for (let i = 0; i < byte.length; i++) {
        let hex = (byte[i]).toString(16);
        if (hex.length === 1) {
            hex = '0' + hex;
        }
        hexs += hex.toUpperCase();
    }
    return hexs;
}

export {
    getPTZCmd,
    PTZ_TYPE
}
