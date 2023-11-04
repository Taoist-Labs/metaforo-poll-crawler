import fs from "fs";
import path from "path";
import axios from "axios";

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

async function main() {

    let json, url;

    url = 'https://forum.seedao.xyz/api/thread/list?page=1&per_page=10&filter=category&category_index_id=12&tag_id=0&sort=latest&group_name=seedao';
    json = await fetch(url);
    fs.writeFileSync('./list.json', JSON.stringify(json, null, 2));


    url = 'https://forum.seedao.xyz/api/get_thread/45993?sort=old&group_name=seedao';
    json = await fetch(url);

    let thread = json.data.thread;
    console.log(thread.id, thread.title, thread.user.username);

    let poll = thread.polls[0];
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

    fs.writeFileSync('./thread.json', JSON.stringify(json, null, 2));
}

main();