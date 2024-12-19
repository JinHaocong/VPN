const BASE_URL = 'https://www.youtube.com/premium';
const { executeType, sourcePath, params } = $environment;
const getPolicy = (cnt) => cnt?.includes('#policy=') ? decodeURIComponent(cnt.split('#policy=')[1].trim()) : '';
const cronsign = ['0', '-1'].includes(executeType) ? 'Y' : 'N';
const policy = ['0', '-1'].includes(executeType) ? getPolicy(sourcePath) : params;

console.log(`$environment：${JSON.stringify($environment)}`);
console.log(`策略组：${policy}`);

const message = { action: 'get_customized_policy', content: policy };

let output = [];
let OKList = [];
let NoList = ['不支持节点 ➟ '];
let ErrorList = ['检测出错节点 ➟ '];
let pflag = 1; // 是否是策略，或者简单节点
let sign = 0;

const main = async () => {
  console.log('main 执行')
  try {
    const resolve = await $configuration.sendMessage(message);
    if (resolve.error) {
      handleError(resolve.error);
      return;
    }

    if (resolve.ret) {
      processResponse(resolve.ret);
      await check();
    }
  } catch (error) {
    handleError(error);
  }
};

const handleError = (error, done = true) => {
  console.log('handleError 执行')
  console.log(JSON.stringify(error));
  done && $done();
};

const processResponse = (response) => {
  console.log('processResponse 执行')
  output = response[message.content] ? JSON.parse(JSON.stringify(response[message.content].candidates)) : [policy];
  pflag = response[message.content] ? pflag : 0;
  console.log(`output:  ${JSON.stringify(output)}`)

  
  if (pflag === 1 && response[policy].candidates.length === 0) {
    $done({ title: 'YouTube Premium 检测', htmlMessage: `<p style="text-align: center; font-family: -apple-system; font-size: large; font-weight: thin"><br><b>😭 无有效节点</b>` });
  }
};

const check = async () => {
  console.log('check 执行')

  await Promise.all(output.map(testYTB));

  logResults();
  if (OKList[0] && pflag === 1) {
    console.log('开始排序');
    await reOrder(OKList);
  } else {
    handleNoSupport();
  }
};

const logResults = () => {
  console.log('logResults 执行')
  console.log(`⛳️ 共计 ${OKList.length} 个：支持节点 ➟ ${OKList}`);
  console.log(`🏠 共计 ${NoList.length - 1} 个：${NoList}`);
  console.log(`🕹 共计 ${ErrorList.length - 1} 个：${ErrorList}`);
  sign = 1;
};

const handleNoSupport = () => {
  console.log('handleNoSupport 执行')
  const content = !OKList[0] 
    ? pflag === 0 
      ? `<p style="text-align: center; font-family: -apple-system; font-size: large; font-weight: thin"><br><b>😭 该节点不支持 YouTube Premium </b><br><br>👇<br><br><font color=#FF5733>-------------------------<br><b>⟦ ${policy} ⟧ </b><br>-------------------------</font>`
      : `<p style="text-align: center; font-family: -apple-system; font-size: large; font-weight: thin"><br>❌  <b>⟦ ${policy} ⟧ </b>⚠️ 切换失败<br><br><b>该策略组内未找到支持 YouTube Premium 的节点<br><br><font color=#FF5733>-----------------------------<br><b>检测详情请查看JS脚本记录</b><br>-----------------------------</font></p>`
    : `<p style="text-align: center; font-family: -apple-system; font-size: large; font-weight: thin"><br><b> 🎉 该节点支持 YouTube Premium </b><br><br>👇<br><br><font color=#FF5733>-------------------------<br><b>⟦ ${policy} ⟧ </b><br>-------------------------</font>`;
  $done({ title: 'YouTube Premium 检测&切换', htmlMessage: content });
};

const reOrder = async (cnt) => {
  console.log('reOrder 执行')
  const messageURL = {
    action: 'url_latency_benchmark',
    content: cnt
  };

  console.log('messageURL');
  console.log(JSON.stringify(messageURL));

  try {
    const resolve = await $configuration.sendMessage(messageURL);
    if (resolve.error) {
      handleError(resolve.error);
      return;
    }

    if (resolve.ret) {
      processReOrderResponse(resolve.ret, cnt);
    }
  } catch (error) {
    handleError(error);
  }
};

const processReOrderResponse = (response, cnt) => {
  console.log('processReOrderResponse 执行');
  console.log(JSON.stringify(response));
  
  const output = JSON.stringify(response);
  console.log(`节点延迟：${output}`);
  
  console.log(`排序前: ${cnt}`);
  
  if (cnt) {
    cnt.sort((a, b) => {
      console.log(`${a} VS ${b}`);
      return (response?.[a]?.[1] !== -1 && response?.[b]?.[1] !== -1) 
        ? response[a][1] - response[b][1] 
        : response[b][1];
    });
  }
  
  console.log(`排序后: ${cnt}`);
  
  const ping = response[cnt[0]];
  const dict = { [policy]: cnt[0] };
  
  if (cnt[0]) {
    finalizeReOrder(cnt, ping, dict);
  }
};

const finalizeReOrder = async (cnt, ping, dict) => {
  console.log('finalizeReOrder 执行')
  console.log(`选定支持YouTube Premium：${cnt[0]}延迟数据为 👉${ping}`);
  const pingStr = ` ⚡️ 节点延迟 ➟ 「 ${ping} 」 `;
  
  const mes1 = {
    action: 'set_policy_state',
    content: dict
  };
  
  const res = await $configuration.sendMessage(mes1);
  if (res.error) {
    handleReOrderError(cnt);
  } else if (res.ret) {
    handleReOrderSuccess(cnt, pingStr);
  }
};

const handleReOrderError = (cnt) => {
  console.log('handleReOrderError 执行')
  const content = pflag === 0 && cnt[0]
    ? `<p style="text-align: center; font-family: -apple-system; font-size: large; font-weight: thin"><br><b>⟦ ${policy} ⟧ </b><br><br>🎉 该节点支持 <b>YouTube Premium</b></p>`
    : `<p style="text-align: center; font-family: -apple-system; font-size: large; font-weight: thin"><br><b>⟦ ${policy} ⟧ </b><br><br>⚠️ 该节点不支持 <b>YouTube Premium</b></p>`;
  $done({ title: 'YouTube 检测&切换', htmlMessage: content });
};

const handleReOrderSuccess = (cnt, pingStr) => {
  console.log('handleReOrderSuccess 执行')
  console.log(`已经切换至支持 <b>Premium</b> 的路线 ➟ ${cnt[0]}`);
  if (cronsign === 'Y') {
    $notify('📺 YouTube Premium 定时检测&切换', '🎉 已经切换至支持 Premium 的最优延迟线路👇', `${cnt[0]}\n 👉 ${pingStr}`);
  }
  const content = `<p style="text-align: center; font-family: -apple-system; font-size: large; font-weight: thin"><br><b>⟦ ${policy} ⟧ </b>已切换至支持<b>Premium</b> 的路线中延迟最优节点<br><br> 👇<br><br> ⟦ ${cnt[0]} ⟧<br><br><font color=#16A085>${pingStr}</font><br>-----------------------------<br><b><font color=#FF5733>检测详情请查看JS脚本记录</font></b><br>-----------------------------</p>`;
  $done({ title: 'YouTube 检测&切换', htmlMessage: content });
};

const testYTB = async (pname) => {
  console.log('testYTB 执行')
  console.log(`pname: ${pname}`)
  const opts = { policy: pname };
  const option = {
    url: BASE_URL,
    opts,
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/94.0.4606.61 Safari/537.36',
      'Accept-Language': 'en',
    },
  };
  
  try {
    const response = await $task.fetch(option);
    const { body: data, statusCode } = response;
    
    if (sign === 0) {
      processTestResponse(pname, data, statusCode);
    } else {
      throw new Error('Error');
    }
  } catch (error) {
    handleError(error,false);
  }
};

const processTestResponse = (pname, data, statusCode) => {
  console.log('processTestResponse 执行')
  if (statusCode !== 200) {
    console.log(`${pname}：检测出错`);
    ErrorList.push(pname);
    throw new Error('Error');
  }
  
  if (data.includes('Premium is not available in your country')) {
    console.log(`${pname}：未支持`);
    NoList.push(pname);
    return 'Not Available';
  }
  
  const re = /"GL":"(.*?)"/gm;
  const result = re.exec(data);
  const region = result && result[1] ? result[1] : data.includes('www.google.cn') ? 'CN' : 'US';
  
  console.log(`${pname}：支持${region}`);
  OKList.push(pname);
  return region;
};

main();