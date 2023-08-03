from playwright.sync_api import sync_playwright


def get_cookies(headless=False):
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(headless=headless)
        context = browser.new_context()
        page = context.new_page()
        page.goto('https://google.com/maps')
        page.wait_for_load_state('networkidle')
        buttons = page.query_selector_all('button[aria-label]')
        buttons[1].click()
        cookies_list = page.context.cookies()
        cookies = cookies_list
        browser.close()
        return cookies