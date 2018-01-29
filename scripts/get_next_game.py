from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from bs4 import BeautifulSoup

import sys


def main():
    timeout = 20
    browser = webdriver.Chrome()
    browser.get("http://www.espn.com/espn/story/_/id/21087319/soccer-teams")
    team_name = sys.argv[1]

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
        next_game = soup.find('div', {'class': 'competitors sm-score'})
        home_team = next_game.find('div', {'class': 'team home '}).find('span', {'class': 'long-name'}).text
        away_team = next_game.find('div', {'class': 'team away '}).find('span', {'class': 'long-name'}).text
        date = next_game.find('div', {'class': 'game-status'}).find_all('span')[0].get('data-date')
        print(home_team)
        print(away_team)
        print(date)

if __name__ == '__main__':
    main()
