const message = {
    action: "dns_clear_cache"
};

$configuration.sendMessage(message).then(resolve => {
    if (resolve.ret) {
        console.log("dnsCache Cleared!");
        $done({"title": "DNS缓存清除", "htmlMessage": `<b style=\"color: green; font-weight: bold;\">DNS缓存已清除！</b>`});
    } else {
        $done({"title": "DNS缓存清除", "htmlMessage": `<b style=\"color: red; font-weight: bold;\">清除失败！</b>`});
    }
}, reject => {
    $done({"title": "DNS缓存清除", "htmlMessage": `<b style=\"color: red; font-weight: bold;\">清除失败！</b>`});
});