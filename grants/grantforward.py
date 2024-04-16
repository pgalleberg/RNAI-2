from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
from datetime import datetime
from openai import OpenAI
import time
import os
import csv 
import sys
import json
from logger_config import configure_logger
from utils import create_batches, num_tokens_from_string, delete_and_create_index, delete_files, fetch_grants
from dotenv import load_dotenv
import re

load_dotenv()

logger = configure_logger(__name__)

client = OpenAI(
    api_key = os.getenv("OPENAI_API_KEY")
)

data_directory = "./data/"

def fetch_data():
    chrome_options = Options()
    chrome_options.add_experimental_option("prefs", {
        "download.default_directory": data_directory,
        "download.prompt_for_download": False,  # To automatically save files to the specified directory without asking
        "download.directory_upgrade": True,
        "safebrowsing.enabled": True
    })
    chrome_options.add_argument("--headless")  # Enable headless mode

    driver = webdriver.Chrome(options=chrome_options)
    logger.info("Driver initialised")

    driver.get("https://www.grantforward.com")
    title = driver.title
    logger.info('Page title: {}'.format(title))

    driver.implicitly_wait(5)

    login_button = driver.find_element(By.CLASS_NAME, 'js-button-signin')
    login_button.click()
    logger.info("Login button clicked")

    # Locate the email input field by its ID and enter text
    email_input = driver.find_element(By.ID, "email")
    email_input.send_keys("syedhass@usc.edu")
    logger.info("Email entered")

    # Locate the email input field by its ID and enter text
    password_input = driver.find_element(By.ID, "password")
    password_input.send_keys("VCY9F@sNi2huiC3")
    logger.info("Password entered")

    login_button = driver.find_element(By.CLASS_NAME, 'js-signin-submit')
    login_button.click()
    logger.info("Login button clicked")

    time.sleep(5)

    new_url = 'https://www.grantforward.com/search'
    driver.get(new_url)
    driver.set_page_load_timeout(3000)  # Set page load timeout to 50 minutes
    logger.info("On the patents page")

    export_button = driver.find_element(By.CLASS_NAME, 'js-action-export')
    export_button.click()
    logger.info("Export button clicked")

    time.sleep(3)

    # csv_safe = driver.find_element(By.ID, 'csv-safe')
    # csv_safe.click()
    # logger.info("csv_safe option disabled")

    # JavaScript to update the radio button's attributes and label text
    js_script = """
    var radioButton = document.getElementById("num-10");
    radioButton.value = "40000";  // Update the value attribute
    """

    # Execute the script
    driver.execute_script(js_script)
    logger.info("JavaScript executed to add option to download all grants")

    export_button = driver.find_element(By.CLASS_NAME, 'js-export')
    start_time = time.time()
    export_button.click()
    logger.info("Export button clicked")
    end_time = time.time()
    logger.info("Total time taken for processing file: {} mins".format((end_time - start_time)/60))

    start_time = time.time()

    known_files = set(os.listdir(data_directory))

    while True:
        time.sleep(1)
        current_files = set(os.listdir(data_directory))
        new_files = current_files - known_files
        new_files = list(new_files)
        
        # Iterate over new files to check for a .csv file
        csv_found = False
        for file in new_files:
            if file.endswith(".csv"):
                logger.info(f"New .csv file detected: {file}")
                csv_found = True
                break  # Break the inner loop if a .csv file is found

        if csv_found:
            break  # Break the while loop if a .csv file is found

    end_time = time.time()
    logger.info("Total time taken for downloading file: {} mins".format((end_time - start_time)/60))

    driver.quit()
    logger.info("Closing the browser")

    return new_files[0]


def read_csv(file):
    # Specify the new column names mapping
    column_name_mapping = {
        'title': 'OpportunityTitle',
        'description': 'Description',
        'sponsors': 'AgencyName',
        'cfda': 'CFDANumbers',
        # 'deadlines': 'CloseDate',
        'amount_per_grant_max': 'AwardCeiling',
        'amount_per_grant_min': 'AwardFloor',
        'award_max': 'ExpectedNumberOfAwards',
        'eligibility': 'AdditionalInformationOnEligibility',
        'contacts': 'GrantorContactText',
        'status': 'type',
        # 'submit_date' : 'PostDate',
        # 'modified_date' : 'LastUpdatedDate'
    }

    csv.field_size_limit(sys.maxsize)
    logger.info("Reading file: {}".format(data_directory + file))
    with open(data_directory + file, mode='r', encoding='utf-8') as file:
        # Read the first line to get the original column names
        original_column_names = file.readline().strip().split(',')
        # Modify the column names based on your mapping
        modified_column_names = [column_name_mapping.get(name, name) for name in original_column_names]
        
        # Go back to the beginning of the file
        file.seek(0)

        # Create a csv.DictReader object with the modified column names
        csv_reader = csv.DictReader(file, fieldnames=modified_column_names)

        # Skip the original header row since we're providing custom fieldnames
        next(csv_reader)

        # Convert it to a list of dictionaries
        list_of_dicts = list(csv_reader)
        return list_of_dicts


def get_meta_data_size(grant):
    # Serialize metadata to a JSON string
    metadata_json = json.dumps(grant)

    # Calculate the size of the JSON string in bytes
    metadata_size = len(metadata_json.encode('utf-8'))

    logger.info(f"Metadata size: {metadata_size} bytes")

    if metadata_size > 40000:
        logger.info("Large grant detected")
        # logger.info(grant)
        logger.info('Description length: {}'.format(len(grant['Description'])))
        logger.info('AdditionalInformationOnEligibility length: {}'.format(len(grant['AdditionalInformationOnEligibility'])))
        logger.info('amount_info length: {}'.format(len(grant['amount_info'])))
        logger.info('submission_info length: {}'.format(len(grant['submission_info'])))
    
    return metadata_size


def create_embeddings(grants):
    start_time = time.time()
    num_tokens = 0
    grants_batch = []
    grants_records = []
    grants_to_insert = []

    i = 0
    num_tokens = 0
    while i < len(grants):
        grant_formatted = 'Title: ' + grants[i]['OpportunityTitle'] + "\nDescription: " + grants[i]['Description'][0:10240]
        num_tokens += num_tokens_from_string(grant_formatted, "cl100k_base")
        # get_meta_data_size(grants[i])
        logger.info("# of tokens in grant[{}]: {}".format(i, num_tokens_from_string(grant_formatted, "cl100k_base")))
        if num_tokens <= 8192:
            grants_batch.append(grant_formatted)
            grants[i]['source'] = 'GrantForward'
            
            contact_information = grants[i]['GrantorContactText'] + "\n"
            logger.info("contact_information: {}".format(contact_information))
            if "Phone:" in contact_information:
                phone = re.search(r"Phone: .*\n", contact_information).group()[7:-1]
                grants[i]['GrantorContactPhoneNumber'] = phone
    
            if "Fax:" in contact_information:
                fax = re.search(r"Fax: .*\n", contact_information).group()[5:-1]
                grants[i]['GrantorContactFax'] = fax
            
            if "Name:" in contact_information:
                name = re.search(r"Name: .*\n", contact_information).group()[6:-1]
                grants[i]['GrantorContactName'] = name

            if "Office:" in contact_information:
                office = re.search(r"Office: .*\n", contact_information).group()[8:-1]
                grants[i]['GrantorContactOffice'] = office
            
            if "Email:" in contact_information:
                email = re.search(r"Email: .*\n", contact_information).group()[7:-1]
                grants[i]['GrantorContactEmail'] = email

            logger.info("grants[i]['deadlines']: {}".format(grants[i]['deadlines']))
            if grants[i]['deadlines']:
                if ("Submission: " in grants[i]['deadlines']):
                    # date = grants[i]['deadlines'].rpartition("Submission: ")[-1]
                    pattern_submission = r"Submission: ([\w ,]+)"
                    date = re.findall(pattern_submission, grants[i]['deadlines'])[-1]
                elif ("Letter of Intent: " in grants[i]['deadlines']):
                    # date = grants[i]['deadlines'].rpartition("Letter of Intent: ")[-1]
                    pattern_loi = r"Letter of Intent: ([\w ,]+)"
                    date = re.findall(pattern_loi, grants[i]['deadlines'])[-1]

                logger.info("date: {}".format(date))
                formatted_date = datetime.strptime(date, "%B %d, %Y").strftime("%Y-%m-%d")
                logger.info("formatted_date: {}".format(formatted_date))
                logger.info("type(formatted_date): {}".format(type(formatted_date)))
                grants[i]['CloseDate'] = formatted_date
                
            else:
                grants[i]['CloseDate'] = "Continuous"

            logger.info("grants[i]['submit_date']: {}".format(grants[i]['submit_date']))
            if grants[i]['submit_date']:
                date = grants[i]['submit_date']
                formatted_date = datetime.strptime(date, "%B %d, %Y").strftime("%Y-%m-%d")
                logger.info("formatted_date: {}".format(formatted_date))
                grants[i]['PostDate'] = formatted_date
            
            logger.info("grants[i]['modified_date']: {}".format(grants[i]['modified_date']))
            if grants[i]['modified_date']:
                date = grants[i]['modified_date']
                formatted_date = datetime.strptime(date, "%B %d, %Y").strftime("%Y-%m-%d")
                logger.info("formatted_date: {}".format(formatted_date))
                grants[i]['LastUpdatedDate'] = formatted_date


            if get_meta_data_size(grants[i]) > 40960:

                if len(grants[i]['Description']) > 10240:
                    logger.info("truncating Description")
                    grants[i]['Description'] = grants[i]['Description'][0:10240]

                if len(grants[i]['AdditionalInformationOnEligibility']) > 10240:
                    logger.info("truncating AdditionalInformationOnEligibility")
                    grants[i]['AdditionalInformationOnEligibility'] = grants[i]['AdditionalInformationOnEligibility'][0:10240]

                if len(grants[i]['amount_info']) > 10240:
                    logger.info("truncating amount_info")
                    grants[i]['amount_info'] = grants[i]['amount_info'][0:10240]

                if len(grants[i]['submission_info']) > 10240:
                    logger.info("truncating submission_info")
                    grants[i]['submission_info'] = grants[i]['submission_info'][0:10240]

                if get_meta_data_size(grants[i]) > 40960:
                    logger.info("Still over limit after shortening")
                    logger.info(grants[i])
                    grants[i]['AdditionalInformationOnEligibility'] = grants[i]['AdditionalInformationOnEligibility'][0:5120]
                    grants[i]['amount_info'] = grants[i]['amount_info'][0:5120]
                    grants[i]['submission_info'] = grants[i]['submission_info'][0:5120]

            
            grants_records.append({
                'id': grants[i]['grantforward_url'].partition('grant_id=')[-1],
                'metadata': grants[i]
            })
            i+=1
        
        if num_tokens > 8192 or i == len(grants):
            if grants_batch != []: 
                logger.info("Creating embeddings for {} grants".format(len(grants_batch)))
                response = client.embeddings.create(
                    input=grants_batch,
                    model="text-embedding-3-small"
                )

                for index, object in enumerate(response.data):
                    grants_records[index]['values'] = object.embedding
                
                # insert_to_db(grants_records)
                grants_to_insert+=grants_records
                create_batches(grants_records)
                # i-=1 # so that we process the current item which caused us to go above 8192 again. 
                num_tokens = 0
                grants_batch = []
                grants_records = []
            else:
                logger.info("empty grants_batch received")
                i+=1
                num_tokens = 0
                grants_batch = []
                grants_records = []


    # create_batches(grants_to_insert)
    end_time = time.time()
    logger.info("total time: {} mins".format((end_time-start_time)/60))


def get_grants_grantforward():
    data_file_name = fetch_data()
    # data_file_name = "GrantForward - Search (April 03, 2024 07h 17m 19s).csv"
    grants = read_csv(data_file_name)
    delete_and_create_index()
    create_embeddings(grants)
    # delete_files()
    # fetch_grants('methane removal from ambient air')
