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
    team_name = sys.argv[1]
    
    chrome_options = Options()
    chrome_options.binary_location = os.environ.get('GOOGLE_CHROME_SHIM', None)
    chrome_options.add_argument("--window-size=%s" % window_size)
    chrome_options.add_argument("--headless")
    chrome_options.add_argument("no-sandbox")

    browser = webdriver.Chrome(chrome_options=chrome_options)
    browser.get("http://www.soccerhighlightstoday.com/")

    WebDriverWait(browser, timeout).until(EC.visibility_of_element_located((By.CLASS_NAME, "td-search-btns-wrap")))
    browser.find_element_by_class_name("td-search-btns-wrap").find_element_by_xpath("//a[@id='td-header-search-button']").click()

    WebDriverWait(browser, timeout).until(EC.visibility_of_element_located((By.XPATH, "//input[@id='td-header-search']")))
    browser.find_element_by_xpath("//input[@id='td-header-search']").send_keys(team_name)

    browser.implicitly_wait(4)

    try:
        WebDriverWait(browser, timeout).until(EC.visibility_of_element_located((By.XPATH, "//*[@id='td-aj-search']/div/div[1]/div[2]/h3/a")))
    except TimeoutException:
        print("Cannot find team")
        browser.quit()
        sys.exit(1)
    else:
        browser.find_element_by_xpath("//*[@id='td-aj-search']/div/div[1]/div[2]/h3/a").click()

    browser.implicitly_wait(1)
    html = browser.page_source
    url = browser.current_url
    soup = BeautifulSoup(html, "html.parser")

    title = soup.find('div', {'class' : 'td-post-header'}).find('header', {'class' : 'td-post-title'}).find('h1', {'class' : 'entry-title'}).text
    videoURL = soup.find('div', {'class' : 'td-pb-span8 td-main-content'}).find('div', {'class' : 'td-ss-main-content'}).find('article').find('div', {'class' : 'td-post-content'}).find('div', {'class' : 'acp_wrapper'}).find('div', {'class' : 'acp_content'}).find('div', {'class' : 'brid brid-default-skin brid-playing'}).find('video')['src']

    print(url)
    print(title)
    print(videoURL)

    browser.quit()
    sys.exit(0)

if __name__ == '__main__':
    main()