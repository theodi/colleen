import string, json, pprint
import requests
import mysql.connector
import time, datetime
import logging
import logging.config

logging.config.fileConfig('logging.conf')
logger = logging.getLogger('fetchandstore')


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
    logger.info('response text was %s' % response.text)
    return response.json()

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
    projects = ['solar_stormwatch']
#    duration = 5 * 60 * 1000  # 5 minutes in milliseconds
    duration = 60 * 60 * 24 * 31 * 1000# a month in millisenconds
    per_page = 2000
    page = 1


    con = mysql.connector.connect(host='localhost',user='colleen',password='galaxy',database='zoon')
    headers = {'X_REQUESTED_WITH': 'XMLHttpRequest', 
               'ACCEPT': 'application/vnd.zooevents.v1+json',}

    for project in projects:
#        start_time = get_max_created_at_by_project(con, project)
        start_time = 1398698567000
        logger.info("max_created_at for %s is %d" % (project, start_time))
        end_time = start_time + duration
        zoon_api_request_url = 'http://event.zooniverse.org/classifications/%s' % project
        payload = {'from': start_time, 'to': end_time, 'per_page': per_page, 'page': page}
        logger.info("requesting %s from %d" % (zoon_api_request_url, start_time))
        json_obj = get_json_from_api(zoon_api_request_url, payload, headers)
        logger.info("got json from api")
        data = json_to_tuples(json_obj, project)
        logger.info("converted json to tuples")
        insert_tuples(con, data)
        logger.info("inserted tuples into db")
        
    con.close()
    con.disconnect()

if __name__ == '__main__':
    thewholeshebang()

