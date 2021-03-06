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

    browser.implicitly_wait(4)

    WebDriverWait(browser, timeout).until(EC.visibility_of_element_located((By.XPATH, "//*[@id='global-search']/div/div/div[1]/ul")))
    
    search_results = browser.find_element_by_xpath("//*[@id='global-search']/div/div/div[1]/ul").find_elements_by_class_name("search_results__details")
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
    newHtml = browser.page_source
    newSoup = BeautifulSoup(newHtml, "html.parser")
    browser.find_element_by_xpath("//*[@id='global-nav-secondary']/div/ul[2]/li[4]/a/span[1]").click()
    browser.switch_to_window(browser.window_handles[1])
    browser.implicitly_wait(2)

    WebDriverWait(browser, timeout).until(EC.visibility_of_element_located((By.CLASS_NAME, 'next-match')))
    browser.find_element_by_class_name('next-match').find_element_by_xpath(".//*[contains(text(), 'Game Details')]").click()

    WebDriverWait(browser, timeout).until(EC.visibility_of_element_located((By.XPATH, "//div[@class='competitors sm-score']")))
    html = browser.page_source
    soup = BeautifulSoup(html, "html.parser")

    game_details = soup.find('div', {'class': 'game-details header'}).text
    game_details = game_details.strip()
    next_game = soup.find('div', {'class': 'competitors sm-score'})
    home_team = next_game.find('div', {'class': 'team home '}).find('span', {'class': 'long-name'}).text
    away_team = next_game.find('div', {'class': 'team away '}).find('span', {'class': 'long-name'}).text
    date = next_game.find('div', {'class': 'game-status'}).find('span', {'data-behavior': 'date_time'})['data-date']
    teamImageUrl = newSoup.find('head').findAll('meta')[11]['content']

    home_team = unidecode(home_team)
    away_team = unidecode(away_team)
    date = unidecode(date)
    game_details = unidecode(game_details)
    
    print(home_team)
    print(away_team)
    print(date)
    print(game_details)
    print(teamImageUrl)

    browser.quit()
    sys.exit(0)

if __name__ == '__main__':
    main()
