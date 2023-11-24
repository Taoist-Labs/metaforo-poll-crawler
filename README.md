# metaforo-poll-crawler
A crawler to fetch poll related info from Metaforo. Currently, it's dedicated to SeeDAO.

For the first run, please delete all the lines in `thread_ids.txt` in the root folder.

Run `npx ts-node src/index.ts <season number>` to start.

`season number` is the number of the season.

For example, if you want to get all the polls in season 4, please run `npx ts-node src/index.ts 4`