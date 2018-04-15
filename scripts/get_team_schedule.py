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
    browser.get("http://www.espn.com/espn/story/_/id/21087319/soccer-teams")

    WebDriverWait(browser, timeout).until(EC.visibility_of_element_located((By.XPATH, "//a[@id='global-search-trigger']")))
    browser.find_element_by_xpath("//a[@id='global-search-trigger']").click()

    WebDriverWait(browser, timeout).until(EC.visibility_of_element_located((By.CLASS_NAME, "search-box")))
    browser.find_element_by_class_name('search-box').send_keys(team_name)

    browser.implicitly_wait(3)

    try:
        WebDriverWait(browser, timeout).until(EC.visibility_of_element_located((By.XPATH, "//*[@id='global-search']/div/div/div[1]/ul/li/a/div[2]/span[1]")))
    except TimeoutException:
        print("Cannot find team")
        browser.quit()
        sys.exit(1)
    else:
        browser.find_element_by_xpath("//*[@id='global-search']/div/div/div[1]/ul/li/a/div[2]/span[1]").click()

    WebDriverWait(browser, timeout).until(EC.visibility_of_element_located((By.XPATH, "//*[@id='global-nav-secondary']/div/ul[2]/li[4]/a/span[1]")))
    browser.find_element_by_xpath("//*[@id='global-nav-secondary']/div/ul[2]/li[4]/a/span[1]").click()

    browser.switch_to_window(browser.window_handles[1])
    browser.implicitly_wait(1)

    html = browser.page_source
    url = browser.current_url
    soup = BeautifulSoup(html, "html.parser")

    nextFewGames = []
    passFewGames = []

    homeTeams = []
    awayTeams = []
    scoresHome = []
    scoresAway = []
    league = []
    date = []
    nextGames = soup.find_all('a', "score-list upcoming")
    passGames = soup.find_all('a', ["score-list complete", "score-list complete has-info"])

    for i in range(1, len(nextGames)):
        nextFewGames.append(nextGames[i].find('div', {'class' : 'score-column score-home-team score-team'}).find('div', {'class' : 'team-name'}).text
            + ' Vs ' + nextGames[i].find('div', {'class' : 'score-column score-away-team score-team'}).find('div', {'class' : 'team-name'}).text
            + ' at ' + nextGames[i].find('div', {'class' : 'date'}).text + ' ' + nextGames[i].find('div', {'class' : 'time'}).text + ' in '
            + nextGames[i].find('div', {'class' : 'league'}).text)

    for i in range(len(passGames) - 5, len(passGames)):
        if ((passGames[i].find('div', {'class' : 'score-column score-away-team score-team'}).find('div', {'class' : 'team-name winner'}) == None) or 
            (passGames[i].find('div', {'class' : 'score-column score-home-team score-team'}).find('div', {'class' : 'team-name winner'}) == None)):
            awayTeams.append(passGames[i].find('div', {'class' : 'score-column score-away-team score-team'}).find('div', {'class' : 'team-name'}).text)
            homeTeams.append(passGames[i].find('div', {'class' : 'score-column score-home-team score-team'}).find('div', {'class' : 'team-name'}).text)
        else:
            awayTeams.append(passGames[i].find('div', {'class' : 'score-column score-away-team score-team'}).find('div', {'class' : 'team-name winner'}).text)
            homeTeams.append(passGames[i].find('div', {'class' : 'score-column score-home-team score-team'}).find('div', {'class' : 'team-name winner'}).text)

        if((passGames[i].find('div', {'class' : 'score-column score-result'}).find('span', {'class' : 'home-score score-value winner'}) == None) or
            (passGames[i].find('div', {'class' : 'score-column score-result'}).find('span', {'class' : 'away-score score-value'}) == None)):
            scoresHome.append(passGames[i].find('div', {'class' : 'score-column score-result'}).find('span', {'class' : 'home-score score-value'}).text)
            scoresAway.append(passGames[i].find('div', {'class' : 'score-column score-result'}).find('span', {'class' : 'away-score score-value winner'}).text)
        else:
            scoresHome.append(passGames[i].find('div', {'class' : 'score-column score-result'}).find('span', {'class' : 'home-score score-value winner'}).text)
            scoresAway.append(passGames[i].find('div', {'class' : 'score-column score-result'}).find('span', {'class' : 'away-score score-value'}).text)
        date.append(passGames[i].find('div', {'class' : 'date'}).text)
        league.append(passGames[i].find('div', {'class' : 'league'}).text)

    for i in range(len(homeTeams)):
        passFewGames.append(homeTeams[i] + ' [' + scoresHome[i] + '] - ' + '[' + scoresAway[i] + '] ' + awayTeams[i] + ' on ' + date[i] + ' in '
            + league[i])

    # For the pass 5 games
    for i, j in enumerate(passFewGames, 1):
        print(i, '.', j)

    # For the next few games
    j = 1
    if (len(nextFewGames) > 5):
        for i in range(0, 5):
            print(j, '.', nextFewGames[i])
            j += 1
    elif ((len(nextFewGames) < 5) and (len(nextFewGames) != 0)):
        for i in range(len(nextFewGames)):
            print(j, '.', nextFewGames[i])
            j += 1
    else:
        print('There is no coming match in next few days!.')

    browser.quit()
    sys.exit(0)

if __name__ == '__main__':
    main()
