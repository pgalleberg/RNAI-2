import logging
import os

def configure_logger(name):
    os.makedirs('./logs', exist_ok=True)
    logger = logging.getLogger(name)
    if not logger.handlers:
        logger.setLevel(logging.DEBUG)
        file_handler = logging.FileHandler('./logs/grants.log')
        file_handler.setFormatter(logging.Formatter('%(asctime)s %(funcName)s::%(message)s'))
        logger.addHandler(file_handler)
    return logger
