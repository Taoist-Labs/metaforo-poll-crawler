console.log('Hello world!')

import Crawler from "crawler";
import fs from "fs";

const c = new Crawler({
    encoding: null,
    jQuery: false,
    incomingEncoding: 'utf-8',
    maxConnections : 10,
    headers: {
        'authority': 'forum.seedao.xyz',
        'method': 'GET',
        'path': '/api/thread/list?page=1&per_page=10&filter=all&category_index_id=19&tag_id=0&sort=latest&group_name=seedao',
        'scheme': 'https',
        'accept': 'application/json, text/plain, */*',
        'accept-encoding': 'gzip, deflate, br',
        'accept-language': 'en-US,en;q=0.9',
        'Api_key': 'metaforo_website',
        'Authorization': 'Bearer 20944|Sc8x9S1b3xIWksGsQyXwETv9edPGiSzRP7RB29mD',
        'Cookie': '_ga=GA1.1.313003853.1697860126; ARRAffinity=fce5f2795945f933a772f887ac42ae46802da36d6ace3b2c32343a83eabcca2e; _ga_QPVKNX8BXZ=GS1.1.1699079490.25.1.1699080762.0.0.0; _ga_FPJVR8J0T1=GS1.1.1699084107.10.1.1699086037.0.0.0',
        'Referer':'https://forum.seedao.xyz/category/19',
        'Sec-Ch-Ua': '"Chromium";v="118", "Google Chrome";v="118", "Not=A?Brand";v="99"',
        'Sec-Ch-Ua-Mobile': '?0',
        'Sec-Ch-Ua-Platform': '"macOS"',
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'same-origin',
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36',

    },
    // This will be called for each crawled page
    callback : function (error, res, done) {
        if(error){
            console.log(error);
        }else{
            // const $ = res.$;
            // $ is Cheerio by default
            //a lean implementation of core jQuery designed specifically for the server
            // console.log($("body").text());
            // console.log(Buffer.from(res.body.toString(), 'utf-8').toString());
            // console.log(res);
            fs.createWriteStream('./test.json').write(res.body);
        }
        done();
    }
});

// Queue just one URL, with default callback
c.queue({uri: 'https://forum.seedao.xyz/api/thread/list?page=1&per_page=10&filter=all&category_index_id=19&tag_id=0&sort=latest&group_name=seedao'});

// Queue a list of URLs

// c.queue(['http://www.google.com/','http://www.yahoo.com', 'https://forum.seedao.xyz/thread/p2-seedao-wiki-47099', 'https://forum.seedao.xyz/thread/p2-seedao-logo-seed-nft-46695']);
