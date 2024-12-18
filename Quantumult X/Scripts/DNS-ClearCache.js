const message = {
    action: "dns_clear_cache"
};

$configuration.sendMessage(message).then(resolve => {
    if (resolve.ret) {
        console.log("dnsCache Cleared!");
        $done({"title": "DNS缓存清除", "htmlMessage": 'DSN缓存已清除！'});
    } else {
        $done({"title": "DNS缓存清除", "htmlMessage": '清除失败！'});
    }
}, reject => {
    $done({"title": "DNS缓存清除", "htmlMessage": '清除失败！'});
});