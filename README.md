# gb28181-ptz-cmd
 gb28181 ptz cmd

# 背景

gb28181 PTZ 指令 FI指令

## PTZ 指令

主要包括 
- 镜头变倍指令、
- 云台上下指令、
- 云台左右指令

## FI指令

主要包括 
- 光圈控制
- 聚焦控制

## 预置位指令

## 巡航指令

## 辅助开关控制指令


## 扫描指令


# 主要实现

## 其他
- stop 暂停

## 方向

- left 左
- right 右
- up 上
- down 下
- leftUp 左上
- leftDown 左下
- rightUp 右上
- rightDown 右下

## 镜头
- zoomFar 放大
- zoomNear 缩小

## 光圈
- apertureFar 缩小
- apertureNear 放大

## 聚焦
- focusFar 近
- focusNear 远
## 预设点

- setPos 设置
- calPos 调用
- delPos 删除
