import fs from "fs";
import path from "path";
import axios, { Axios } from "axios";
import { pipeline } from "stream";

import * as stream from 'stream';
import { promisify } from 'util';

async function fetch(url: string): Promise<any> {
    const headers = {
        'accept': 'application/json, text/plain, */*',
        'accept-encoding': 'gzip, deflate, br',
        'accept-language': 'en-US,en;q=0.9',
        'Api_key': 'metaforo_website',
        'Authorization': 'Bearer 20944|Sc8x9S1b3xIWksGsQyXwETv9edPGiSzRP7RB29mD',
        'Cookie': '_ga=GA1.1.313003853.1697860126; ARRAffinity=fce5f2795945f933a772f887ac42ae46802da36d6ace3b2c32343a83eabcca2e; _ga_QPVKNX8BXZ=GS1.1.1699079490.25.1.1699080762.0.0.0; _ga_FPJVR8J0T1=GS1.1.1699084107.10.1.1699086037.0.0.0',
        'Referer': 'https://forum.seedao.xyz/category/19',
        'Sec-Ch-Ua': '"Chromium";v="118", "Google Chrome";v="118", "Not=A?Brand";v="99"',
        'Sec-Ch-Ua-Mobile': '?0',
        'Sec-Ch-Ua-Platform': '"macOS"',
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'same-origin',
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36',
    };

    const response = await axios.get(url, { headers: headers });
    return response.data;
}

async function fetchThreadList(cateIdx: number, page: number, per_page: number): Promise<any> {
    let url = `https://forum.seedao.xyz/api/thread/list?page=${page}&per_page=${per_page}&filter=category&category_index_id=${cateIdx}&tag_id=0&sort=new&group_name=seedao`;
    return await fetch(url);
}

async function fetchThread(threadId: number): Promise<any> {
    let url = `https://forum.seedao.xyz/api/get_thread/${threadId}?sort=new&group_name=seedao`;
    return await fetch(url);
}

async function main() {

    let data_cate_12 = await fetchThreadList(12, 1, 100); // P3
    let data_cate_61 = await fetchThreadList(61, 1, 100); // SIP

    // console.log(JSON.stringify(data_cate_12.data.threads));

    let threads: any[] = [];

    let tmp_threads = data_cate_12.data.threads;
    for (let i = 0; i < tmp_threads.length; i++) {
        let thread = tmp_threads[i];
        threads.push(thread);
    }

    tmp_threads = data_cate_61.data.threads;
    for (let i = 0; i < tmp_threads.length; i++) {
        let thread = tmp_threads[i];
        threads.push(thread);
    }

    console.log(`total threads: ${threads.length}`);

    for (let i = 0; i < threads.length; i++) {
        let thread = threads[i];

        console.log('-------------------');
        // console.log(JSON.stringify(thread));

        console.log(
            thread.id,
            thread.title,
            thread.category_index_id,
            thread.category_name,
            thread.category_id,
            thread.user.username,
        );

        let threadJson = await fetchThread(thread.id);
        if (threadJson.data.thread.polls.length === 0) {
            continue;
        }

        let poll = threadJson.data.thread.polls[0];
        let pollId = poll.id;
        let pollTitle = poll.title;
        let pollThreadId = poll.thread_id;
        let pollCreatedAt = poll.created_at;
        let pollUpdatedAt = poll.updated_at;
        let pollClosedAt = poll.close_at;
        let pollStatus = poll.status;
        let name = poll.name;
        let is_nft = poll.is_nft;
        let tokenAddress = poll.token_address;
        let tokenId = poll.token_id;
        let tokenType = poll.token_type;
        let arweaveHash = poll.arweave;

        console.log(pollId, pollTitle, pollThreadId, pollCreatedAt, pollUpdatedAt, pollClosedAt, pollStatus, name, is_nft, tokenAddress, tokenId, tokenType, arweaveHash);


        if (tokenAddress == '0x9d34D407D8586478b3e4c39BE633ED3D7be1c80C' && tokenId == 4) {


            // axios.get(`https://arweave.net/tx/${arweaveHash}/data.csv`, { responseType: 'blob' }).then(response => {
            //     fs.writeFile(`./thread$-${thread.id}-${thread.title}.csv`, response.data, (err) => {
            //         if (err) throw err;
            //         console.log('The file has been saved!');
            //     });
            // });

            const fileUrl = `https://arweave.net/tx/${arweaveHash}/data.csv`;
            const fileName = `./thread-${thread.id}-${thread.title}.csv`;

            console.log(`downloading ${fileUrl} to ${fileName}`);

            const reponse = await axios.get(fileUrl, { responseType: 'stream' });
            const writer = fs.createWriteStream(fileName);
            reponse.data.pipe(writer);


            console.log('download successful');
        } else {
            console.log('skip due to not P3.');
        }


    }

}

main();