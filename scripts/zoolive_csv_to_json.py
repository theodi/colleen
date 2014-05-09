import csv
import json
import sys
import os
from time import strptime, strftime, mktime

"""
A quick & dirty script to turn the Zooniverse classification csv files
into JSON files suitable for loading into Mongodb.

Output filename is same as input filename with '.csv' replaced with '.json'
Output file put in current directory, i.e. path of input file is ignored.

TODO: replace subject_id field with subject when we get that data.
"""

csvfilename = sys.argv[1]
maxoutputlines = 49999

inpath, infilename = os.path.split(csvfilename)
#output filename is .csv replaced with .json, put in current dir
basefilename = infilename.split('.')[-2] 
csvfile = open(csvfilename, 'r')

reader = csv.DictReader(csvfile)


def processline(line):
    location = {}
    result = {}
    # skip line if location data missing
    if (line['longitude'] == 'NULL') or (line['latitude'] == 'NULL'):
        return None
    location['latitude'] = float(line['latitude'])
    location['longitude'] = float(line['longitude'])
    location['country'] = line['country']
    location['city'] = line['city']
    result['location'] = location
    result['project'] = line['project']
    result['subject_id'] = line['subject_id']
#    timestamp = strftime("%Y-%m-%dT%H:%M:%SZ", strptime(line['created_at'],
#                                                        "%Y-%m-%d %H:%M:%S"))
    dt =strptime(line['created_at'], "%Y-%m-%d %H:%M:%S")
    timestamp = int(mktime(dt) * 1000)
    result['timestamp'] = {'$date' : timestamp}
    result['id'] = int(line['id'])
    result['user_id'] = int(line['user_id'])
    return result

def writeoutputtofile(output, basefilename, outputfilecount):
    jsonfilename = "%s-%02d.json" % (basefilename, outputfilecount)
    jsonfile = open(jsonfilename, 'w')
    json.dump(output, jsonfile, indent=0, sort_keys=True)
    jsonfile.close()

output = []
outputfilecount = 0

for line in reader:
    row = processline(line)
    if row:
        output.append(row)
    if len(output) > maxoutputlines:
        writeoutputtofile(output, basefilename, outputfilecount)
        output = []
        outputfilecount += 1

if len(output) > 0:
    writeoutputtofile(output, basefilename, outputfilecount)
        

