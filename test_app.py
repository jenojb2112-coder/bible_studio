from playwright.sync_api import sync_playwright
import os

with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page()
    page.goto(f"file://{os.path.abspath('index.html')}")

    # Wait for the login screen to be active
    page.wait_for_selector('#loginScreen.active', timeout=5000)
    print("Application loaded and reached login screen.")
    browser.close()
