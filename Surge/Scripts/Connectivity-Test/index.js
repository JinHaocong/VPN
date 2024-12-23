let $ = {
    Youtube: 'https://www.youtube.com/',
    Google: 'https://www.google.com/generate_204',
    Github: 'https://www.github.com',
    Apple: 'https://www.apple.com',
    ChatGPT: 'https://chatgpt.com/',
    Claude: 'https://claude.ai/new'
}

!(async () => {
    let results = await Promise.allSettled([
        http('Google'),
        http('Github'),
        http('ChatGPT'),
        http('Claude'),
        http('Youtube'),
        http('Apple'),
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
            r(req +
                '\xa0\xa0\xa0\t: ' +
                (Date.now() - time) + ' ms');
        });
    });
}