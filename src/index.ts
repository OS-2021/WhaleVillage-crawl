const cheerio = require('cheerio');
const puppeteer = require('puppeteer');
const mariadb = require('mariadb');
import schedule from 'node-schedule';
import { getLinkMp3 } from './lib/crawlPodbbang';
import { getLinkMov } from './lib/crawlYoutube';


const connection = mariadb.createPool({
  host: 'localhost',
  user: 'root',
  password: '1234',
  database: 'whale'
});

schedule.scheduleJob ('00 00 * * * *', async () =>{
  await connection.query(`delete from crawl;`,() =>{connection.release();});
  await getLinkMov('https://www.youtube.com/channel/UCKhHSmRlJxMaWZ-wuRKmBfA/videos');
  await getLinkMp3('https://app-api6.podbbang.com/channels/1779381/episodes?offset=0&limit=1000&sort=desc&episode_id=0');
  console.log('end');
});