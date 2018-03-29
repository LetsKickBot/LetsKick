from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException
from bs4 import BeautifulSoup

from subprocess import call
import sys
import os


def main():
    window_size = "1200,800"
    timeout = 20
    player_name = sys.argv[1]
    chrome_options = Options()
    chrome_options.binary_location = os.environ.get('GOOGLE_CHROME_SHIM')

    chrome_options.add_argument("--headless")

    chrome_options.add_argument("--window-size=%s" % window_size)
    browser = webdriver.Chrome(chrome_options=chrome_options)
    browser.get("http://www.espn.com/soccer/")

    try:
        WebDriverWait(browser, timeout).until(EC.visibility_of_element_located((By.XPATH, "//a[@id='global-search-trigger']")))
    finally:
        browser.find_element_by_xpath("//a[@id='global-search-trigger']").click()

    try:
        WebDriverWait(browser, timeout).until(EC.visibility_of_element_located((By.CLASS_NAME, "search-box")))
    finally:
        browser.find_element_by_class_name('search-box').send_keys(player_name)

    browser.implicitly_wait(2)

    try:
        WebDriverWait(browser, timeout).until(EC.visibility_of_element_located((By.XPATH, "//*[contains(text(), 'Soccer Player')]")))
    except TimeoutException:
        print("Cannot find your player")
        browser.quit()
        sys.exit(1)
    else:
        browser.find_element_by_class_name('search-results').find_element_by_xpath("//*[contains(text(), 'Soccer Player')]").click()

    try:
        WebDriverWait(browser, timeout).until(EC.visibility_of_element_located((By.CLASS_NAME, 'player-spec')))
    finally:
        html = browser.page_source
        soup = BeautifulSoup(html, "html.parser")

        spec = soup.find('div', {'class': 'player-spec'})
        for col in spec.find_all('dl'):
            for element in col.find_all('dd'):
                print(element.text)

    browser.quit()
    sys.exit(0)

if __name__ == '__main__':
    main()
