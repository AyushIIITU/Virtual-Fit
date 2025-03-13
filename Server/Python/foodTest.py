import undetected_chromedriver as uc
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time
import os

def get_food_name_from_google(image_path):
    # Verify image exists
    absolute_image_path = os.path.abspath(image_path)
    if not os.path.exists(absolute_image_path):
        print(f"Error: Image not found at {absolute_image_path}")
        return []
    
    options = uc.ChromeOptions()
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    
    # Create an undetected ChromeDriver instance
    driver = uc.Chrome(options=options)

    try:
        # Open Google Images Search
        driver.get("https://www.google.com/imghp?hl=en")
        print("Google Images opened")
        
        # Accept cookies if the dialog appears (common in Europe)
        try:
            accept_button = WebDriverWait(driver, 3).until(
                EC.element_to_be_clickable((By.XPATH, "//button[contains(., 'Accept all')]"))
            )
            accept_button.click()
            print("Accepted cookies")
        except:
            print("No cookie dialog found or already accepted")
        
        # Click on the camera icon (search by image)
        try:
            # Try multiple possible selectors
            selectors = [
                "//div[@aria-label='Search by image']",
                "//div[@aria-label='Search by image' or @title='Search by image']",
                "//div[contains(@class, 'LM8x9c')]"  # Class name might change
            ]
            
            for selector in selectors:
                try:
                    search_button = WebDriverWait(driver, 5).until(
                        EC.element_to_be_clickable((By.XPATH, selector))
                    )
                    search_button.click()
                    print(f"Clicked search button using selector: {selector}")
                    break
                except:
                    continue
                    
            # Wait for file upload to be available
            upload_input = WebDriverWait(driver, 10).until(
                EC.presence_of_element_located((By.XPATH, "//input[@type='file']"))
            )
            upload_input.send_keys(absolute_image_path)
            print(f"Uploaded image: {absolute_image_path}")
            
            # Wait longer for Google to process the image and load results
            time.sleep(15)
            
            # Save a debug screenshot to see the current state
            driver.save_screenshot("debug_screenshot_results.png")
            print("Screenshot saved as debug_screenshot_results.png")
            
            # Combined results list
            food_names = []
            
            # Look for related searches (often contains food names)
            try:
                related_search_selectors = [
                    "//div[contains(text(), 'Related searches')]/following-sibling::div//a",
                    "//div[contains(@class, 'card-section')]//a",
                    "//div[contains(@aria-label, 'Search Result')]//a",
                    "//div[contains(text(), 'Related searches')]/following::a"
                ]
                
                for selector in related_search_selectors:
                    related_searches = driver.find_elements(By.XPATH, selector)
                    if related_searches:
                        print(f"Found {len(related_searches)} related searches with selector: {selector}")
                        related_texts = [result.text.strip() for result in related_searches if result.text.strip()]
                        food_names.extend(related_texts)
                        print(f"Related searches: {related_texts}")
                        break
            except Exception as e:
                print(f"Error finding related searches: {str(e)}")
                
            # Look for image descriptions/captions
            try:
                description_selectors = [
                    "//div[contains(@class, 'HePszc my5z3d ddBkwd AZxNrb yVCOtc CvgGZ t6uYac')]//span[contains(@class, 'Yt787')]",
                    "//img[@alt and string-length(@alt)>5]",
                    "//img[@title and string-length(@title)>5]",
                    "//div[contains(@class, 'fKDtNb')]",
                    "//div[contains(@data-attrid, 'title')]"
                ]
                
                for selector in description_selectors:
                    descriptions = driver.find_elements(By.XPATH, selector)
                    if descriptions:
                        print(f"Found {len(descriptions)} image descriptions with selector: {selector}")
                        desc_texts = []
                        for desc in descriptions:
                            if selector.startswith("//img"):
                                # Get alt or title attribute for image elements
                                text = desc.get_attribute("alt") or desc.get_attribute("title")
                            else:
                                # Get inner text for div elements
                                text = desc.text
                                
                            if text and len(text.strip()) > 3 and text.strip() != "Visually searched image":
                                desc_texts.append(text.strip())
                                
                        food_names.extend(desc_texts)
                        print(f"Image descriptions: {desc_texts}")
                        break
            except Exception as e:
                print(f"Error finding image descriptions: {str(e)}")
            
            # Original selectors as fallback
            if not food_names:
                result_selectors = [
                    "//h3",
                    "//div[contains(@class, 'UAiK1e')]//div",
                    "//div[contains(@class, 'fKDtNb')]",
                ]
                
                for selector in result_selectors:
                    search_results = driver.find_elements(By.XPATH, selector)
                    if len(search_results) > 0:
                        print(f"Found {len(search_results)} results with selector: {selector}")
                        texts = [result.text for result in search_results if result.text and len(result.text) > 3]
                        if texts:
                            food_names.extend(texts)
            
            # Remove duplicates and take first 3
            unique_food_names = list(dict.fromkeys([name for name in food_names if name]))
            print("All found names:", unique_food_names)
            
            if not unique_food_names:
                print("No food names found in any source")
                print("Page URL:", driver.current_url)
                return []
                
            return unique_food_names[:3]
            
        except Exception as e:
            print(f"Error during search: {str(e)}")
            driver.save_screenshot("error_screenshot.png")
            return []

    finally:
        driver.quit()

# Example usage
image_path = "test-2.jpeg"
food_names = get_food_name_from_google(image_path)
print("Possible Food Names:", food_names)