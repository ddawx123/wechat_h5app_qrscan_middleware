const xhr = {
    /**
     * 构造HTTP异步请求
     * @param config 配置集合
     * @returns callback
     */
    request: function (config) {
        let url = typeof(config.url) !== 'undefined' ? config.url : '';
        let method = typeof(config.method) !== 'undefined' ? config.method.toUpperCase() : '';
        let data = typeof(config.data) !== 'undefined' ? config.data : null;
        if (method === 'GET') data = null;
        let username = typeof(config.username) !== 'undefined' ? config.username : '';
        let password = typeof(config.password) !== 'undefined' ? config.password : '';
        if (url === '' || method === '') {
            console.error('Invalid request config.');
            return null;
        }
        let xmlHttpRequest = new XMLHttpRequest();
        if (username !== '' || password !== '') {
            xmlHttpRequest.open(method, url, true, username, password);
        } else {
            xmlHttpRequest.open(method, url, true);
        }
        xmlHttpRequest.onreadystatechange = function () {
            switch (xmlHttpRequest.readyState) {
                case 0:
                    // Nothing implement
                    break;
                case 1:
                    // Nothing implement
                    break;
                case 2:
                    if (typeof(config.beforeSend) !== 'undefined') config.beforeSend();
                    break;
                case 3:
                    // Nothing implement
                    break;
                case 4:
                    if (typeof(config.afterResponse) !== 'undefined') {
                        try {
                            let response = JSON.parse(xmlHttpRequest.responseText);
                            config.afterResponse(response);
                        } catch (e) {
                            console.log(e);
                            config.afterResponse(xmlHttpRequest.responseText);
                        }
                    }
                    break;
                default:
                    console.log('Not implement ready state for xhr component, please check your browser version.');
                    break;
            }
        }
        if (typeof(config.headers) !== 'undefined') {
            config.headers.map((header) => {
                xmlHttpRequest.setRequestHeader(header.key, header.val);
            });
        }
        if (typeof(config.withCredentials) !== 'undefined') xmlHttpRequest.withCredentials = config.withCredentials;
        switch (typeof(data)) {
            case 'object':
                data = JSON.stringify(data);
                xmlHttpRequest.send(data);
                break;
            case 'string':
                xmlHttpRequest.send(data);
                break;
            case 'number':
                xmlHttpRequest.send(data);
                break;
            case 'undefined':
                xmlHttpRequest.send();
                break;
            default:
                console.log('Not supported data format: ', typeof(data));
                xmlHttpRequest.send();
                break;
        }

    }
};
