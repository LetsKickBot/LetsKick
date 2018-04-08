from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException
from bs4 import BeautifulSoup

import sys
import os
import bs4

def main():
    window_size = "1200,800"
    timeout = 20
    # team_name = sys.argv[1]
    team_name = 'Manchester United'

    chrome_options = Options()
    chrome_options.binary_location = os.environ.get('GOOGLE_CHROME_SHIM', None)
    chrome_options.add_argument("--window-size=%s" % window_size)
    chrome_options.add_argument("--headless")
    chrome_options.add_argument("no-sandbox")

    browser = webdriver.Chrome(chrome_options=chrome_options)
    browser.get("http://www.espn.com/espn/story/_/id/21087319/soccer-teams")

    WebDriverWait(browser, timeout).until(EC.visibility_of_element_located((By.XPATH, "//a[@id='global-search-trigger']")))
    browser.find_element_by_xpath("//a[@id='global-search-trigger']").click()

    WebDriverWait(browser, timeout).until(EC.visibility_of_element_located((By.CLASS_NAME, "search-box")))
    browser.find_element_by_class_name('search-box').send_keys(team_name)

    browser.implicitly_wait(2)

    try:
        WebDriverWait(browser, timeout).until(EC.visibility_of_element_located((By.CLASS_NAME, "search-results")))
    except TimeoutException:
        print("Cannot find team")
        browser.quit()
        sys.exit(1)
    else:
        browser.find_element_by_class_name('search-results').find_element_by_xpath("//*[contains(text(), 'Soccer Club')]").click()

    WebDriverWait(browser, timeout).until(EC.visibility_of_element_located((By.XPATH, "//*[@id='global-nav-secondary']/div/ul[2]/li[4]/a/span[1]")))
    newHtml = browser.page_source
    newSoup = BeautifulSoup(newHtml, "html.parser")
    browser.find_element_by_xpath("//*[@id='global-nav-secondary']/div/ul[2]/li[4]/a/span[1]").click()

    browser.switch_to_window(browser.window_handles[1])
    browser.implicitly_wait(1)

    
    imageUrl = newSoup.find('article', {'class': 'news-feed-item news-feed-story-package'}).find('figure', {'class': 'feed-item-figure '}).find('div', {'class': 'img-wrap'}).find('img')['data-default-src']
    newsTitle = newSoup.find('article', {'class': 'news-feed-item news-feed-story-package'}).find('div', {'class': 'text-container no-headlines'}).find('div', {'class': 'item-info-wrap'}).find('a').text
    newsSubtitle = newSoup.find('article', {'class': 'news-feed-item news-feed-story-package'}).find('div', {'class': 'text-container no-headlines'}).find('div', {'class': 'item-info-wrap'}).find('p').text

    # Get the deep news
    # entireNewsUrl = newSoup.find('article', {'class': 'news-feed-item news-feed-story-package'}).find('div', {'class': 'text-container no-headlines'}).find('div', {'class': 'item-info-wrap'}).find('a')['href']
    # entireNewsUrl = 'http://www.espn.com' + entireNewsUrl
    # browser.get(entireNewsUrl)
    # newest = browser.page_source
    # newestSoup = BeautifulSoup(newest, "html.parser")

    print(imageUrl)
    print(newsTitle)
    print(newsSubtitle)
    # entireNews = ''

    # for text in newestSoup.find('div', {'class': 'article-body'}).findAll('p'):
    #     for i in text:
    #         if (type(i) == bs4.element.NavigableString):
    #             entireNews += i

    # print(entireNews)
    browser.quit()
    sys.exit(0)

if __name__ == '__main__':
    main()
