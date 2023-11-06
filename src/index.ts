import fs from "fs";
import path from "path";
import axios from "axios";
import Papa from "papaparse";
import { stringify } from 'csv-stringify/sync';

// Node NFT 
// token id 1 season 1
// token id 2 season 2
// token id 3 season 3
// token id 4 season 4
const GATE_NFT_ADDRESS = '0x9d34D407D8586478b3e4c39BE633ED3D7be1c80C';

function walk(dir: string, filter?: (f: string) => boolean): Promise<string[]> {
    return new Promise((resolve, reject) => {
        fs.readdir(dir, (error, files) => {
            if (error) {
                return reject(error);
            }
            Promise.all(files.map((file) => {
                return new Promise((resolve, reject) => {
                    const filepath = path.join(dir, file);
                    fs.stat(filepath, (error, stats) => {
                        if (error) {
                            return reject(error);
                        }
                        if (stats.isDirectory()) {
                            walk(filepath, filter).then(resolve);
                        } else if (typeof filter === 'undefined' || (filter && filter(file))) {
                            resolve(filepath);
                        }
                    });
                });
            })).then((foldersContents) => {
                resolve(foldersContents.reduce((all: any[], folderContents: any) => all.concat(folderContents), []));
            });
        });
    });
}

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

function saveThreadId(threadId: number) {
    fs.appendFileSync('thread_ids.txt', `${threadId}\n`);
}

function checkThreadId(threadId: number): boolean {
    let threadIds = fs.readFileSync('thread_ids.txt', 'utf8');
    return threadIds.includes(`${threadId}`);
}

async function listNodePollsBySeason(season: number): Promise<any> {
    let data_cate_12 = await fetchThreadList(12, 1, 200); // P3
    let data_cate_61 = await fetchThreadList(61, 1, 200); // SIP

    let threadIds: Map<string, number> = new Map();

    let tmp_threads = data_cate_12.data.threads;
    for (let i = 0; i < tmp_threads.length; i++) {
        let thread = tmp_threads[i];
        threadIds.set(thread.id, 1);
    }

    tmp_threads = data_cate_61.data.threads;
    for (let i = 0; i < tmp_threads.length; i++) {
        let thread = tmp_threads[i];
        threadIds.set(thread.id, 1);
    }

    console.log(`total threads: ${threadIds.size}`);


    for (var key of threadIds.keys()) {
        console.log('-------------------');
        let threadId = parseInt(key);

        if (checkThreadId(threadId)) {
            console.log(`skip due to already processed ${threadId}.`);
            continue;
        }

        let threadJson = await fetchThread(threadId);
        if (threadJson.data.thread.polls.length === 0) {
            continue;
        }

        let threadTitle = threadJson.data.thread.title;
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

        if (tokenAddress.toLowerCase() == GATE_NFT_ADDRESS.toLowerCase() && tokenId == season) {
            const fileUrl = `https://arweave.net/tx/${arweaveHash}/data.csv`;
            const fileName = `./s${season}/thread-${threadId}-${threadTitle}.csv`;
            console.log(`downloading ${fileUrl} to ${fileName}`);
            const reponse = await axios.get(fileUrl, { responseType: 'stream' });
            const writer = fs.createWriteStream(fileName);
            reponse.data.pipe(writer);
            console.log('download successful');
        } else {
            console.log(`skip due to not gated by NFT ${GATE_NFT_ADDRESS} season ${season}.`);
        }

        saveThreadId(threadId);
    }


    summaryNodePollsBySeason(season);
}

async function summaryNodePollsBySeason(season: number): Promise<any> {
    let files = await walk(`./s${season}`, (f: string) => f.endsWith('.csv'));

    // fix delimiter issue
    for (let i = 0; i < files.length; i++) {
        let file = files[i];
        console.log(`${file}`);
        let data = fs.readFileSync(file, 'utf8');
        data = data.replace(/, /g, ',');
        fs.writeFileSync(file, data);
    }

    var summary_data: any;

    for (let i = 0; i < files.length; i++) {
        let file = files[i];
        console.log(`${file}`);
        var csv = Papa.parse(fs.readFileSync(file, 'utf8'), {
            skipEmptyLines: true,
            header: true
        });
        for (let j = 0; j < csv.data.length; j++) {
            // console.log(csv.data[j]);
            let data: any = csv.data[j];
            let address = data.address;
            let vote = data.weight;
            let name = data.name;
            console.log(address, vote, name);
            if (summary_data == undefined) {
                summary_data = {};
            }
            if (summary_data[address] == undefined) {
                summary_data[address] = {
                    address: address,
                    vote: 0,
                    name: name
                }
            }
            summary_data[address].vote += parseInt(vote);
        }
    }

    console.log('-------------------');
    fs.writeFileSync(`./s${season}-summary.csv`, stringify(Object.values(summary_data), { header: true }));
}

async function main() {
    // listNodePollsBySeason(1);
    // listNodePollsBySeason(2);
    // listNodePollsBySeason(3);
    listNodePollsBySeason(4);
}

main();