const clearDNSCache = () => {
  const message = { action: "dns_clear_cache" };

  $configuration.sendMessage(message)
    .then(({ ret }) => {
      const title = "🗑️ DNS缓存清除";
      const status = ret ? "已清除" : "清除失败";
      const htmlMessage = `<p style="color: ${ret ? 'green' : 'red'}; font-weight: bold;">DNS缓存${status}！</p>`;

      $notify(`🗑️ DNS缓存${status}！`);
      $done({ title, htmlMessage });
    })
    .catch(() => {
      const title = "🗑️ DNS缓存清除";
      const htmlMessage = '<p style="color: red; font-weight: bold;">DNS缓存清除失败！</p>';

      $notify("🗑️ DNS缓存清除失败");
      $done({ title, htmlMessage });
    });
};

clearDNSCache();