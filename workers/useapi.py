import string, json, pprint
import requests
import time, datetime
import logging
import logging.config
import os
import urlparse

# test that conf file successfully read
# assign values to variables
logging.config.fileConfig('useapi_logging.conf')
logger = logging.getLogger('useapi')
dateformat = "%a %b %d %H:%M:%S %Y"
pp = pprint.PrettyPrinter(indent=4)



def get_json_from_api(zoon_api_request_url, payload, headers):
    
    logger.info('zoon_api_request_url is %s' % zoon_api_request_url)
    logger.info('payload is %s' % payload)
    response = requests.get(zoon_api_request_url, params=payload, headers=headers)
    logger.info('response code was %d' % response.status_code)
    logger.info('response text was %s' % response.text)
    if response.status_code == 200:
        return response.json()
    else:
        return None

                          


def thewholeshebang():
# a day in microseconds                        
    duration = 60 * 60 * 24 * 1000
    per_page = 2000
    project = 'asteroid'
    now_ms = int(round(time.time() * 1000))
    yesterday_ms = now_ms - duration

    zoon_api_request_url = 'http://event.zooniverse.org/classifications'

    headers = {'X_REQUESTED_WITH': 'XMLHttpRequest', 
               'ACCEPT': 'application/vnd.zooevents.v1+json',}


    start_time = yesterday_ms
    end_time = now_ms
    full_zoon_api_request_url = '%s/%s' % (zoon_api_request_url, project)

    while (start_time <= now_ms):
        page = 0
        num_results = per_page
        while (num_results == per_page):
            payload = {'from': start_time, 'to': end_time, 'per_page': per_page, 'page': page}
            logger.info("requesting %s from %s to %s" % (full_zoon_api_request_url, datetime.datetime.fromtimestamp(start_time/1000).strftime(dateformat), datetime.datetime.fromtimestamp(end_time/1000).strftime(dateformat)))
            json_obj = get_json_from_api(full_zoon_api_request_url, payload, headers)
            if json_obj is None:
                num_results = 0
                logger.info("api request returned nothing")
            else: 
                num_results = len(json_obj)
                logger.info("got json from api there are %d classifications" % num_results)
            page+=1

            start_time+=duration
            end_time+=duration

#    firstitemdate = pp.pformat(json_obj[0]['created_at'])
#    lastitemdate = pp.pformat(json_obj[len(json_obj)-1]['created_at'])
#    logger.info("date range for json_obj is from %s to %s" % (lastitemdate, firstitemdate))
#        logger.info("first json_obj item is: %s" % pp.pformat(json_obj))

if __name__ == '__main__':
    thewholeshebang()

