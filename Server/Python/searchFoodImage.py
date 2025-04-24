import undetected_chromedriver as uc
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time
import os
import atexit

def close_driver(driver):
    try:
        driver.quit()
    except Exception as e:
        print(f"Error while quitting driver: {e}")


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
    atexit.register(lambda: close_driver(driver))
    try:
        # Open Google Images Search
        driver.get("https://www.google.com/imghp?hl=en")
        # print("Google Images opened")
        
        # Accept cookies if the dialog appears
        # try:
        #     accept_button = WebDriverWait(driver, 3).until(
        #         EC.element_to_be_clickable((By.XPATH, "//button[contains(., 'Accept all')]"))
        #     )
        #     accept_button.click()
        #     # print("Accepted cookies")
        # except:
        #     print("No cookie dialog found or already accepted")
        
        # Click on the camera icon (search by image)
        try:
            search_button = WebDriverWait(driver, 5).until(
                EC.element_to_be_clickable((By.XPATH, "//div[@aria-label='Search by image']"))
            )
            search_button.click()
            # print("Clicked search button")
                    
            # Upload the image
            upload_input = WebDriverWait(driver, 10).until(
                EC.presence_of_element_located((By.XPATH, "//input[@type='file']"))
            )
            upload_input.send_keys(absolute_image_path)
            # print(f"Uploaded image: {absolute_image_path}")
            
            # Wait longer for Google to process the image and load results
            time.sleep(10)

            # Take a debug screenshot
            driver.save_screenshot("debug_screenshot_results.png")
            # print("Screenshot saved as debug_screenshot_results.png")
            
            # Extract related searches
            related_searches = []
            try:
                related_search_divs = WebDriverWait(driver, 10).until(
                    EC.presence_of_all_elements_located((By.CLASS_NAME, "I9S4yc"))
                )
                related_searches = [div.text.strip() for div in related_search_divs if div.text.strip()]
                # print(f"Related Searches: {related_searches}")
            except Exception as e:
                print(f"Related Searches section not found: {e}")
            
            # Extract first five image descriptions
            descriptions = []
            try:
                description_divs = WebDriverWait(driver, 10).until(
                    EC.presence_of_all_elements_located((By.CLASS_NAME, "Yt787"))
                )
                descriptions = [div.text.strip() for div in description_divs if div.text.strip()][:5]
                # print(f"Image Descriptions: {descriptions}")
            except Exception as e:
                print(f"Image Descriptions section not found: {e}")

            return related_searches + descriptions
            
        except Exception as e:
            # print(f"Error during search: {str(e)}")
            driver.save_screenshot("error_screenshot.png")
            return []

    finally:
        try:
            driver.close()  # Close the current tab
            driver.quit()   # Quit the browser
        except Exception as e:
            print(f"Error while closing driver: {e}")


# Example usage
# image_path = "testingFood.webp"
# result = get_food_name_from_google(image_path)
# print("Final Output:", result)
