const message = {
    action: "dns_clear_cache"
};

$configuration.sendMessage(message).then(resolve => {
    if (resolve.ret) {
        $notify("🗑️ DNS缓存清除成功")
    } else {
        $notify("🗑️ DNS缓存清除失败")
    }
}, reject => {
    $notify("🗑️ DNS缓存清除失败")
});