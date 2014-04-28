import json
import argparse

parser = argparse.ArgumentParser()
parser.add_argument("fieldname", help="name of field to delete from objects")
parser.add_argument("jsonfile", help="input json file to be modified")
"""
TODO: figure out how to make argparse treat the --test flag like it does
--help, i.e. don't require the positional arguments when using it.
"""
parser.add_argument("-t", "--test", help="run doctest", action="store_true")

args = parser.parse_args()


def delete_field(fieldname,data):
    """
    delete all instances of a fieldname from the dict (note: only works on top 
    level dict, won't removed from nested dicts)

    Example:

    >>> datain = json.loads('[{"id": 179693, "location": {"city": "", "country": "NL", "latitude": 52.5, "longitude": 5.75}, "project": "condor", "subject": "http://www.condorwatch.org/subjects/standard/534c4b87d31eae05430681ef.JPG", "timestamp": "2014-04-16T15:12:22Z", "user": "kiske1", "user_id": 274343}, {"id": 179692, "location": {"city": "", "country": "BE", "latitude": 50.8333, "longitude": 4.0}, "project": "galaxy_zoo", "subject": "http://www.galaxyzoo.org/subjects/standard/524482bb3ae74054bf004131.jpg", "timestamp": "2014-04-16T15:12:21Z", "user": "thijsdeetens", "user_id": 1682882}]')
    >>> dataout = delete_field('user',datain)
    >>> print json.dumps(dataout, sort_keys=True)
    [{"id": 179693, "location": {"city": "", "country": "NL", "latitude": 52.5, "longitude": 5.75}, "project": "condor", "subject": "http://www.condorwatch.org/subjects/standard/534c4b87d31eae05430681ef.JPG", "timestamp": "2014-04-16T15:12:22Z", "user_id": 274343}, {"id": 179692, "location": {"city": "", "country": "BE", "latitude": 50.8333, "longitude": 4.0}, "project": "galaxy_zoo", "subject": "http://www.galaxyzoo.org/subjects/standard/524482bb3ae74054bf004131.jpg", "timestamp": "2014-04-16T15:12:21Z", "user_id": 1682882}]

    Test that function only removes top level fields and ignores fields in 
    nested dicts (may want to change this behaviour later):

    >>> datain = json.loads('[{"id": 179693, "location": {"city": "", "country": "NL", "latitude": 52.5, "longitude": 5.75}, "project": "condor", "subject": "http://www.condorwatch.org/subjects/standard/534c4b87d31eae05430681ef.JPG", "timestamp": "2014-04-16T15:12:22Z", "user": "kiske1", "user_id": 274343}, {"id": 179692, "location": {"city": "", "country": "BE", "latitude": 50.8333, "longitude": 4.0}, "project": "galaxy_zoo", "subject": "http://www.galaxyzoo.org/subjects/standard/524482bb3ae74054bf004131.jpg", "timestamp": "2014-04-16T15:12:21Z", "user": "thijsdeetens", "user_id": 1682882}]')
    >>> dataout = delete_field('city',datain)
    >>> print json.dumps(dataout, sort_keys=True)
    [{"id": 179693, "location": {"city": "", "country": "NL", "latitude": 52.5, "longitude": 5.75}, "project": "condor", "subject": "http://www.condorwatch.org/subjects/standard/534c4b87d31eae05430681ef.JPG", "timestamp": "2014-04-16T15:12:22Z", "user": "kiske1", "user_id": 274343}, {"id": 179692, "location": {"city": "", "country": "BE", "latitude": 50.8333, "longitude": 4.0}, "project": "galaxy_zoo", "subject": "http://www.galaxyzoo.org/subjects/standard/524482bb3ae74054bf004131.jpg", "timestamp": "2014-04-16T15:12:21Z", "user": "thijsdeetens", "user_id": 1682882}]
    """
    result = []
    for item in data:
        item.pop(fieldname, None)
        result.append(item)
    return result

if args.test:
    import doctest
    doctest.testmod()
else:
    infile = open(args.jsonfile)
    datain = json.load(infile)
    dataout = delete_field(args.fieldname, datain)
    print json.dumps(dataout, sort_keys=True)
    infile.close()






