import json
import urllib2
import time
import datetime

# http://api.yummly.com/v1/api/recipes?_app_id=dae2b389&_app_key=15b86177872525882f38a34a0f7d77d2&maxResult=100

APPLICATION_ID = 'dae2b389'
APPLICATION_KEY = '15b86177872525882f38a34a0f7d77d2'
MAX_PER_CALL = 2000
BASE_URL = 'http://api.yummly.com/v1/api/recipes?_app_id=%s&_app_key=%s&maxResult=%s&start=%s'

def write_json_to_file(fi, json_obj):
    fi.write(json.dumps(json_obj))
    fi.write('\n')

def build_url(starts_at):
    return BASE_URL % (APPLICATION_ID, APPLICATION_KEY, MAX_PER_CALL, starts_at)

def request_json_data(starts_at):
    url = build_url(starts_at)
    req = urllib2.Request(url)
    response = urllib2.urlopen(req)
    data_str = response.read()
    return json.loads(data_str)
    
def main():
    # the yummly api has a start param that begins at 1
    starts_at = 1 
    total_match_count = None 

    with open('yummly-%s.json' % datetime.datetime.now().__str__().split(' ')[0],
              'w') as fi:
        while total_match_count == None or starts_at <= total_match_count:
            try:
                data = request_json_data(starts_at)
                total_match_count = data['totalMatchCount']
                for row in data['matches']:
                    write_json_to_file(fi, row)
                    starts_at = starts_at + 1
                print "starts_at: %s" % starts_at
                time.sleep(1)

            except KeyboardInterrupt:
                print "starts_at: %s" % starts_at
                print "exiting..."
                exit(1)
                
            except: 
                print "error:("



if __name__=='__main__':
    main()
    
    



