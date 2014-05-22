import string, json, pprint
import requests

def get_start_time():
    # TODO get most recent created_at from database
    # as milliseconds since epoch
    return start_time

def get_end_time():
    return end_time

def construct_values_tuple(project, dict):
    id = dict[u'id']
    created_at = dict[u'created_at']
    user_id = dict[u'user_id']
    country = dict[u'country_code']
#    region = dict[u'region']
    region = 'NULL'
    city = dict[u'city_name']
    latitude = dict[u'latitude']
    longitude = dict[u'longitude']

    return (id, created_at, user_id, project, country, 
            region, city, latitude, longitude)

project = 'cyclone_center'
zoon_api_request_url = 'http://event.zooniverse.org/classifications/%s' % project
start_time = 1399939200000
end_time = 1400025600000

per_page = 2
page = 1

payload = {'from': start_time, 'to': end_time, 'per_page': per_page, 'page': page}
headers = {'X_REQUESTED_WITH': 'XMLHttpRequest', 
           'ACCEPT': 'application/vnd.zooevents.v1+json',}

response = requests.get(zoon_api_request_url, params=payload, headers=headers)
print response.url
pp = pprint.PrettyPrinter(indent=3)
for classification in response.json():
#    pp.pprint(classification)
    print construct_values_tuple(project, classification)

print 'RESPONSE:', response

