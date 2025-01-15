/*
 * 由@mieqq编写
 * 原脚本地址：https://raw.githubusercontent.com/mieqq/mieqq/master/sub_info_panel.js
 * 由@Rabbit-Spec修改
 * 更新日期：2022.08.24
 * 版本：1.5

示例↓↓↓
----------------------------------------

[Script]
Sub_info = type=generic,timeout=10,script-path=https://raw.githubusercontent.com/mieqq/mieqq/master/sub_info_panel.js,script-update-interval=0,argument=url=[URL encode 后的机场节点链接]&reset_day=1&title=Nexitally&icon=externaldrive.fill.badge.icloud&color=#007aff

[Panel]
Sub_info = script-name=Sub_info,update-interval=600

----------------------------------------

（实在不会可以用这个捷径生成panel和脚本，https://www.icloud.com/shortcuts/3f24df391d594a73abd04ebdccd92584）*

必填参数"url=xxx"机场链接（无需编码，原链接即可）。

可选参数 &reset_day，后面的数字替换成流量每月重置的日期，如1号就写1，8号就写8。如"&reset_day=8",不加该参数不显示流量重置信息。

可选参数 &expire，机场链接不带expire信息的，可以手动传入expire参数，如"&expire=2022-02-01",注意一定要按照yyyy-MM-dd的格式。不希望显示到期信息也可以添加&expire=false取消显示。

可选参数"title=xxx" 可以自定义标题。

可选参数"icon=xxx" 可以自定义图标，内容为任意有效的 SF Symbol Name，如 bolt.horizontal.circle.fill，详细可以下载app https://apps.apple.com/cn/app/sf-symbols-browser/id1491161336

可选参数"color=xxx" 当使用 icon 字段时，可传入 color 字段控制图标颜色，字段内容为颜色的 HEX 编码。如：color=#007aff
----------------------------------------
*/

let args = getArgs();

(async () => {
    let info = await getDataInfo(args.url);
    if (!info) $done();
    let resetDayLeft = getRmainingDays(parseInt(args["reset_day"]));

    let used = info.download + info.upload;
    let total = info.total;
    let expire = args.expire || info.expire;

    // 计算使用百分比
    let usagePercentage = (used / total) * 100;
    let remainingPercentage = 100 - usagePercentage;

    // 创建进度条
    let progressBar = createProgressBar(usagePercentage);

    // 创建电池图标
    let batteryIcon = createBatteryIcon(remainingPercentage);

    // 创建用量描述
    let usageDescription = createUsageDescription(remainingPercentage);

    let content = [
        `${batteryIcon} ${usageDescription}`,
        ``,
        `${progressBar}`,
        `(${bytesToSize(used)}/${bytesToSize(total)})   ${usagePercentage.toFixed(1)}% `
    ];

    if (resetDayLeft) {
        content.push(``);
        let resetIcon = getResetIcon(resetDayLeft);
        let daysEmoji = numberToEmoji(resetDayLeft);
        content.push(`${resetIcon} 重置：${daysEmoji}天`);
    }

    if (expire && expire !== "false") {
        if (/^[\d.]+$/.test(expire)) expire *= 1000;
        content.push(``);
        content.push(`📅 到期：${formatTime(expire)}`);
    }

    let now = new Date();
    let hour = now.getHours();
    let minutes = now.getMinutes();
    hour = hour > 9 ? hour : "0" + hour;
    minutes = minutes > 9 ? minutes : "0" + minutes;


    $done({
        title: `${args.title} | ${hour}:${minutes}`,
        content: content.join("\n"),
        icon: args.icon || "airplane.circle",
        "icon-color": args.color || "#007aff",
    });
})();

function numberToEmoji(number) {
    const emojiNumbers = ['0️⃣', '1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣'];
    return number.toString().split('').map(digit => emojiNumbers[parseInt(digit)]).join('');
}

function createBatteryIcon(percentage) {
    if (percentage <= 8.33) return '🔴';
    if (percentage <= 16.66) return '🪫';
    if (percentage <= 25) return '🪫';
    if (percentage <= 33.33) return '🪫';
    if (percentage <= 41.66) return '🪫';
    if (percentage <= 50) return '🪫';
    if (percentage <= 58.33) return '🔋';
    if (percentage <= 66.66) return '🔋';
    if (percentage <= 75) return '🔋';
    if (percentage <= 83.33) return '🔋';
    if (percentage <= 91.66) return '🔋';
    return '🟢';
}

function createUsageDescription(percentage) {
    if (percentage <= 8.33) return '流量极低，务必节省 🆘';
    if (percentage <= 16.66) return '流量告急，紧急补充 🚨';
    if (percentage <= 25) return '流量偏低，节省使用 ⚠️';
    if (percentage <= 33.33) return '流量尚可，适度使用 🐢';
    if (percentage <= 41.66) return '流量逐渐减少，节省点使用 🐇';
    if (percentage <= 50) return '流量稍紧，谨慎使用 ⚠️';
    if (percentage <= 58.33) return '流量适中，稳步前行 ⛵';
    if (percentage <= 66.66) return '流量充足，尽情使用 🚴';
    if (percentage <= 75) return '流量丰富，使用无忧 💨';
    if (percentage <= 83.33) return '流量非常充足，尽享畅快 🎉';
    if (percentage <= 91.66) return '流量充沛，极速冲刺 🚀';
    return '流量满满，超速前行 🚀';
}


function getResetIcon(days) {
    if (days <= 1) return '🚨';
    if (days <= 2) return '⏰';
    if (days <= 3) return '📅';
    if (days <= 5) return '🗓️';
    if (days <= 7) return '📆';
    if (days <= 10) return '🔟';
    if (days <= 14) return '🏃';
    if (days <= 21) return '⏳';
    if (days <= 28) return '🌓';
    if (days <= 31) return '🌕';
    return '🔄';
}

function createProgressBar(percentage) {
    const barLength = 12;  // 分成12段
    const filledLength = Math.round(barLength * percentage / 100);  // 已用长度
    const emptyLength = barLength - filledLength;  // 剩余长度

    // 心形图标数组，对应每个进度区间
    const heartIcons = ['💚', '💙', '🩵', '💜', '❤️', '🩷', '🧡', '💛', '🤎', '🩶', '🖤', '💔'];

    // 根据 percentage 选择对应的颜色心形图标
    let filledHearts = '';
    if (percentage <= 8.33) {
        filledHearts = heartIcons[0].repeat(filledLength);  // 💚
    } else if (percentage <= 16.66) {
        filledHearts = heartIcons[1].repeat(filledLength);  // 💙
    } else if (percentage <= 25) {
        filledHearts = heartIcons[2].repeat(filledLength);  // 🩵
    } else if (percentage <= 33.33) {
        filledHearts = heartIcons[3].repeat(filledLength);  // 💜
    } else if (percentage <= 41.66) {
        filledHearts = heartIcons[4].repeat(filledLength);  // ❤️
    } else if (percentage <= 50) {
        filledHearts = heartIcons[5].repeat(filledLength);  // 🩷
    } else if (percentage <= 58.33) {
        filledHearts = heartIcons[6].repeat(filledLength);  // 🧡
    } else if (percentage <= 66.66) {
        filledHearts = heartIcons[7].repeat(filledLength);  // 💛
    } else if (percentage <= 75) {
        filledHearts = heartIcons[8].repeat(filledLength);  // 🤎
    } else if (percentage <= 83.33) {
        filledHearts = heartIcons[9].repeat(filledLength);  // 🩶
    } else if (percentage <= 91.66) {
        filledHearts = heartIcons[10].repeat(filledLength);  // 🖤
    } else {
        filledHearts = heartIcons[11].repeat(filledLength);  // 💔
    }

    const emptyHearts = '⚪'.repeat(emptyLength);

    return `${filledHearts}${emptyHearts}`;
}


function getArgs() {
    let args = {};
    $argument.split('&').forEach(item => {
        let idx = item.indexOf('=');
        if (idx > 0) {
            let key = item.slice(0, idx);
            let value = item.slice(idx + 1);
            if (key === 'url') {
                value = decodeURIComponent(value); // 解码 URL
            }
            args[key] = value;
        }
    });

    return args;
}

function getUserInfo(url) {
    let method = args.method || "get";
    let request = {headers: {"User-Agent": "Clash"}, url};
    return new Promise((resolve, reject) =>
        $httpClient[method](request, (err, resp) => {
            if (err != null) {
                reject(err);
                return;
            }
            if (resp.status !== 200) {
                reject(resp.status);
                return;
            }
            let header = Object.keys(resp.headers).find(
                (key) => key.toLowerCase() === "subscription-userinfo"
            );
            if (header) {
                resolve(resp.headers[header]);
                return;
            }
            reject("链接响应头不带有流量信息");
        })
    );
}

async function getDataInfo(url) {
    const [err, data] = await getUserInfo(url)
        .then((data) => [null, data])
        .catch((err) => [err, null]);
    if (err) {
        console.log(err);
        return;
    }

    return Object.fromEntries(
        data
            .match(/\w+=[\d.eE+-]+/g)
            .map((item) => item.split("="))
            .map(([k, v]) => [k, Number(v)])
    );
}

function getRmainingDays(resetDay) {
    if (!resetDay) return;

    let now = new Date();
    let today = now.getDate();
    let month = now.getMonth();
    let year = now.getFullYear();
    let daysInMonth;

    if (resetDay > today) {
        daysInMonth = 0;
    } else {
        daysInMonth = new Date(year, month + 1, 0).getDate();
    }

    return daysInMonth - today + resetDay;
}

function bytesToSize(bytes) {
    if (bytes === 0) return "0B";
    let k = 1024;
    let sizes = ["B", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
    let i = Math.floor(Math.log(bytes) / Math.log(k));
    return (bytes / Math.pow(k, i)).toFixed(2) + " " + sizes[i];
}

function formatTime(time) {
    let dateObj = new Date(time);
    let year = dateObj.getFullYear();
    let month = dateObj.getMonth() + 1;
    let day = dateObj.getDate();
    return year + "年" + month + "月" + day + "日";
}
