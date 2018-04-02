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
    player_name = sys.argv[1]

    chrome_options = Options()
    chrome_options.binary_location = os.environ.get('GOOGLE_CHROME_SHIM')
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--headless")
    chrome_options.add_argument("--window-size=%s" % window_size)

    browser = webdriver.Chrome(chrome_options=chrome_options)
    browser.get("http://www.espn.com/soccer/")

    WebDriverWait(browser, timeout).until(EC.visibility_of_element_located((By.XPATH, "//a[@id='global-search-trigger']")))
    browser.find_element_by_xpath("//a[@id='global-search-trigger']").click()

    WebDriverWait(browser, timeout).until(EC.visibility_of_element_located((By.CLASS_NAME, "search-box")))
    browser.find_element_by_class_name('search-box').send_keys(player_name)

    browser.implicitly_wait(2)

    try:
        WebDriverWait(browser, timeout).until(EC.visibility_of_element_located((By.XPATH, "//*[contains(text(), 'Soccer Player')]")))
    except TimeoutException:
        print("Cannot find player")
        browser.quit()
        sys.exit(1)
    else:
        browser.find_element_by_class_name('search-results').find_element_by_xpath("//*[contains(text(), 'Soccer Player')]").click()

    WebDriverWait(browser, timeout).until(EC.visibility_of_element_located((By.CLASS_NAME, 'player-spec')))
    html = browser.page_source
    soup = BeautifulSoup(html, "html.parser")

    spec = soup.find('div', {'class': 'player-spec'})
    cols = spec.find_all('dl')
    col1dd = cols[0].find_all('dd')
    col2dd = cols[1].find_all('dd')
    col1dt = cols[0].find_all('dt')
    col2dt = cols[1].find_all('dt')

    name = spec.find('h1').text
    print(name)
    for i in range(0, len(col1dd)):
        print(col1dt[i].text + col1dd[i].text)

    for i in range(0, len(col2dd)):
        print(col2dt[i].text + col2dd[i].text)
    # print('\nFor more information: ' + browser.current_url)

    browser.quit()
    sys.exit(0)

if __name__ == '__main__':
    main()
