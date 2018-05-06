from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException
from bs4 import BeautifulSoup
from unidecode import unidecode

import sys
import os

def main():
    window_size = "1200,800"
    timeout = 300
    team_name = sys.argv[1]

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

    WebDriverWait(browser, timeout).until(EC.visibility_of_element_located((By.XPATH, "//*[@id='global-search']/div/div/div[1]/ul")))

    search_results = browser.find_element_by_xpath("//*[@id='global-search']/div/div/div[1]/ul").find_elements(By.XPATH, ".//*")
    found = False

    for result in search_results:
        if result.find_element_by_class_name('search_results__cat').text == 'Soccer':
            result.find_element_by_class_name('search_results__cat').click()
            found = True
            break

    if not found:
        print("Cannot find team")
        browser.quit()
        sys.exit(1)

    WebDriverWait(browser, timeout).until(EC.visibility_of_element_located((By.XPATH, "//*[@id='global-nav-secondary']/div/ul[2]/li[4]/a/span[1]")))
    html = browser.page_source
    soup = BeautifulSoup(html, "html.parser")

    spec = soup.find('li', {'class': 'tier-3'}).find('img', {'class': 'main imageLoaded'})
    imageURL = spec['src']
    name = soup.find('li', {'class': 'team-name'}).find('a').text

    name = unidecode(name)

    print(name)
    print(imageURL)

    browser.quit()

    sys.exit(0)

if __name__ == '__main__':
    main()
