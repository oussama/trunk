(function () {
    var protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    var url = protocol + '//' + window.location.host + '/_trunk/ws';
    var poll_interval = 5000;
    var reload_upon_connect = () => {
        window.setTimeout(
            () => {
                // when we successfully reconnect, we'll force a
                // reload (since we presumably lost connection to
                // trunk due to it being killed, so it will have
                // rebuilt on restart)
                var ws = new WebSocket(url);
                ws.onopen = () => window.location.reload();
                ws.onclose = reload_upon_connect;
            },
            poll_interval);
    };

    var ws = new WebSocket(url);
    ws.onmessage = (ev) => {
        const msg = JSON.parse(ev.data);
        if (msg.reload) {
            window.location.reload();
        }
    };
    ws.onclose = reload_upon_connect;
    
    
    // Persist inputs data between refreshs
    const REFRESH_DATA_KEY = 'trunk-refresh-data';
    window.onbeforeunload = (e) => {
        localStorage.setItem(REFRESH_DATA_KEY, JSON.stringify(Array.from(document.querySelectorAll('input')).map(it => it.value)));
    };
    let interval = setInterval(() => {
        try {
            const inputs = document.querySelectorAll('input');
            if (inputs.length) {
                clearInterval(interval);
                const values = JSON.parse(localStorage.getItem(REFRESH_DATA_KEY));
                document.querySelectorAll('input').forEach((elm, i) => elm.value = values[i]);
                clearInterval(interval);
            }
        } catch (_) { }
    }, 200);
    
})()
