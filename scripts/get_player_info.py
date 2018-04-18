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

    WebDriverWait(browser, timeout).until(EC.visibility_of_element_located((By.CLASS_NAME, 'player-spec')))
    html = browser.page_source
    url = browser.current_url
    soup = BeautifulSoup(html, "html.parser")

    spec = soup.find('div', {'class': 'player-spec'})
    cols = spec.find_all('dl')
    col1dd = cols[0].find_all('dd')
    col2dd = cols[1].find_all('dd')
    col1dt = cols[0].find_all('dt')
    col2dt = cols[1].find_all('dt')

    name = spec.find('h1').text
    imageHTML = spec.find('img')
    imageURL = imageHTML['src']
    name = unidecode(name)

    print(imageURL)
    print(browser.current_url)
    print(name)
    for i in range(0, len(col1dd)):
        info = col1dt[i].text + col1dd[i].text
        print(unidecode(info))

    for i in range(0, len(col2dd)):
        info = col2dt[i].text + col2dd[i].text
        print(unidecode(info))

    browser.quit()
    sys.exit(0)

if __name__ == '__main__':
    main()
