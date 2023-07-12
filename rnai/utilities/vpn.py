import os, subprocess, re, random

def checkConnection():
    print("checkConnection connection!")
    cmd = ['nordvpn', 'c']
    proc = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    o, e = proc.communicate()
    if "Connected" in o.decode('ascii'):
        return True
    else:
        return False
    
def getCountries():
    """
    This function will return a list of the current countries with available servers for your nordvpn account.
    """
    nord_output = subprocess.Popen(["nordvpn", "countries"], stdout=subprocess.PIPE)
    countries = re.split("[\t \n]", nord_output.communicate()[0].decode("utf-8"))
    while "" in countries:
        countries.remove("")
    return countries

def chooseRandom(country_list):
    """
    This function will randomly choose a country out of the available countries list.
    """
    return country_list[random.randrange(0, len(country_list))]

def logIn():
    # subprocess.call(["nordvpn", "c", random_country])
    random_country = chooseRandom(getCountries())
    cmd = ["nordvpn", "c", random_country]
    proc = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    o, e = proc.communicate()
    if "Whoops! We couldn't connect you" in o.decode('ascii'):
        logIn()