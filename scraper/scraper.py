import requests
import re
from bs4 import BeautifulSoup
from .pwscripts import get_cookies
from urllib.parse import unquote, quote


class GoogleMapsScraper:


    def __init__(self):
        pw_cookies = get_cookies(True)
        cookies = {cookie['name']: cookie['value'] for cookie in pw_cookies}
        headers = {'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36'}
        self.session = requests.Session()
        self.session.cookies.update(cookies)
        self.session.headers.update(headers)


    def update_url(self, url: str) -> str:
        """
        This method receives an url in the format
        "https://www.google.com/localservices/prolist?src=2&q=<query>&lci=<results_page>"
        and updates the lci value to get the next page url
        """
        old_lci = int(re.search(r'lci=(\d+)', url).group(1))
        new_lci = str(20 + old_lci)
        url = url.replace(f"lci={old_lci}", f"lci={new_lci}")
        return url


    def get_place_info(self, url: str) -> list:
        """
        This method receives an url in the format 
        "https://www.google.com/localservices/prolist?src=2&q=<query>&lci=<results_page>"
        and returns all the places information for that page
        """
        r = self.session.get(url)
        soup = BeautifulSoup(r.content, 'html.parser')
        places = soup.select('div[data-profile-url-path]')
        places_info = []
        for place in places:
            info = {}
            try:
                place.attrs['data-lu-ad-tracking-url']
                continue
            except:
                pass
            try:
                info['name'] = place.get_text('\n').split('\n')[0]
            except:
                info['name'] = ''
            try:
                info['website'] = place.select_one('div[data-website-url]').attrs['data-website-url']
            except:
                info['website'] = ''
            try:
                info['phone'] = place.select_one('a[data-phone-number]').attrs['data-phone-number']
            except:
                info['phone'] = ''
            try:
                raw_address = place.select_one('a[href^="https://maps.google.com"]').attrs['href']
                address = re.search(r'&daddr=(.*?)&', raw_address).group(1)
                info['address'] = unquote(address).replace('+', ' ')
            except:
                info['address'] = ''
            places_info.append(info)
        return places_info


    def crawl_results(self, query: str) -> list:
        """
        This method receives a query string and returns a list with all the
        matching results
        """
        results = []
        url = f"https://www.google.com/localservices/prolist?src=2&q={quote(query)}&lci=0"
        while True:
            new_results = self.get_place_info(url)
            if not new_results:
                break
            results += new_results
            url = self.update_url(url)
        return results