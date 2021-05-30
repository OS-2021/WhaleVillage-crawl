const cheerio = require('cheerio');
const puppeteer = require('puppeteer');
const mariadb = require('mariadb');
const connection = mariadb.createPool({
  host: 'localhost',
  user: 'root',
  password: '1234',
  database: 'whale'
});

export const getLinkMov = (async(link) => {
  let data = await (async() => {
    let today = await new Date();  
    const browser = await puppeteer.launch({headless: true, args: ['--no-sandbox']})
    const page = await browser.newPage();
    await page.setViewport({ width: 1366, height: 768 });
    await page.goto(link);
    try {
      await page.waitForSelector('#items > ytd-grid-video-renderer');
    }catch (error) {
      await browser.close();
      console.log('영상 없음');
      return [];
    }
    const content = await page.content();
    const $ = await cheerio.load(content);
    await browser.close();

    let list = [];
    let nameList = [];
    let linkList = [];
    await $(`#video-title`).each(async (index, element) => { 
      if (await $(element).text().indexOf('고래산마을') != -1) {
        nameList.push($(element).text()); 
        linkList.push('https://www.youtube.com/embed/' + $(element).attr('href').replace('/watch?v=',''));
      }
    });

    for (let i = 0; i < nameList.length; i++) {
      list[i] = {
        "title": nameList[i],
        "link": linkList[i]
      };
    }
    return list;
  })();

  for await (let variable of data) {
    console.log(variable);
    let sql = `INSERT INTO crawl(page, title, link) VALUES("youtube", "${variable.title}", "${variable.link}");`;
	  await connection.query(sql,() =>{connection.release();});
  }

  return;
});