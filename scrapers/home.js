const puppeteer = require('puppeteer');
const user = require('../testData');

const baseUrl = 'https://animeflv.net';

(async () => {
  const browser = await puppeteer.launch({
    defaultViewport: {width: 1280, height: 800}
  });
  const page = await browser.newPage();
  //Show logs from inside page.evaluate() to the node console
  //page.on('console', consoleObj => console.log(consoleObj.text()));

  //   await page.goto(baseUrl);
  //   await page.screenshot({path: 'img/screenshots/home.png'});
  //   await page.type('form [name="email"]', user.email);
  //   await page.type('form [name="password"]', user.password);
  //   await page.click('form[action="/auth/sign_in"] button');
  //   await page.screenshot({path: 'img/screenshots/isLogged.png'});
  //   await page.click('#tbflw .Button.Sm'); //Navigate to /perfil/USER_NAME/siguiendo

  const followedAnimeUrls = [
    '/anime/5659/boku-no-hero-academia-4th-season',
    '/anime/5655/mugen-no-juunin-immortal'
  ]; //await getFollowedAnimeUrls(page);

  const followedAnimesInfo = [];
  for (const url of followedAnimeUrls) {
    const animeInfo = await getAnimeInfo(url, page);
    followedAnimesInfo.push(animeInfo);
  }

  console.log({followedAnimesInfo});

  await browser.close();
})();

/**
 * @param page browser.newPage() instance
 * @return {string[]} urls
 */
const getFollowedAnimeUrls = async page => {
  return await page.evaluate(() =>
    Array.from(document.querySelectorAll('.ListAnimes li')).map(li => {
      return li.querySelector('.Title a').getAttribute('href');
    })
  );
};

/**
 * @param {string} url relative url of an anime page
 * @param {*} page browser.newPage() instance
 * @return {{name: string, url: string, img: string, nextEpisodeDate: string, episodesToWatch: [{number: number, url: string}]}}
 */
const getAnimeInfo = async (url, page) => {
  await Promise.all([
    page.waitForNavigation(), // The promise resolves after navigation has finished
    page.goto(baseUrl + url) // Clicking the link will indirectly cause a navigation
  ]);

  await page.waitForSelector('#episodeList li .mseen');

  const animeInfo = await page.evaluate(url => {
    const listItems = Array.from(document.querySelectorAll('#episodeList li'));

    const episodesToWatch = listItems.map(li => {
      console.log('ANTES');
      console.log(li.querySelector('.mseen'));
      console.log('DESPUES');

      if (!li.querySelector('.mseen').checked)
        return {
          number: +li.querySelector('a p').textContent.split(' ')[1],
          url: li.querySelector('a').getAttribute('href')
        };
    });

    return {
      name: document.querySelector('h2.Title').textContent,
      url,
      img: document.querySelector('.AnimeCover img').getAttribute('src'),
      nextEpisodeDate: anime_info[anime_info.length - 1], //string, got from animeflv's global variable
      episodesToWatch
    };
  }, url);

  return animeInfo;
};
