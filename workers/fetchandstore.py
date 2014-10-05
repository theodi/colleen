from ConfigParser import SafeConfigParser
import string, json, pprint
import requests
import mysql.connector
import time, datetime
import logging
import logging.config
import os
import urlparse


parser = SafeConfigParser()
parser.read('fetchandstore.conf')
# test that conf file successfully read
# assign values to variables
logging.config.fileConfig(parser.get('DEFAULT','logging_conf_file'))
logger = logging.getLogger('fetchandstore')
dateformat = "%a %b %d %H:%M:%S %Y"
pp = pprint.PrettyPrinter(indent=4)

def construct_values_tuple(project, dict):
    id = dict[u'id']
    created_at = dict[u'created_at']
    user_id = dict[u'user_id']
    country = dict[u'country_code']
    region = 'NULL'
    city = dict[u'city_name']
    latitude = dict[u'latitude']
    longitude = dict[u'longitude']

    return (id, created_at, user_id, project, country, 
            region, city, latitude, longitude)

def get_max_created_at_by_project(con, project):

    cursor = con.cursor()    
    max_created_at_query = ("SELECT MAX(created_at) from classifications where project= %s")
    result = cursor.execute(max_created_at_query, (project,))
    created_at = cursor.fetchone()[0]
    cursor.close()

    if created_at is  None:
        return None
    else:
        return time.mktime(created_at.timetuple()) * 1000


def get_json_from_api(zoon_api_request_url, payload, headers):
    
    logger.info('zoon_api_request_url is %s' % zoon_api_request_url)
    logger.info('payload is %s' % payload)
    response = requests.get(zoon_api_request_url, params=payload, headers=headers)
    logger.info('response code was %d' % response.status_code)
#    logger.info('response text was %s' % response.text)
    if response.status_code == 200:
        return response.json()
    else:
        return None

def get_json_from_file(filepath):

    infile = open(filepath, 'r')
    json_string = infile.read()
    json_obj = json.loads(json_string)
    return json_obj
    

def json_to_tuples(json, project):
    tuples_to_insert = []
    for classification in json:
        tuples_to_insert.append(construct_values_tuple(project, classification))
    logger.info("there are %d tuples to insert" % len(tuples_to_insert))
    return tuples_to_insert

def insert_tuples(con,data):
# data is list of tuples
    insert = ("INSERT IGNORE into classifications (id, created_at, user_id, project, country, region, city, latitude, longitude) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)")
    cursor = con.cursor()
    for t in data:
        cursor.execute(insert, t)

    con.commit()
    cursor.close()
# maybe check for errors, perhaps?


def thewholeshebang():
#    projects = ['cyclone_center', 'galaxy_zoo', 'mergers', 'milky_way_project', 'moon_zoo', 'planet_hunters', 'sea_floor_explorer', 'solar_storm_watch', 'whalefm']
    projects = get_json_from_file(parser.get('DEFAULT','projects_file'))
    logger.info("read projects list from %s: %s" % (parser.get('DEFAULT','projects_file'),projects))
    duration = parser.getint('DEFAULT','duration')
    per_page = parser.getint('DEFAULT','per_page')
    page = parser.getint('DEFAULT','page')
    mysql_url_env = parser.get('DEFAULT','mysql_url_env')
    mysql_url = os.environ[mysql_url_env]
    mysql_config = urlparse.urlparse(mysql_url)
    logger.info("connecting hostname: %s, user: %s, password: %s, db: %s" % (mysql_config.hostname,mysql_config.username,mysql_config.password,mysql_config.path[1:]))
    con = mysql.connector.connect(host=mysql_config.hostname,user=mysql_config.username,password=mysql_config.password,database=mysql_config.path[1:])
    headers = {'X_REQUESTED_WITH': 'XMLHttpRequest', 
               'ACCEPT': 'application/vnd.zooevents.v1+json',}

    for project in projects:
        start_time = get_max_created_at_by_project(con, project)
        if start_time is None:
            logger.info("setting start_time to a month ago")
            start_time = int(round(time.time() * 1000)) - duration
        else:
            start_time = int(start_time)
        logger.info("max_created_at for %s is %d (%s)" % (project, start_time, datetime.datetime.fromtimestamp(start_time/1000).strftime(dateformat)))
        end_time = int(start_time + duration)
        zoon_api_request_url = '%s/%s' % (parser.get('DEFAULT','zoon_api_request_url'),project)
        payload = {'from': start_time, 'to': end_time, 'per_page': per_page, 'page': page}
        logger.info("requesting %s from %s to %s" % (zoon_api_request_url, datetime.datetime.fromtimestamp(start_time/1000).strftime(dateformat), datetime.datetime.fromtimestamp(end_time/1000).strftime(dateformat)))
        json_obj = get_json_from_api(zoon_api_request_url, payload, headers)
        if json_obj is None:
            continue
        logger.info("got json from api")
        data = json_to_tuples(json_obj, project)
        logger.info("converted json to tuples")
        firstitemdate = pp.pformat(data[0][1])
        lastitemdate =  pp.pformat(data[len(data)-1][1])
        logger.info("date range for data is from %s to %s" % (lastitemdate, firstitemdate))
        logger.info("first data item is: %s" % pp.pformat(data[0]))
        insert_tuples(con, data)
        logger.info("inserted %d tuples from %s into db" % (len(data), project))
        
    con.close()
    con.disconnect()

if __name__ == '__main__':
    thewholeshebang()

