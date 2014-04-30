import csv
import json
import sys
import os
from time import strptime, strftime

"""
A quick & dirty script to turn the Zooniverse classification csv files
into JSON files suitable for loading into Mongodb.

Output filename is same as input filename with '.csv' replaced with '.json'
Output file put in current directory, i.e. path of input file is ignored.

TODO: replace subject_id field with subject when we get that data.
"""

csvfilename = sys.argv[1]
inpath, infilename = os.path.split(csvfilename)
#output filename is .csv replaced with .json, put in current dir
jsonfilename = infilename.split('.')[-2] + '.json'
csvfile = open(csvfilename, 'r')
jsonfile = open(jsonfilename, 'w')
reader = csv.DictReader(csvfile)


def processline(line):
    location = {}
    result = {}
    location['latitude'] = float(line['latitude'])
    location['longitude'] = float(line['longitude'])
    location['country'] = line['country']
    location['city'] = line['city']
    result['location'] = location
    result['subject_id'] = line['subject_id']
    timestamp = strftime("%Y-%m-%dT%H:%M:%SZ", strptime(line['created_at'],
                                                        "%Y-%m-%d %H:%M:%S"))
    result['timestamp'] = timestamp
    result['id'] = int(line['id'])
    result['user_id'] = int(line['user_id'])
    return result


output = []

for line in reader:
    row = processline(line)
    output.append(row)

json.dump(output, jsonfile, sort_keys=True)
