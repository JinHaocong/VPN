/*
 * 由@fishingworld编写
 * 原脚本地址：https://raw.githubusercontent.com/fishingworld/something/main/groupPanel.js
 * 由@Rabbit-Spec修改
 * 更新日期：2024.08.03
 * 版本：2.1

示例↓↓↓
----------------------------------------

[Panel]
Group-Panel = script-name=Group-Panel,update-interval=1

[Script]
Group-Panel = type=generic,timeout=10,script-path=https://raw.githubusercontent.com/fishingworld/something/main/groupPanel.js,argument=icon=network&color=#86abee&group=Master
  对应参数：
	icon：图标
	color：图标颜色
	group：策略组名称
*/

;(async () => {

    let params = getParams($argument);
    let group = params.group;
    let groupName = (await httpAPI("/v1/policy_groups/select?group_name=" + encodeURIComponent(group) + "")).policy;
    let proxy = await httpAPI("/v1/policy_groups");
    var proxyName = [];
    let arr = proxy["" + group + ""];
    let allGroup = [];

    for (var key in proxy) {
        allGroup.push(key)
    }


    for (let i = 0; i < arr.length; ++i) {
        proxyName.push(arr[i].name);
    }

    let index;

    for (let i = 0; i < proxyName.length; ++i) {
        if (groupName == proxyName[i]) {
            index = i
        }
    }


    let name = proxyName[index];
    let secondName;
    let rootName = name;
    if (allGroup.includes(rootName) == true) {
        secondName = (await httpAPI("/v1/policy_groups/select?group_name=" + encodeURIComponent(rootName) + "")).policy;
        name = '策略：' + name + '\n' + '节点：' + secondName
    }

    while (allGroup.includes(rootName) == true) {
        rootName = (await httpAPI("/v1/policy_groups/select?group_name=" + encodeURIComponent(rootName) + "")).policy;
    }

    if (arr[index].isGroup == true && secondName != rootName) {
        name = '策略：' + name + '\n' + '节点：' + rootName;
    }

    let now = new Date();
    let hour = now.getHours();
    let minutes = now.getMinutes();
    hour = hour > 9 ? hour : "0" + hour;
    minutes = minutes > 9 ? minutes : "0" + minutes;

    $done({
        title: `${group} | ${hour}:${minutes}`,
        content: name,
        icon: params.icon,
        "icon-color": params.color
    });
})();


function httpAPI(path = "", method = "GET", body = null) {
    return new Promise((resolve) => {
        $httpAPI(method, path, body, (result) => {
            resolve(result);
        });
    });
}

function getParams(param) {
    return Object.fromEntries(
        $argument
            .split("&")
            .map((item) => item.split("="))
            .map(([k, v]) => [k, decodeURIComponent(v)])
    );
}