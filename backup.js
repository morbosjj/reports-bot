require('dotenv').config()
const express = require('express');
const PRTG = require('node-prtg');
const colors = require('colors');
const date = new Date();

const day = ("0" + date.getDate()).slice(-2);
const month = ("0" + date.getMonth() + 1).slice(-2);
const year = date.getFullYear();
const hours = date.getHours();
// const minutes = ("0" + date.getMinutes()).slice(-2);;
const minutes = date.getMinutes();


const TelegramBot  = require('node-telegram-bot-api');
const { default: axios } = require('axios');
const { response } = require('express');
let executed =false;

// const axios = require('axios');

const user_telegram = process.env.USER_TELEGRAM;

// const user_telegram = '-1001188501383';
const TELEGRAM_API_TOKEN = process.env.TELEGRAM_API_TOKEN;
const PRTG_API_KEY = process.env.PRTG_API_KEY;


const bot = new TelegramBot(TELEGRAM_API_TOKEN, {polling: true});
// const vlan71 = 2283;
// const vlan73 = 2282;
// const vlan72 = 2284;
// const vlan75 = 2285;
const vlan71 = 2158;
const vlan73 = 2157;
const vlan72 = 2284;
const vlan75 = 2285;
const interval = 31000;

const app = express();
const port = 3210;

// JANRO PASSHASH 3845357539
const network = new PRTG({
    url: 'http://localhost:80',
    username: "prtgadmin",
    passhash: '447823838',
});

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.listen(port, () => console.log(`Server started on ${port}`));

const inventoryMsg = `<b><u>TOTAL OF NECESSARY OFFICE ITEMS</u></b>\n<b>Headset: </b>5 A4tech, 8 BadWolf\n<b>System Unit: 6</b>\n<b>Work phone: </b>16 iPhone,  14 android

`;
const incidentMsg = `
    <b><u>INCIDENT REPORT</u></b>\n<b>Time & Date: </b>${hours}:${minutes} ${month}/${day}/${year}\n<b>Computer No:</b>\n<b>Employee:</b>\n<b>Issue:</b>\n<b>Resolve:</b>
    `;

const requestMsg = `
    <b><u>REQUEST REPORT</u></b>\n<b>Time & Date: </b>${hours}:${minutes} ${month}/${day}/${year}\n<b>Computer No:</b>\n<b>Employee:</b>\n<b>Requested:</b>\n<b>Action:</b>
    `;    

const workphoneMsg = `
    <b><u>WORKPHONE TRACK REPORT</u></b>\n<b>Time & Date: </b>${hours}:${minutes} ${month}/${day}/${year}\n<b>Type of Phone:</b>\n<b>Employee:</b>\n<b>Action:</b>\n<b>Remaining:</b>
    `;
    
const taskdoneMsg = `
    <b><u>TASKDONE REPORT</u></b>\n<b>Time & Date: </b>${hours}:${minutes} ${month}/${day}/${year}\n<b>Subject:</b>\n<b>Attainment:</b>
    `;

const pcmovementMsg = `
    <b><u>PC MOVEMENT REPORT</u></b>\n<b>Time & Date: </b>${hours}:${minutes} ${month}/${day}/${year}\n<b>Computer No:</b>\n<b>Employee:</b>\n<b>Movement:</b>
    `;

const ipgserversMsg = `
    <b><u>IPGSERVERS REPORT</u></b>\n<b>Time & Date: </b>${hours}:${minutes} ${month}/${day}/${year}\n<b>Subject:</b>\n<b>Attainment:</b>
    `;
    
const cableMsg = `<b><u>CABLES AND VLAN CHANGES REPORT</u></b>\n<b>Time & Date: </b>${hours}:${minutes} ${month}/${day}/${year}\n<b>Cable No: </b>\n<b>Computer No:</b>\n<b>Employee: </b>\n<b>Changes: </b>\n<b>Reason for Changes: </b>
`;



const amshiftMsg = `
    <b><u>END OF SHIFT REPORT</u></b>\n<b>Date: </b> ${month}/${day}/${year}\n<b>Working hours: </b>06:00 - 14:00\n\n${inventoryMsg}
    `;
    
const midshiftMsg = `
    <b><u>END OF SHIFT REPORT</u></b>\n<b>Date: </b> ${month}/${day}/${year}\n<b>Working hours: </b>14:00 - 22:00\n\n
    `;

const pmshiftMsg = `
    <b><u>END OF SHIFT REPORT</u></b>\n<b>Date: </b> ${month}/${day}/${year} - DATE \n<b>Working hours: </b>22:00 - 06:00\n\n
    `; 



const getNetworkTrafficIn = (vlan) => {
    const getVlanTrafficIn = network.getDeviceSensors(vlan, ['name,objid,lastvalue']).then((res) => {
        let trafficIn;
        const asArray = Object.entries(res);

        //traffic in default [1]
        const result = asArray[3].forEach(data => {
            trafficIn = data.lastvalue;
        });
        return trafficIn;
    }).catch(err => console.log(err));

    return getVlanTrafficIn;
}

const getNetworkTrafficOut = (vlan) => {
    const getVlanTrafficOut = network.getDeviceSensors(vlan, ['name,objid,lastvalue']).then((res) => {

        let trafficOut;
        const asArray = Object.entries(res);

        //traffic out default[2]
        const result = asArray[4].forEach(data => {
            trafficOut = data.lastvalue;
        });
        return trafficOut;
    }).catch(err => console.log(err));;

    return getVlanTrafficOut;
}

const getTrafficTotal = async (vlan) => {
    // get number regex /(\d+)/
    // get number with decimal /\d+\.?\d*/
    const getTrafficIn = await getNetworkTrafficIn(vlan);
    const getTrafficOut = await getNetworkTrafficOut(vlan);
    
    // Decimal
    // const filterNumberTrafficIn = getTrafficIn.match(/\d+\.?\d*/);
    // const filterNumberTrafficOut = getTrafficOut.match(/\d+\.?\d*/);
    
    const filterNumberTrafficIn = getTrafficIn.match(/(\d+)/);
    const filterNumberTrafficOut = getTrafficOut.match(/(\d+)/);

    // get number with comma for kbit/s
    const trafficIn = parseFloat(getTrafficOut.replace(/,/g, ''));
    const trafficOut = parseFloat(getTrafficIn.replace(/,/g, ''));
    // const trafficIn = parseFloat(parseFloat(filterNumberTrafficIn[0]).toFixed(2));
    // const trafficOut = parseFloat(parseFloat(filterNumberTrafficOut[0]).toFixed(2));
    
    const trafficTotal = Math.trunc((trafficIn + trafficOut) * 0.0009765625);

    return trafficTotal;
}

// const getAllDetailsVlan = (vlan) => {
//     const getVlanTrafficIn = network.getDeviceSensors(vlan, ['name,objid,lastvalue']).then((res) => {
//         let trafficIn;
//         const asArray = Object.entries(res);
//         const result = asArray[3].forEach(data => {
//             trafficIn = data.lastvalue;
//         });
//         return res;
//     });

//     return getVlanTrafficIn;
// }

// bot.onText(/\/test/, async (msg)  => {

// });

const monitorVlan = (vlan, bandwidth, interval) => {
    let executed =false;
  
  
   setInterval(async () => {
    try {
      const response = await network.getSensor(vlan);
      const getTrafficOut = await getNetworkTrafficOut(vlan);
      const getTrafficIn = await getNetworkTrafficIn(vlan);
      const { name } = response;
      const filterTrafficOut = getTrafficOut.match(/(\d+)/);
      const trafficOut = parseInt(filterTrafficOut[0]);
    
      const message = `<b>${name}</b> currently reaching ${bandwidth} Mbps limit <b>Download: ${trafficOut} Mbps</b>`;
      const log = `${name} currently reaching ${bandwidth} Mbps limit Download: ${trafficOut} Mbps`;

  
      async function sendMessageTelegram () {
        console.log(`${log} `.red.bold);
        await axios.post(`https://api.telegram.org/bot${TELEGRAM_API_TOKEN}/sendMessage?chat_id=${user_telegram}&text=${message}`, {parse_mode: 'HTML'});
        executed = true;
      }

      function onceRun() {
          if(!executed) sendMessageTelegram();
      }
  
      if(trafficOut >= bandwidth){
        onceRun();
      }
  
      console.log(`${name} Download: ${getTrafficOut} Upload: ${getTrafficIn} `);
  
    } catch (error) {
      console.log(error);
      
    }
   }, interval);
}

monitorVlan(vlan71, 200, interval);
monitorVlan(vlan73, 200, interval);
// monitorVlan(vlan72, 50, 31000);
// monitorVlan(vlan75, 100, 1000);




bot.onText(/\/status71/, async (msg)  => {
    const trafficIn = await getNetworkTrafficIn(vlan71);
    const trafficOut = await getNetworkTrafficOut(vlan71);
    const trafficTotal = await getTrafficTotal(vlan71);


    network.getSensor(vlan71).then((sensor) => {
        const { name } = sensor;
        
        const message = `Hello, <b>${name}</b> currently bandwidth is `+'\n'+` <b>${trafficTotal} Mbps</b> `+ '\n\n' +`Download: <b>${trafficOut}</b> Upload: <b>${trafficIn}</b>`;
        bot.sendMessage(msg.chat.id, message, {parse_mode: 'HTML'});
    }).catch(err => console.log(err));


});

bot.onText(/\/status73/, async (msg)  => {
    const trafficIn = await getNetworkTrafficIn(vlan73);
    const trafficOut = await getNetworkTrafficOut(vlan73);
    const trafficTotal = await getTrafficTotal(vlan73);


    network.getSensor(vlan73).then((sensor) => {
        const { name } = sensor;
        
        const message = `Hello, <b>${name}</b> currently bandwidth is `+'\n'+` <b>${trafficTotal} Mbps</b> `+ '\n\n' +`Download: <b>${trafficOut}</b> Upload: <b>${trafficIn}</b>`;
        bot.sendMessage(msg.chat.id, message, {parse_mode: 'HTML'});
    }).catch(err => console.log(err));


});

bot.onText(/\/status72/, async (msg)  => {
    const trafficIn = await getNetworkTrafficIn(vlan72);
    const trafficOut = await getNetworkTrafficOut(vlan72);
    const trafficTotal = await getTrafficTotal(vlan72);


    network.getSensor(vlan72).then((sensor) => {
        const { name } = sensor;
        
        const message = `Hello, <b>${name}</b> currently bandwidth is `+'\n'+` <b>${trafficTotal} Mbps</b> `+ '\n\n' +`Download: <b>${trafficOut}</b> Upload: <b>${trafficIn}</b>`;
        bot.sendMessage(msg.chat.id, message, {parse_mode: 'HTML'});
    }).catch(err => console.log(err));


});


bot.onText(/\/ph/, (msg) => {
    const ph_html = `
        <b><u>PH-LINE PUBLIC IP</u></b>
        <b>PH1</b>
        
        116.50.242.98
        116.50.242.99 <b><i>CURRENT</i></b>
        116.50.242.100
        116.50.242.101
        116.50.242.102
    `;

    bot.sendMessage(msg.chat.id, ph_html, { parse_mode: "HTML"});
});

bot.onText(/\/hk/, (msg) => {
    const hk_html = `
    <b><u>HK-LINE PUBLIC IP</u></b>
    <b>CMI</b>
        223.119.193.226
        223.119.193.227
        223.119.193.228
        223.119.193.229
        223.119.193.230
        223.119.193.231
        223.119.193.232 <b><i>CURRENT</i></b>
        223.119.193.233
        223.119.193.234
        223.119.193.335
        223.119.193.236
        223.119.193.237
        223.119.193.238
    `;

    bot.sendMessage(msg.chat.id, hk_html, { parse_mode: "HTML"});
});

bot.onText(/\/hgc/, (msg) => {
    const ph2_html = `
        <b><u>LOCAL/HGC PUBLIC IP ADDRESSES</u></b>
        <b>PH2</b>
        
        103.247.228.160
        103.247.228.161
        103.247.228.162
        103.247.228.163
        103.247.228.164
        103.247.230.9
        103.247.230.8 <b><i>CURRENT</i></b>

    `;

    bot.sendMessage(msg.chat.id, ph2_html, { parse_mode: "HTML"}); 


});
// [["/incident", "/request", "/taskdone"], ["/workphone", "/pcmovement", "/ipgservers"], ["/amshift", "/midshift", "/pmshift"]]
bot.onText(/\/network/, (msg) => {
    bot.sendPhoto(msg.chat.id, "https://ibb.co/5jTFTLm");
});

bot.onText(/\/routerconfig/, (msg) => {
    bot.sendPhoto(msg.chat.id, "https://ibb.co/wwQgTSf");
})

bot.onText(/\/reports/, (msg) => {
    bot.sendMessage(msg.chat.id, "List of Reports:", {
            "reply_markup": {
                "inline_keyboard":  [
                    [ {
                        text: 'Incident',
                        callback_data: 'incident'
                      },
                      {
                        text: 'Request',
                        callback_data: 'request'
                      },
                      {
                        text: 'Taskdone',
                        callback_data: 'taskdone',
                      },
                    ],
                    [
                        {
                            text: 'PC Movement',
                            callback_data: 'pcmovement',
                          },
                          {
                            text: 'Ipgservers',
                            callback_data: 'ipgservers'
                          },
                        {
                            text: 'Workphone',
                            callback_data: 'workphone'
                        }
                    ],
                    [
                        {
                            text: 'Cables and Vlan Changes',
                            callback_data: 'cable'
                        }
                    ],

                    [
                        {
                            text: 'AM Shift',
                            callback_data: 'amshift'
                        },
                        {
                            text: 'MID Shift',
                            callback_data: 'midshift'
                        },
                        {
                            text: 'PM Shift',
                            callback_data: 'pmshift'
                        }
                    ]
                ]
            }
        }
    );
});

bot.on("callback_query", (callbackQuery) => {
    const msg = callbackQuery.message;
    const data = callbackQuery.data;

    bot.answerCallbackQuery(callbackQuery.id).then(() => {
        if(data === 'incident'){
            bot.sendMessage(user_telegram, incidentMsg, { parse_mode: "HTML"});
            return;
        }else if(data === 'request'){
            bot.sendMessage(user_telegram, requestMsg, { parse_mode: "HTML"});
            return;
        }else if(data === 'taskdone'){
            bot.sendMessage(user_telegram, taskdoneMsg, { parse_mode: "HTML"});
            return;
        }else if(data === 'pcmovement'){
            bot.sendMessage(user_telegram, pcmovementMsg, { parse_mode: "HTML"});
            return;
        }else if(data === 'ipgservers'){
            bot.sendMessage(user_telegram, ipgserversMsg, { parse_mode: "HTML"});
            return;
        }else if(data === 'amshift'){
            bot.sendMessage(user_telegram, amshiftMsg, { parse_mode: "HTML"});
            return;
        }else if(data === 'midshift'){
            bot.sendMessage(user_telegram, midshiftMsg, { parse_mode: "HTML"});
            return; 
        }else if(data === 'pmshift'){
            bot.sendMessage(user_telegram, pmshiftMsg, { parse_mode: "HTML"});
            return;
        }else if(data === 'workphone'){
            bot.sendMessage(user_telegram, workphoneMsg, { parse_mode: "HTML"});
            return;
        }else if(data === 'cable'){
            bot.sendMessage(user_telegram, cableMsg, {parse_mode: "HTML"});
        }
    });
});

bot.onText(/\/socolive/, (msg) => {
    const site = `
        <b><u>SOCOLIVE</u></b>

        socolive1.tv  (Redirect to other domain name socolive2.site)
        socolive2.tv
        socolive3.tv
        socolive4.tv
        socolive5.tv
        socolive1.vip

        socolive2.site

        socolive.io
        socolive1.io
    
    `;
    bot.sendMessage(msg.chat.id, site, { parse_mode: "HTML"}); 

})

bot.onText(/\/website/, (msg) => {
    const site = `
        <b><u>SOCOLIVE</u></b>

        socolive1.tv  (Redirect to other domain name socolive2.site)
        socolive2.tv
        socolive3.tv
        socolive4.tv
        socolive5.tv
        socolive1.vip

        socolive2.site

        socolive.io
        socolive1.io
    

        <b><u>M6</u></b>

        f.m6vip2.com
        f.m6vip9.com
        f.m6vip8.com
        f.m6vip118.com
        f.m6vip5.com
        f.m6vip4.com
        f.m6vip11.com


        <b><u>YUYANTV</u></b>

        yyzb1.tv
        yyzb2.tv
        yyzb3.tv
        yyzb4.tv
        yyzb5.tv
        yyzb6.tv

        yyzb1.live
        yyzb3.live
        yyzb3.live
        yyzb4.live
        yyzb5.live

        yuyanzhibo.cn (the site can't be reached)
        yuyans.com (the site can't be reached)
        console.yuyan.live


        <b><u>BSPORTS</u></b>

        f.bsports1.com
        f.bsports2.com
        f.bsports3.com
        f.bsports5.com
        f.bsports6.com
        f.bsports7.com
        f.bsports9.com
        f.bty0vip1.com (the site can't be reached)


        
        <b><u>BTY - BSPORTS</u></b>

        bty521.com
        bty522.com
        bty523.com
        bty621.com
        bty622.com
        bty599.com
        bty30.com

    `;
    bot.sendMessage(msg.chat.id, site, { parse_mode: "HTML"}); 

});


bot.onText(/\/new/, (msg) => {
    // await axios.post(`https://api.telegram.org/bot${TELEGRAM_API_TOKEN}/sendMessage?chat_id=${user_telegram}&text=${message}`, {parse_mode: 'HTML'});

    // for new command
    const message = "Added a new command \n\n <b>• status72</b> - Bandwidth total in BOSS ROOM \n\n  <b>Try this command:</b> /status72";
    bot.sendMessage(user_telegram, message, { parse_mode: "HTML"});

});


// change mpbs message
bot.onText(/\/update/, (msg) => {
    // await axios.post(`https://api.telegram.org/bot${TELEGRAM_API_TOKEN}/sendMessage?chat_id=${user_telegram}&text=${message}`, {parse_mode: 'HTML'});

    // for new command
    const message = "Update \n\n <b>• VLAN71</b> - set 200Mpbs from 250Mpbs bandwidth \n\n ";
    bot.sendMessage(user_telegram, message, { parse_mode: "HTML"});

});

bot.onText(/\/red/, (msg) => {
    // await axios.post(`https://api.telegram.org/bot${TELEGRAM_API_TOKEN}/sendMessage?chat_id=${user_telegram}&text=${message}`, {parse_mode: 'HTML'});

    // for new command
    const message = "Baka gusto mo manahimik Patrick? @patrickpaterno.";
    bot.sendMessage(user_telegram, message, { parse_mode: "HTML"});

});

bot.onText(/\/remove/, (msg) => {
    // await axios.post(`https://api.telegram.org/bot${TELEGRAM_API_TOKEN}/sendMessage?chat_id=${user_telegram}&text=${message}`, {parse_mode: 'HTML'});

    // for new command
    const message = "Monitoring all VLAN \n\n <b>• VLAN72 removing to monitoring </b> -  \n\n ";
    bot.sendMessage(user_telegram, message, { parse_mode: "HTML"});

});


bot.onText(/\/incident/, (msg) => {
    bot.sendMessage(user_telegram, incidentMsg, { parse_mode: "HTML"});

});

bot.onText(/\/request/, () => {
    bot.sendMessage(user_telegram, requestMsg, { parse_mode: "HTML"});
});

bot.onText(/\/workphone/, () => {
    bot.sendMessage(user_telegram, workphoneMsg, { parse_mode: "HTML"});
});


bot.onText(/\/taskdone/, () => {
    bot.sendMessage(user_telegram, taskdoneMsg, { parse_mode: "HTML"});
});

bot.onText(/\/pcmovement/, () => {
    bot.sendMessage(user_telegram, pcmovementMsg, { parse_mode: "HTML"});
});

bot.onText(/\/ipgservers/, () => {
    bot.sendMessage(user_telegram, ipgserversMsg, { parse_mode: "HTML"});
});

bot.onText(/\/amshift/, () => {
   bot.sendMessage(user_telegram, amshiftMsg, { parse_mode: "HTML"});
    
});

bot.onText(/\/midshift/, () => {
    bot.sendMessage(user_telegram, midshiftMsg, { parse_mode: "HTML"});
     
});

bot.onText(/\/pmshift/, () => {
    bot.sendMessage(user_telegram, pmshiftMsg, { parse_mode: "HTML"});
     
});


bot.onText(/\/test/, () => {
    const message = `
    <b><u>LIST OF REPORTS</u></b> \n\nCommands: \n • /incident for <b>INCIDENT REPORT</b>\n • /request for <b>REQUEST REPORT</b>\n • /taskdone for <b>TASKDONE REPORT</b>\n • /workphone for <b>WORKPHONE TRACK REPORT</b>\n\n<b><u>END SHIFT REPORT</u></b>\n\nCommands:\n • /amshift <b>AM SHIFT</b>\n • /midshift <b>MID SHIFT</b>\n • /pmshift <b>PM SHIFT</b>\n\n For the list command: /reports
    `;
    bot.sendMessage(user_telegram, message, { parse_mode: "HTML"});
     
});

let timer = null;

bot.onText(/\/start/, () => {
    const message = `
    <b><u>LIST OF REACTIVE REPORTS</u></b> \n\nCommands: \n • /incident for <b>INCIDENT REPORT</b>\n • /request for <b>REQUEST REPORT</b>\n • /taskdone for <b>TASKDONE REPORT</b>\n • /workphone for <b>WORKPHONE TRACK REPORT</b>\n • /pcmovement for <b>PC MOVEMENT REPORT</b>\n • /cable for <b>CABLES AND VLAN CHANGES REPORT</b>\n • /ipgservers for <b>IPGSERVERS REPORT</b>\n • /cablevlan for <b>CABLES AND VLAN CHANGES REPORT</b>\n <b><u>END SHIFT REPORT</u></b>\n\nCommands:\n • /amshift <b>AM SHIFT</b>\n • /midshift <b>MID SHIFT</b>\n • /pmshift <b>PM SHIFT</b>\n\n For the list command: /reports
    `;

    // timer = setInterval(() => {
    //     if(new Date().getSeconds() === 1) {
    //         bot.sendMessage(5126686245, message, { parse_mode: "HTML"});    
    //     }
    // }, 1000)3,600,000    
    setInterval(() => {
       console.log("Running service...");
    }, 2000);
    setInterval(() => {
        // if(new Date().getSeconds() === 1) {
        bot.sendMessage(user_telegram, message, { parse_mode: "HTML"});    
        // }
    }, 25200000);
});

bot.onText(/\/stop/, () => {
    console.log("Stopped Service");
    clearInterval(timer);
});
