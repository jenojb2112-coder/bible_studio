from playwright.sync_api import sync_playwright
import os

with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page()
    page.goto(f"file://{os.path.abspath('index.html')}")

    # Expose testing methods
    page.evaluate("""
        window.testOriginal = function() {
            let t0 = performance.now();
            for (let i = 0; i < 1000000; i++) {
                document.getElementById('loader').style.display = i % 2 === 0 ? 'flex' : 'none';
            }
            return performance.now() - t0;
        };

        window.testOptimized = function() {
            let loader = document.getElementById('loader');
            let t0 = performance.now();
            for (let i = 0; i < 1000000; i++) {
                loader.style.display = i % 2 === 0 ? 'flex' : 'none';
            }
            return performance.now() - t0;
        };
    """)

    original_time = page.evaluate("window.testOriginal()")
    optimized_time = page.evaluate("window.testOptimized()")

    print(f"Original Time: {original_time:.2f} ms")
    print(f"Optimized Time: {optimized_time:.2f} ms")
    if original_time > 0:
        improvement = (original_time - optimized_time) / original_time * 100
        print(f"Improvement: {improvement:.2f}%")

    browser.close()
