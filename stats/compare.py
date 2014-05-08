import json
import sys
import numpy as np
import matplotlib.pyplot as plt

"""
Parses out the part-file, the results of hadoop job
format follows the mortar recys code 
  first column is item id
  second column is recommendation id
"""
def parse_part_file(part_file):
    f = open(part_file, 'r')
    res = f.read()
    
    hashes = {}
    for row in res.split('\n'):
        try:
            item_id, recommendation_id = row.split('\t')[0:2]
            if not hashes.has_key(item_id):
              hashes[item_id] = {
                  'recommendations' : [],
                  'id' : item_id} 
            hashes[item_id]['recommendations'].append(recommendation_id)
        except:
            print 'error with: %s' % row
        
    return hashes 


def parse_json_control(control_file):
    f = open(control_file, 'r')
    res = f.read()

    recs = [json.loads(row) for row in res.split('\n') if row != '']
    control = {}
    for item in recs:
        control[item['id']] = { 
            'id' : item['id'],
            'recommendations' : item['recommendations']} 

    return control

def find_matches(a, b):
    matches = 0
    
    for i in a:
        for j in b:
            if j == i:
                matches += 1
                break
    return matches

def plot_array(arr):
    plt.hist(arr)
   
def run_comparison(test, control):
    results = []
    matches = []
    for key in test.keys():
        item = test[key]
        if control.has_key(item['id']):
            control_item = control[item['id']]
            match = find_matches(item['recommendations'],
                         control_item['recommendations'])
            results.append({
                'id' : item['id'],
                'matches': match}) 
            matches.append(match)
          

    return results, matches

def compare(part_file, control_file):
    test = parse_part_file(part_file)
    control = parse_json_control(control_file)
    results, matches = run_comparison(test, control)
    plot_array(matches)
    import pdb; pdb.set_trace()

if __name__ == "__main__":
    args = sys.argv 
    if len(args) != 3:
        print 'error with arguements'
        exit(1)
    compare(args[1], args[2])
