/**
 * 微信内网页处理
 * @return mixed
 */
function initWeChat() {
    if (navigator.userAgent.toLowerCase().indexOf(WECHAT_UA) === -1) {
        swal({
            title: '不支持的客户端',
            text: '目前仅支持移动端微信、钉钉内访问此应用！',
            type: 'error',
            showCancelButton: false,
            showConfirmButton: true,
            confirmButtonText: '好'
        }, function () {
            window.close();
        });
        return;
    }
    xhr.request({
        url: 'https://api.dscitech.com/api/wxJsSignature',
        method: 'POST',
        data: prepData,
        headers: [{
            key: 'Content-Type',
            val: 'application/json'
        }, {
            key: 'Cache-Control',
            val: 'no-cache'
        }],
        withCredentials: true,
        beforeSend: function () {
            console.log('Loading data by network request.');
            swal({
                title: '请稍候',
                text: '正在加载扫码组件',
                imageUrl: 'img/loading.gif',
                showCancelButton: false,
                showConfirmButton: false
            })
        },
        afterResponse: function (res) {
            if (typeof(res.code) === 'undefined' || res.code !== 200) {
                swal({
                    title: '未获得扫码权限',
                    text: '微信JSAPI后端异常\r\n' + res.msg,
                    type: 'error',
                    showCancelButton: false,
                    showConfirmButton: true,
                    confirmButtonText: '返回'
                }, function () {
                    if (typeof(WeixinJSBridge) !== 'undefined') {
                        WeixinJSBridge.call("closeWindow");
                    } else {
                        console.log('非微信内部浏览容器，跳过调用私有API');
                        window.close();
                    }
                });
            } else {
                // 开始注入微信JSAPI特性配置
                wx.config({
                    debug: debugMode,
                    appId: 'wx9d02b81c997dc938',
                    timestamp: prepData.timeStamp,
                    nonceStr: prepData.nonceStr,
                    signature: res.data.js_sign,
                    jsApiList: ["checkJsApi", "onMenuShareTimeline", "onMenuShareAppMessage", "onMenuShareQQ", "onMenuShareWeibo", "onMenuShareQZone", "hideMenuItems", "showMenuItems", "hideAllNonBaseMenuItem", "showAllNonBaseMenuItem", "translateVoice", "startRecord", "stopRecord", "onVoiceRecordEnd", "playVoice", "onVoicePlayEnd", "pauseVoice", "stopVoice", "uploadVoice", "downloadVoice", "chooseImage", "previewImage", "uploadImage", "downloadImage", "getNetworkType", "openLocation", "getLocation", "hideOptionMenu", "showOptionMenu", "closeWindow", "scanQRCode", "chooseWXPay", "openProductSpecificView", "addCard", "chooseCard", "openCard"],
                    openTagList: ['wx-open-launch-weapp']
                });
                // 开始注册各类Hybrid应用事件
                wx.ready(function () {
                    wx.hideOptionMenu();
                    wx.hideAllNonBaseMenuItem();
                    wx.scanQRCode({
                        needResult: 1,
                        scanType: ['qrCode', 'barCode'],
                        success: function (res) {
                            procScanResult(res.resultStr, function () {
                                wx.closeWindow();
                            });
                        },
                        fail: function (e) {
                            console.log(e);
                            swal({
                                title: '扫码时出错',
                                text: '扫码失败，请重试\r\n' + e.errMsg,
                                type: 'error',
                                showCancelButton: false,
                                showConfirmButton: true,
                                confirmButtonText: '返回'
                            }, function () {
                                wx.closeWindow();
                            });
                        },
                        cancel: function () {
                            swal({
                                title: '扫码取消',
                                text: '客户端已取消扫码',
                                type: 'info',
                                showCancelButton: true,
                                showConfirmButton: true,
                                confirmButtonText: '重新扫码',
                                cancelButtonText: '返回'
                            }, function (e) {
                                if (e) {
                                    initWeChat();
                                } else {
                                    wx.closeWindow();
                                }
                            });
                        }
                    });
                });
                wx.error(function () {
                    swal({
                        title: '启动扫码时出错',
                        text: '微信JSAPI权限注入失败，暂无法调用客户端扫码能力。',
                        type: 'error',
                        showCancelButton: false,
                        showConfirmButton: true,
                        confirmButtonText: '返回'
                    }, function () {
                        if (typeof(WeixinJSBridge) !== 'undefined') {
                            WeixinJSBridge.call("closeWindow");
                        } else {
                            console.log('非微信内部浏览容器，跳过调用私有API');
                            window.close();
                        }
                    });
                });
            }
        }
    });
}

/**
 * 钉钉内网页处理
 * @return mixed
 */
function initDingTalk() {
    if (dd.env.platform === 'notInDingTalk') {
        swal({
            title: '不支持的客户端',
            text: '目前仅支持移动端微信、钉钉内访问此应用！',
            type: 'error',
            showCancelButton: false,
            showConfirmButton: true,
            confirmButtonText: '好'
        }, function () {
            window.close();
        });
        return;
    }
    dd.ready(function() {
        dd.biz.navigation.setRight({ show: false, control: true });
        dd.biz.navigation.setLeft({ text: "Back" });
        dd.biz.util.scan({
            type: "all",
            onSuccess: function (r) {
                procScanResult(r.text, function () {
                    dd.biz.navigation.close();
                });
            },
            onFail: function (e) {
                // 处理iOS设备与Android设备错误码差异
                // iOS：-1，为字符串返回，Android：10，为整形返回，此处已作分类处理
                if (parseInt(e.errorCode) === 10 || parseInt(e.errorCode) === -1) {
                    swal({
                        title: '扫码取消',
                        text: '客户端已取消扫码',
                        type: 'info',
                        showCancelButton: false,
                        showConfirmButton: true,
                        confirmButtonText: '返回'
                    }, function () {
                        dd.biz.navigation.close();
                    });
                } else {
                    swal({
                        title: '扫码异常',
                        text: '扫码时出错，客户端返回的错误信息已附加至调试日志。',
                        type: 'warning',
                        showCancelButton: false,
                        showConfirmButton: true,
                        confirmButtonText: '返回'
                    }, function () {
                        console.log(e);
                    });
                }
            }
        });
    });
}
/**
 * 处理扫码结果
 * @param result
 * @param callback
 * @return mixed
 */
function procScanResult(result, callback = {}) {
    if (result.indexOf('https://sxbuszp.com/station/') >= 0) { // 命中绍兴公交
        let stationId = result.split('https://sxbuszp.com/station/')[1];
        top.location.replace('http://city.dscitech.com/#/bus/detail?regionId=330600&stationId=' + stationId);
    } else if (result.indexOf('https://appactive.ibuscloud.com/') >= 0) { // 命中杭州公交
        let stationInfo = result.split('cn=')[1].split('&c=');
        top.location.replace('http://city.dscitech.com/#/bus/detail?regionId=' + stationInfo[1] + '&stationId=' + stationInfo[0]);
    } else if (result.indexOf('https://api.dscitech.com/api/v2/iot/OneThingOneCode') >= 0) { // 命中一物一码
        let codeData = {
            unionCodeId: result.split('unionCodeId=')[1].split('&codeScene=')[0],
            businessCode: result.split('businessCode=')[1]
        };
        console.log(codeData);
        swal({
            title: '访问限制',
            text: '一物一码服务暂未开放，敬请期待！',
            type: 'error',
            showCancelButton: false,
            showConfirmButton: true,
            confirmButtonText: '返回'
        }, function () {
            callback();
        });
    } else if (result.indexOf('alipays://') >= 0 || result.indexOf('https://qr.alipay.com/') >= 0) {
        console.log(result);
        swal({
            title: '温馨提示',
            text: '您可能扫描了支付宝专用码，目前此工具限制所有Alipay-Schema类型的业务请求！请前往阿里系平台（钉钉以及浙大钉、浙政钉等专有钉钉除外）扫码进入。',
            type: 'error',
            showCancelButton: false,
            showConfirmButton: true,
            confirmButtonText: '返回'
        }, function () {
            callback();
        });
    } else {
        console.log(result);
        swal({
            title: '发现未适配码',
            text: '中间件暂未适配当前扫码内容，请访问开放平台查看对接信息。',
            type: 'warning',
            showCancelButton: false,
            showConfirmButton: true,
            confirmButtonText: '返回'
        }, function () {
            callback();
        });
    }
}
