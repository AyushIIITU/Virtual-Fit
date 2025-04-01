from selenium import webdriver
from selenium.webdriver.common.by import By
from urllib.parse import urljoin, urlparse
import time

# Set the base URL of your React app (e.g., where it’s running locally or deployed)
base_url = "http://localhost:5173"

# Initialize sets to track visited URLs and URLs to visit
visited = set()
to_visit = {base_url}

# Set up the Selenium WebDriver (e.g., for Chrome)
driver = webdriver.Chrome()

def is_same_domain(url, base):
    """Check if a URL belongs to the same domain as the base URL."""
    return urlparse(url).netloc == urlparse(base).netloc

try:
    while to_visit:
        # Get the next URL to visit
        current_url = to_visit.pop()
        if current_url in visited:
            continue
        
        # Mark the URL as visited
        visited.add(current_url)
        
        # Navigate to the URL
        driver.get(current_url)
        
        # Wait for the page to load fully (adjust time as needed)
        time.sleep(2)
        
        # Find all anchor tags (<a>) on the page
        links = driver.find_elements(By.TAG_NAME, "a")
        
        # Extract href attributes and filter for internal URLs
        for link in links:
            href = link.get_attribute("href")
            if href and is_same_domain(href, base_url):
                full_url = urljoin(base_url, href)
                if full_url not in visited:
                    to_visit.add(full_url)

finally:
    # Clean up by closing the browser
    driver.quit()

# Output the collected URLs
print("Collected URLs:")
for url in sorted(visited):
    print(url)