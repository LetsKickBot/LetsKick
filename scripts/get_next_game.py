from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from bs4 import BeautifulSoup

import sys
import os


def main():
    window_size = "1920,1080"
    timeout = 20
    team_name = sys.argv[1]

    chrome_options = Options()
    chrome_options.binary_location = os.environ.get('GOOGLE_CHROME_SHIM')

    chrome_options.add_argument("--headless")

    chrome_options.add_argument("--window-size=%s" % window_size)
    browser = webdriver.Chrome(chrome_options=chrome_options)
    browser.get("http://www.espn.com/espn/story/_/id/21087319/soccer-teams")

    try:
        WebDriverWait(browser, timeout).until(EC.visibility_of_element_located((By.XPATH, "//a[contains(text(), '" + team_name + "')]")))
    finally:
        browser.find_element_by_xpath("//a[contains(text(), '" + team_name + "')]").click()

    try:
        WebDriverWait(browser, timeout).until(EC.visibility_of_element_located((By.XPATH, "//header[@class='game-strip pre soccer bt-sport ']")))
    finally:
        browser.find_element_by_xpath("//header[@class='game-strip pre soccer bt-sport ']").click()

    try:
        WebDriverWait(browser, timeout).until(EC.visibility_of_element_located((By.XPATH, "//div[@class='competitors sm-score']")))
    finally:
        html = browser.page_source
        soup = BeautifulSoup(html, "html.parser")

        game_details = soup.find('div', {'class': 'game-details header'}).text
        game_details = game_details.strip()
        next_game = soup.find('div', {'class': 'competitors sm-score'})
        home_team = next_game.find('div', {'class': 'team home '}).find('span', {'class': 'long-name'}).text
        away_team = next_game.find('div', {'class': 'team away '}).find('span', {'class': 'long-name'}).text
        date = next_game.find('div', {'class': 'game-status'}).find('span', {'class': 'game-date'}).text
        time = next_game.find('div', {'class': 'game-status'}).find('span', {'class': 'game-time time'}).text

        print(home_team)
        print(away_team)
        print(date)
        print(time)
        print(game_details)

if __name__ == '__main__':
    main()
