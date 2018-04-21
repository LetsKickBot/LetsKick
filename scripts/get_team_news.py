from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException
from bs4 import BeautifulSoup

import sys
import os

def main():
    window_size = "1200,800"
    timeout = 20
    # team_name = sys.argv[1]
    team_name = 'Manchester United'

    chrome_options = Options()
    chrome_options.binary_location = os.environ.get('GOOGLE_CHROME_SHIM', None)
    chrome_options.add_argument("--window-size=%s" % window_size)
    # chrome_options.add_argument("--headless")
    chrome_options.add_argument("no-sandbox")

    browser = webdriver.Chrome(chrome_options=chrome_options)
    browser.get("http://www.espn.com/espn/story/_/id/21087319/soccer-teams")

    WebDriverWait(browser, timeout).until(EC.visibility_of_element_located((By.XPATH, "//a[@id='global-search-trigger']")))
    browser.find_element_by_xpath("//a[@id='global-search-trigger']").click()

    WebDriverWait(browser, timeout).until(EC.visibility_of_element_located((By.CLASS_NAME, "search-box")))
    browser.find_element_by_class_name('search-box').send_keys(team_name)

    browser.implicitly_wait(2)

    try:
        WebDriverWait(browser, timeout).until(EC.visibility_of_element_located((By.XPATH, "//*[@id='global-search']/div/div/div[1]/ul/li/a/div[2]/span[1]")))
    except TimeoutException:
        print("Cannot find team")
        browser.quit()
        sys.exit(1)
    else:
        browser.find_element_by_xpath("//*[@id='global-search']/div/div/div[1]/ul/li/a/div[2]/span[1]").click()

    WebDriverWait(browser, timeout).until(EC.visibility_of_element_located((By.XPATH, "//*[@id='global-nav-secondary']/div/ul[2]/li[4]/a/span[1]")))
    newHtml = browser.page_source
    url = browser.current_url
    newSoup = BeautifulSoup(newHtml, "html.parser")
    browser.find_element_by_xpath("//*[@id='global-nav-secondary']/div/ul[2]/li[4]/a/span[1]").click()

    browser.switch_to_window(browser.window_handles[1])
    browser.implicitly_wait(3)


    imageUrl1 = newSoup.findAll('article')
    # imageUrl1 = newSoup.find('article', {'class': 'news-feed-item news-feed-story-package'}).find('figure', {'class': 'feed-item-figure '}).find('div', {'class': 'img-wrap'}).find('img')['data-default-src']
    # imageUrl1 = newSoup.findAll('article', {'class' : 'news-feed-item news-feed-story-package'})[0].find('figure', {'class': 'feed-item-figure '}).find('div', {'class': 'img-wrap'}).find('img')['data-default-src']
    # imageUrl1 = newSoup.findAll('article', {'class' : 'news-feed-item news-feed-story-package'})
    # newsTitle1 = newSoup.findAll('article')[0].find('div', {'class': 'text-container no-headlines'}).find('div', {'class': 'item-info-wrap'}).find('a').text
    # newsSubtitle1 = newSoup.findAll('article')[0].find('div', {'class': 'text-container no-headlines'}).find('div', {'class': 'item-info-wrap'}).find('p').text
    # newsLink1 = newSoup.findAll('article')[0].find('a')['data-popup-href']

    # imgageUrl2 = newSoup.find('article', {'class': 'news-feed-item news-feed-story-package'}).find('figure', {'class': 'feed-item-figure '}).find('div', {'class': 'img-wrap'}).find('img')['data-default-src']

    # print(url)
    print(imageUrl1)
    # print(newsTitle1)
    # print(newsSubtitle1)
    # print(newsLink1)

    browser.quit()
    sys.exit(0)

if __name__ == '__main__':
    main()
