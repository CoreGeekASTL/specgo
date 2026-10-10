# <功能名>

> 功能域：终端登录鉴权　接口数：3　所属 server：外部(HTTPS) + 内部(HTTP)
> 子文档 of [README.md](README.md)

## 1. 定位

终端登录鉴权与浏览器预开。同一组 3 个路径经 externalServer（HTTPS）与 innerServer（HTTP）双暴露。

## 2. 接口清单

| 接口名 | 作用 | 所在文件 | 方法/路径 |
|---|---|---|---|
| GridLoginAuth | 网格登录鉴权 | controllers/exlogin_controller.go | POST /app-api/devicetcp/app/login/v1/gridLoginAuth |
| GridLoginAuthOpenBrowser | 登录鉴权并预开浏览器 | controllers/exlogin_controller.go | POST /app-api/devicetcp/app/login/v1/gridLoginAuthOpenBrowser |
| DeviceLoginAuth | 设备登录鉴权 | controllers/exlogin_controller.go | POST /app-api/devicetcp/app/login/v1/deviceLoginAuth |

## 3. 数据结构说明

对应接口清单逐个说明请求与响应数据结构：

- **GridLoginAuth / GridLoginAuthOpenBrowser / DeviceLoginAuth**
  - 请求 `req.LoginAuthRequest`（models/req/login.go）：IMEI（15 位纯数字，必填）；IMSI（15 位纯数字，必填）；Manufacturer；Model
  - 响应 `resp.LoginInfo`（models/resp/login.go）：Token；ExpireAt；BrowserEndpoint
  - DeviceLoginAuth 经由沐恩云服务二次鉴权（service/remote_service.go）
