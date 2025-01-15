let $ = {
    Youtube: 'https://www.youtube.com/',
    Google: 'https://www.google.com/generate_204',
    Github: 'https://www.github.com',
    Apple: 'https://www.apple.com',
    ChatGPT: 'https://chatgpt.com/',
    Claude: 'https://claude.ai/new',
    Netflix: 'https://www.netflix.com/',
}

!(async () => {
    let results = await Promise.allSettled([
        http('Google'),
        http('Github'),
        http('Netflix'),
        http('ChatGPT'),
        http('Claude'),
        http('Apple'),
        http('Youtube'),
    ])
        .then(results => results.map(result => result.value));

    let now = new Date();
    let hour = now.getHours();
    let minutes = now.getMinutes();
    hour = hour > 9 ? hour : "0" + hour;
    minutes = minutes > 9 ? minutes : "0" + minutes;

    $done({
        title: `连通性测试 | ${hour}:${minutes}`,
        content: results.join('\n'),
        icon: 'timer',
        'icon-color': '#FF5A9AF9',
    })
})();

function http(req) {
    return new Promise((r) => {
        let time = Date.now();
        $httpClient.post($[req], (err, resp, data) => {
            let responseTime = Date.now() - time;
            let emoji = getEmoji(responseTime);
            let status = getStatus(responseTime);
            r(`${emoji.padEnd(3)} ${req.padEnd(8)} ${responseTime.toString().padStart(4)} ms  ${status.padEnd(4)}`);
        });
    });
}

function getEmoji(time) {
    if (time < 50) return '🚀';
    if (time < 100) return '⚡️';
    if (time < 200) return '🏎️';
    if (time < 300) return '🚅';
    if (time < 500) return '🏃';
    if (time < 750) return '🚶';
    if (time < 1000) return '🐕';
    if (time < 1500) return '🐢';
    if (time < 2000) return '🐌';
    return '☠️';
}

function getStatus(time) {
    if (time < 50) return '极速';
    if (time < 100) return '非常快';
    if (time < 200) return '快速';
    if (time < 300) return '高速';
    if (time < 500) return '较快';
    if (time < 750) return '正常';
    if (time < 1000) return '较慢';
    if (time < 1500) return '慢';
    if (time < 2000) return '很慢';
    return '超时';
}