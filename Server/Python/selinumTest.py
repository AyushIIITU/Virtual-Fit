from selenium import webdriver
from selenium.webdriver.chrome.service import Service

service = Service("C:\\chromedriver\\chromedriver.exe")  # Double backslashes
 # Update with your correct path
options = webdriver.ChromeOptions()
driver = webdriver.Chrome(service=service, options=options)

driver.get("https://www.google.com")
print(driver.title)  # Should print "Google"
driver.quit()
