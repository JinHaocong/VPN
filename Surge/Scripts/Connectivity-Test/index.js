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

    const formatMethod = () => {
        // 格式化每一行
        const formattedResults = results.map(result => {
            const [name, time, emoji] = result.split(/\s+/);
            return `${name.padEnd(10, '\u2007')} \t ${time.padEnd(5, '\u2007')} \t ${emoji}`;
        });

        // 返回所有行，用换行符连接
        return formattedResults.join('\n');
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
        $httpClient.post($[req], (err, resp, data) => {
            let responseTime = Date.now() - time;
            let emoji = getEmoji(responseTime);
            r(formatOutput(req, responseTime, emoji));
        });
    });
}

function formatOutput(req, time, emoji) {
    return `${req} ${time.toString()}ms ${emoji}`;
}

function getEmoji(time) {
    if (time === 0) return '☠️';
    if (time < 100) return '🚀';
    if (time < 200) return '⚡️';
    if (time < 300) return '🏎️';
    if (time < 400) return '🚅';
    if (time < 500) return '🐢';
    if (time < 1000) return '🐌';
    return '☠️';
}