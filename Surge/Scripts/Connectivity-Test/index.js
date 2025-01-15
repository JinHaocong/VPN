let $ = {
    Youtube: 'https://www.youtube.com/',
    Google: 'https://www.google.com/generate_204',
    Github: 'https://www.github.com',
    Apple: 'https://www.apple.com',
    Chatgpt: 'https://chatgpt.com/',
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


    const formatMethod = () => {
        return results.map(result => {
            const [name, time, emoji] = result.split(/\s+/);
            return `${name}\t${time}\t${emoji}`;
        }).join('\n');
    };

    $done({
        title: `连通性测试 | ${hour}:${minutes}`,
        // 选择使用其中一种方法
        content: formatMethod(),
        icon: 'timer',
        'icon-color': '#FF5A9AF9',
    });
})();

function http(req) {
    return new Promise((r) => {
        let time = Date.now();
        let timeout = setTimeout(() => {
            r(formatOutput(req, '>5000', '☠️'));
        }, 5000);

        $httpClient.post($[req], (err, resp, data) => {
            clearTimeout(timeout);
            let responseTime = Date.now() - time;
            let emoji = getEmoji(responseTime);
            r(formatOutput(req, responseTime, emoji));
        });
    });
}

function formatOutput(req, time, emoji) {
    return `${req.padEnd(10, ' ')} ${time.toString().padStart(5, ' ')}ms  ${emoji}`;
}

function getEmoji(time) {
    if (time == 0) return '☠️';
    if (time < 100) return '🚀';
    if (time < 200) return '⚡️';
    if (time < 300) return '🏎️';
    if (time < 400) return '🚅';
    if (time < 500) return '🏃';
    if (time < 1000) return '🚶';
    if (time < 2000) return '🐢';
    if (time < 3000) return '🐌';
    return '☠️';
}