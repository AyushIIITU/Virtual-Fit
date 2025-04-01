from selenium import webdriver
from selenium.webdriver.common.by import By
from urllib.parse import urljoin, urlparse
import time

# Set the base URL of your React app
base_url = "http://localhost:5173"

# Initialize data structures
visited = set()          # Tracks URLs already visited
to_visit = {base_url}    # URLs to visit, starting with base_url
incoming_links = {}      # Dictionary mapping each URL to a list of URLs that link to it
error_pages = set()      # Stores URLs that contain the error message

# Set up the Selenium WebDriver
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
        
        # Wait for the page to load (2 seconds may need adjustment for your app)
        time.sleep(2)
        
        # Check for the error message using XPath
        error_elements = driver.find_elements(
            By.XPATH,
            '//h2[@class="text-3xl text-center font-bold mt-5 mb-5" and contains(text(), "OOPS! Page not Found")]'
        )
        if error_elements:
            error_pages.add(current_url)
        
        # Find all anchor tags (<a>) on the page
        links = driver.find_elements(By.TAG_NAME, "a")
        
        # Extract href attributes and process internal URLs
        for link in links:
            href = link.get_attribute("href")
            if href and is_same_domain(href, base_url):
                full_url = urljoin(base_url, href)
                # Record the current URL as a source for this link
                if full_url not in incoming_links:
                    incoming_links[full_url] = [current_url]
                elif current_url not in incoming_links[full_url]:
                    incoming_links[full_url].append(current_url)
                # Add to to_visit if not yet visited
                if full_url not in visited:
                    to_visit.add(full_url)

finally:
    # Ensure the browser closes even if an error occurs
    driver.quit()

# Output the results
print("Error pages and their sources:")
if error_pages:
    for error_page in sorted(error_pages):
        print(f"Error page: {error_page}")
        if error_page in incoming_links:
            print("Sources:")
            for source in incoming_links[error_page]:
                print(f" - {source}")
        else:
            print("No sources found (possibly accessed directly or the base URL)")
else:
    print("No error pages found.")