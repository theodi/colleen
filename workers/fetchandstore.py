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
    
    response = requests.get(zoon_api_request_url, params=payload, headers=headers)
    return respose.json()

def get_json_from_file(filepath):

    infile = open(filepath, 'r')
    json_string = infile.read()
    json_obj = json.loads(json_string)
    return json_obj
    

def json_to_tuples(json, project):
    tuples_to_insert = []
    for classification in json:
        tuples_to_insert.append(construct_values_tuple(project, classification))
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
    projects = ['cyclone_center', 'galaxy_zoo', 'mergers', 'milky_way_project', 'moon_zoo', 'planet_hunters', 'sea_floor_explorer', 'solar_storm_watch', 'whalefm']
    duration = 5 * 60 * 1000  # 5 minutes in milliseconds
    per_page = 32
    page = 1

    test_tuples = [(3425, u'2014-05-13T17:26:51Z', u'1473377', 'cyclone_center', u'US', 'NULL', u'Asheville', 35.647293, -82.5512), (3416, u'2014-05-13T17:26:46Z', u'1473377', 'cyclone_center', u'US', 'NULL', u'Asheville', 35.647293, -82.5512), (3417, u'2014-05-13T17:26:41Z', u'1473377', 'cyclone_center', u'US', 'NULL', u'Asheville', 35.647293, -82.5512), (3418, u'2014-05-13T17:26:37Z', u'1473377', 'cyclone_center', u'US', 'NULL', u'Asheville', 35.647293, -82.5512), (3419, u'2014-05-13T17:26:33Z', u'1473377', 'cyclone_center', u'US', 'NULL', u'Asheville', 35.647293, -82.5512), (3420, u'2014-05-13T17:26:29Z', u'1473377', 'cyclone_center', u'US', 'NULL', u'Asheville', 35.647293, -82.5512), (3412, u'2014-05-13T17:26:16Z', u'1473377', 'cyclone_center', u'US', 'NULL', u'Asheville', 35.647293, -82.5512), (3411, u'2014-05-13T17:26:13Z', u'1473377', 'cyclone_center', u'US', 'NULL', u'Asheville', 35.647293, -82.5512), (3413, u'2014-05-13T17:26:12Z', u'1473377', 'cyclone_center', u'US', 'NULL', u'Asheville', 35.647293, -82.5512), (3414, u'2014-05-13T17:26:08Z', u'1473377', 'cyclone_center', u'US', 'NULL', u'Asheville', 35.647293, -82.5512), (3415, u'2014-05-13T17:25:57Z', u'1473377', 'cyclone_center', u'US', 'NULL', u'Asheville', 35.647293, -82.5512), (3406, u'2014-05-13T17:25:55Z', u'1473377', 'cyclone_center', u'US', 'NULL', u'Asheville', 35.647293, -82.5512), (3407, u'2014-05-13T17:25:46Z', u'1473377', 'cyclone_center', u'US', 'NULL', u'Asheville', 35.647293, -82.5512), (3410, u'2014-05-13T17:25:42Z', u'1473377', 'cyclone_center', u'US', 'NULL', u'Asheville', 35.647293, -82.5512), (3408, u'2014-05-13T17:25:42Z', u'1473377', 'cyclone_center', u'US', 'NULL', u'Asheville', 35.647293, -82.5512), (3409, u'2014-05-13T17:25:39Z', u'1473377', 'cyclone_center', u'US', 'NULL', u'Asheville', 35.647293, -82.5512), (3402, u'2014-05-13T17:25:29Z', u'1473377', 'cyclone_center', u'US', 'NULL', u'Asheville', 35.647293, -82.5512), (3401, u'2014-05-13T17:25:27Z', u'1473377', 'cyclone_center', u'US', 'NULL', u'Asheville', 35.647293, -82.5512), (3403, u'2014-05-13T17:25:18Z', u'1473377', 'cyclone_center', u'US', 'NULL', u'Asheville', 35.647293, -82.5512), (3404, u'2014-05-13T17:25:14Z', u'1473377', 'cyclone_center', u'US', 'NULL', u'Asheville', 35.647293, -82.5512), (3405, u'2014-05-13T17:25:08Z', u'1473377', 'cyclone_center', u'US', 'NULL', u'Asheville', 35.647293, -82.5512), (3396, u'2014-05-13T17:25:01Z', u'1473377', 'cyclone_center', u'US', 'NULL', u'Asheville', 35.647293, -82.5512), (3397, u'2014-05-13T17:24:50Z', u'1473377', 'cyclone_center', u'US', 'NULL', u'Asheville', 35.647293, -82.5512), (3398, u'2014-05-13T17:24:19Z', u'1473377', 'cyclone_center', u'US', 'NULL', u'Asheville', 35.647293, -82.5512), (3399, u'2014-05-13T17:23:58Z', u'1473377', 'cyclone_center', u'US', 'NULL', u'Asheville', 35.647293, -82.5512), (3400, u'2014-05-13T17:23:41Z', u'1473377', 'cyclone_center', u'US', 'NULL', u'Asheville', 35.647293, -82.5512), (3391, u'2014-05-13T17:23:27Z', u'1473377', 'cyclone_center', u'US', 'NULL', u'Asheville', 35.647293, -82.5512), (3392, u'2014-05-13T17:23:13Z', u'1473377', 'cyclone_center', u'US', 'NULL', u'Asheville', 35.647293, -82.5512), (3393, u'2014-05-13T17:23:09Z', u'1473377', 'cyclone_center', u'US', 'NULL', u'Asheville', 35.647293, -82.5512), (3394, u'2014-05-13T17:22:57Z', u'1473377', 'cyclone_center', u'US', 'NULL', u'Asheville', 35.647293, -82.5512), (3395, u'2014-05-13T17:22:53Z', u'1473377', 'cyclone_center', u'US', 'NULL', u'Asheville', 35.647293, -82.5512), (3386, u'2014-05-13T17:22:50Z', u'1473377', 'cyclone_center', u'US', 'NULL', u'Asheville', 35.647293, -82.5512)]

    con = mysql.connector.connect(host='localhost',user='colleen',password='galaxy',database='zoon')
    headers = {'X_REQUESTED_WITH': 'XMLHttpRequest', 
               'ACCEPT': 'application/vnd.zooevents.v1+json',}

    for project in projects:
        start_time = get_max_created_at_by_project(con, project)
        logger.info("max_created_at for %s is %d" % (project, start_time))
        end_time = start_time + duration
        zoon_api_request_url = 'http://event.zooniverse.org/classifications/%s' % project
        payload = {'from': start_time, 'to': end_time, 'per_page': per_page, 'page': page}
        logger.info("requesting %s from %d" % (zoon_api_request_url, start_time))
        #    json = get_json_from_api(zoon_api_request_url, payload, headers)
        #    data = json_to_tuples(json, project)
        #    insert_tuples(con, data)
        
    con.close()
    con.disconnect()

if __name__ == '__main__':
    thewholeshebang()

