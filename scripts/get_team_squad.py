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
    browser.get('http://www.skysports.com/football/teams')

    WebDriverWait(browser, timeout).until(EC.visibility_of_element_located((By.XPATH, "//input[@class='site-search__input site-search--inpage__input']")))
    browser.find_element_by_xpath("//input[@class='site-search__input site-search--inpage__input']").click()

    browser.find_element_by_xpath("//input[@class='site-search__input site-search--inpage__input']").send_keys(team_name)
    
    browser.implicitly_wait(2)

    try:
        WebDriverWait(browser, timeout).until(EC.visibility_of_element_located((By.CLASS_NAME, "autocomplete__results-item")))
    except TimeoutException:
        print("Cannot find team")
        browser.quit()
        sys.exit(1)
    else:
        browser.find_element_by_class_name('autocomplete__results-item').click()

    WebDriverWait(browser, timeout).until(EC.visibility_of_element_located((By.XPATH, "//div[@class='page-nav__body']/ul/li")))
    currentURL = browser.page_source
    newSoup = BeautifulSoup(currentURL, "html.parser")

    getBar = newSoup.find('div', {'class': 'page-nav__frame'}).find('div', {'class': 'page-nav__body'}).find('ul', {'class' : 'page-nav__item-group'}).findAll('li')

    for i in range(5,len(getBar)):
        if(getBar[i].find('a').text == 'Squad'):
            link = getBar[i].find('a')['href']

    browser.get('http://www.skysports.com' + link)

    squadHtml = browser.page_source
    soup = BeautifulSoup(squadHtml, "html.parser")
    url = browser.current_url

    browser.implicitly_wait(1)

    formation = soup.find('div', {'class': 'box -bp30-hdn s11-graphic-container'}).find('div', {'class': 'span10 strap1 -center -ondark -interact text-h5 arrangement'}).text
    players = soup.find('div', {'class': 'box -bp30-hdn s11-graphic-container'}).findAll('span', {'class': 'col span3/4'})
    playersNumber = soup.find('div', {'class': 'box -bp30-hdn s11-graphic-container'}).findAll('span', {'class': 'col strap2 -interact span1/4'})

    playersList = []
    playersNumberList = []
    whoPlay = []

    for i in players:
        playersList.append(i.text)

    for i in playersNumber:
        playersNumberList.append(i.text)

    j = 0
    while (j < 11):
        whoPlay.append(playersList[j] + ' - ' + playersNumberList[j])
        j += 1

    print(url)
    print(formation)
    for i in whoPlay:
        print(i)
    
    browser.quit()
    sys.exit(0)

if __name__ == '__main__':
    main()
