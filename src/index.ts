import fs from "fs";
import path from "path";
import axios from "axios";
import Papa from "papaparse";
import { stringify } from 'csv-stringify/sync';
import { group } from "console";

// Node NFT 
// token id 1 season 1
// token id 2 season 2
// token id 3 season 3
// token id 4 season 4
// token id 5 season 5
// token id 6 season 6
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

async function fetch(url: string, refer: string): Promise<any> {
    const headers = {
        "accept": "application/json, text/plain, */*",
        "accept-language": "en-US,en;q=0.9",
        "api_key": "metaforo_website",
        "cache-control": "no-cache",
        "pragma": "no-cache",
        "priority": "u=1, i",
        "sec-ch-ua": "\"Chromium\";v=\"124\", \"Google Chrome\";v=\"124\", \"Not-A.Brand\";v=\"99\"",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "\"macOS\"",
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin",
        "cookie": "_ga=GA1.1.1830730929.1699210631; _ga_QPVKNX8BXZ=GS1.1.1716199832.47.1.1716199835.0.0.0; _ga_FPJVR8J0T1=GS1.1.1716394240.65.1.1716394780.0.0.0",
        // "Referer": "https://forum.seedao.xyz/thread/52133",
        "Referer": refer,
        "Referrer-Policy": "strict-origin-when-cross-origin"
    };

    console.log(`fetching ${url}`);

    // sleep for 10 ms
    await new Promise(resolve => setTimeout(resolve, 1000));

    const response = await axios.get(url, { headers: headers });
    console.log(response.status);
    return response.data;
}

async function post(url: string, data: any, refer: string): Promise<any> {
    const headers = {
        "accept": "application/json, text/plain, */*",
        "accept-language": "en-US,en;q=0.9",
        "api_key": "metaforo_website",
        "cache-control": "no-cache",
        "content-type": "application/json",
        "pragma": "no-cache",
        "priority": "u=1, i",
        "sec-ch-ua": "\"Chromium\";v=\"124\", \"Google Chrome\";v=\"124\", \"Not-A.Brand\";v=\"99\"",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "\"macOS\"",
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin",
        "cookie": "_ga=GA1.1.1830730929.1699210631; _ga_QPVKNX8BXZ=GS1.1.1716199832.47.1.1716199835.0.0.0; _ga_FPJVR8J0T1=GS1.1.1716394240.65.1.1716394780.0.0.0",
        "Referer": refer,
        "Referrer-Policy": "strict-origin-when-cross-origin"
    };
    console.log(`posting ${url}`);

    // sleep for 10 ms
    await new Promise(resolve => setTimeout(resolve, 1000));
    const response = await axios.post(url, data, { headers: headers });
    console.log(response.status);
    return response.data;
}

async function fetchThreadList(cateIdx: number, page: number, per_page: number): Promise<any> {
    let url = `https://forum.seedao.xyz/api/thread/list?page=${page}&per_page=${per_page}&filter=category&category_index_id=${cateIdx}&tag_id=0&sort=new&group_name=seedao`;
    return await fetch(url, `https://forum.seedao.xyz/category/${cateIdx}`);
}

async function fetchThread(threadId: number): Promise<any> {
    // let url = `https://forum.seedao.xyz/api/get_thread/${threadId}?sort=new&group_name=seedao`;
    let url = `https://forum.seedao.xyz/api/get_thread/${threadId}?sort=old&group_name=seedao`;
    return await fetch(url, `https://forum.seedao.xyz/thread/${threadId}`);
}

async function fetchPollOptionData(poll_id: number, option_id: number, page: number): Promise<any> {
    let url = `https://forum.seedao.xyz/api/poll/list`;

    const form = new FormData();
    form.append('option_id', option_id);
    form.append('page', page);
    form.append('group_name', 'seedao');

    return await post(url, form, `https://forum.seedao.xyz/thread/${poll_id}`);
}

async function fetchUserInfo(userId: number): Promise<any> {
    let url = `https://forum.seedao.xyz/api/profile/${userId}`;
    return await fetch(url, `https://forum.seedao.xyz/profile/${userId}`);
}

function saveThreadId(threadId: number) {
    fs.appendFileSync('thread_ids.txt', `${threadId}\n`);
}

function savePollOptionId(threadId: number, pollId: number, optionId: number, optionVoters: number) {
    fs.appendFileSync('poll_option_ids.txt', `${threadId},${pollId},${optionId},${optionVoters}\n`);
}

function saveUserPollInfo(threadId: number, pollId: number, optionId: number, userId: number) {
    fs.appendFileSync('user_poll_info.txt', `${threadId},${pollId},${optionId},${userId}\n`);
}

function saveUserInfo(userId: number, address: string, name: string, discord_handle: string) {
    fs.appendFileSync('users.txt', `${userId},${address},${name},${discord_handle}\n`);
}

function checkThreadId(threadId: number): boolean {
    let threadIds = fs.readFileSync('thread_ids.txt', 'utf8');
    return threadIds.includes(`${threadId}`);
}

function checkPollOptionId(threadId: number, pollId: number, optionId: number): boolean {
    let pollOptionIds = fs.readFileSync('poll_option_ids.txt', 'utf8');
    return pollOptionIds.includes(`${threadId},${pollId},${optionId}`);
}

function checkIfPollOptionIdProcessed(threadId: number, pollId: number, optionId: number): boolean {
    let pollOptionIds = fs.readFileSync('user_poll_info.txt', 'utf8');
    return pollOptionIds.includes(`${threadId},${pollId},${optionId}`);
}

function checkUserPollInfo(threadId: number, pollId: number, optionId: number, userId: number): boolean {
    let userPollInfo = fs.readFileSync('user_poll_info.txt', 'utf8');
    return userPollInfo.includes(`${threadId},${pollId},${optionId},${userId}`);
}

function checkUserInfo(userId: number): boolean {
    let userInfo = fs.readFileSync('users.txt', 'utf8');
    return userInfo.includes(`${userId},0x`);
}

function loadPollOptions(): any {
    let pollOptionIds = fs.readFileSync('poll_option_ids.txt', 'utf8');
    let lines = pollOptionIds.split('\n');
    let data = [];
    for (let i = 0; i < lines.length; i++) {
        let line = lines[i];
        if (line.length == 0) {
            continue;
        }
        let parts = line.split(',');
        let threadId = parseInt(parts[0]);
        let pollId = parseInt(parts[1]);
        let optionId = parseInt(parts[2]);
        let optionVoters = parseInt(parts[3]);
        data.push({
            threadId: threadId,
            pollId: pollId,
            optionId: optionId,
            optionVoters: optionVoters
        });
    }
    return data;
}

function loadUserPollInfo(): any {
    let userPollInfo = fs.readFileSync('user_poll_info.txt', 'utf8');
    let lines = userPollInfo.split('\n');
    let data = [];
    for (let i = 0; i < lines.length; i++) {
        let line = lines[i];
        if (line.length == 0) {
            continue;
        }
        let parts = line.split(',');
        let threadId = parseInt(parts[0]);
        let pollId = parseInt(parts[1]);
        let optionId = parseInt(parts[2]);
        let userId = parseInt(parts[3]);
        data.push({
            threadId: threadId,
            pollId: pollId,
            optionId: optionId,
            userId: userId
        });
    }
    return data;
}

function loadUserInfo(): any {
    let userInfo = fs.readFileSync('users.txt', 'utf8');
    let lines = userInfo.split('\n');
    let data = [];
    for (let i = 0; i < lines.length; i++) {
        let line = lines[i];
        if (line.length == 0) {
            continue;
        }
        let parts = line.split(',');
        let userId = parseInt(parts[0]);
        let address = parts[1];
        let name = parts[2];
        let discord_handle = parts[3];
        data.push({
            userId: userId,
            address: address,
            name: name,
            discord_handle: discord_handle
        });
    }
    return data;
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
            saveThreadId(threadId);// skip it forever
            continue;
        }

        for (let i = 0; i < threadJson.data.thread.polls.length; i++) {
            let threadTitle = threadJson.data.thread.title;
            if (threadTitle.toString().startsWith('[BetaTest] ')) {
                saveThreadId(threadId);// skip it forever
                continue
            }
            let poll = threadJson.data.thread.polls[i];
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

            if (pollStatus != 'close') {
                console.warn(`skip due to not closed poll ${pollId}.`);
                continue;
            }

            console.log(threadTitle);

            console.log(pollId, pollTitle, pollThreadId, pollCreatedAt, pollUpdatedAt, pollClosedAt, pollStatus, name, is_nft, tokenAddress, tokenId, tokenType, arweaveHash);

            if (tokenAddress.toLowerCase() == GATE_NFT_ADDRESS.toLowerCase() && tokenId == season) {
                // const fileUrl = `https://arweave.net/tx/${arweaveHash}/data.csv`;
                // const fileName = `./s${season}/thread-${threadId}-${threadTitle}-${pollId}-${pollTitle}.csv`;
                // console.log(`downloading ${fileUrl} to ${fileName}`);
                // const reponse = await axios.get(fileUrl, { responseType: 'stream' });
                // const writer = fs.createWriteStream(fileName);
                // reponse.data.pipe(writer);
                // console.log('download successful');

                for (let j = 0; j < poll.options.length; j++) {
                    let option = poll.options[j];
                    let optionId = option.id;
                    let optionVoters = option.voters;
                    console.log(optionId, optionVoters);
                    if (checkPollOptionId(threadId, pollId, optionId)) {
                        console.log(`skip due to already processed ${threadId},${pollId},${optionId}.`);
                    } else {
                        savePollOptionId(threadId, pollId, optionId, optionVoters);
                    }
                }

            } else {
                console.log(`skip due to not gated by NFT ${GATE_NFT_ADDRESS} season ${season}.`);
            }
        }

        saveThreadId(threadId);
    }

    console.log('-------------------Process poll options-------------------');

    let pollOptions = loadPollOptions();

    for (let i = 0; i < pollOptions.length; i++) {
        let pollOption = pollOptions[i];
        let threadId = pollOption.threadId;
        let pollId = pollOption.pollId;
        let optionId = pollOption.optionId;
        let optionVoters = pollOption.optionVoters;

        if (optionVoters > 0) {
            if (checkIfPollOptionIdProcessed(threadId, pollId, optionId)) {
                console.log(`skip due to already processed ${threadId},${pollId},${optionId}.`);
                continue;
            }

            let pageSize = 10;
            let pageNum = Math.ceil(optionVoters / pageSize);
            for (let page = 1; page <= pageNum; page++) {
                let pollOptionData = await fetchPollOptionData(pollId, optionId, page);
                // if (threadId == 50800 && pollId == 2726) {
                //     console.log(JSON.stringify(pollOptionData));
                // }
                for (let j = 0; j < pollOptionData.data.list.length; j++) {
                    let userId = pollOptionData.data.list[j].uid;
                    console.log(threadId, pollId, optionId, userId);
                    if (checkUserPollInfo(threadId, pollId, optionId, userId)) {
                        console.log(`skip due to already processed ${threadId},${pollId},${optionId},${userId}.`);
                    } else {
                        saveUserPollInfo(threadId, pollId, optionId, userId);
                    }
                }
            }
        }
    }

    console.log('-------------------Process user info-------------------');

    let userPollInfos = loadUserPollInfo();
    for (let i = 0; i < userPollInfos.length; i++) {
        let userPoll = userPollInfos[i];
        let threadId = userPoll.threadId;
        let pollId = userPoll.pollId;
        let optionId = userPoll.optionId;
        let userId = userPoll.userId;

        if (checkUserInfo(userId)) {
            console.log(`skip due to already processed ${userId}.`);
        } else {
            let userInfo = await fetchUserInfo(userId);
            let address = userInfo.data.user.web3_public_key;
            let name = userInfo.data.user.username;
            let discord_handle = userInfo.data.user.discord_username;
            console.log(userId, address, name, discord_handle);
            saveUserInfo(userId, address, name, discord_handle);
        }
    }

    console.log('-------------------Generate poll result-------------------');

    let userInfos = loadUserInfo();

    // key: threadId + pollId
    // data: {uid: userId, address: address, name: name, discord_handle: discord_handle}
    let pollResults: any = {};
    for (let i = 0; i < userPollInfos.length; i++) {
        let userPoll = userPollInfos[i];
        let threadId = userPoll.threadId;
        let pollId = userPoll.pollId;
        let optionId = userPoll.optionId;
        let userId = userPoll.userId;

        if (pollResults[`${threadId}-${pollId}`] == undefined) {
            pollResults[`${threadId}-${pollId}`] = {};
        }

        let userInfo = userInfos.find((u: any) => u.userId == userId);
        pollResults[`${threadId}-${pollId}`][userId] = {
            uid: userId,
            name: userInfo.name,
            address: userInfo.address,
            discord_handle: userInfo.discord_handle,
            option: optionId,
            weight: 1,
            time: 0
        };
    }

    // console.log(pollResults);

    for (let key in pollResults) {
        fs.writeFileSync(`./s${season}/thread-${key}.csv`, stringify(Object.values(pollResults[key]), { header: true }));
    };

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
    let season = parseInt(process.argv[2]);
    if (season == undefined) {
        console.log('please input season number');
        return;
    }
    console.log(`processing season ${season}`);
    listNodePollsBySeason(season);
}

main();