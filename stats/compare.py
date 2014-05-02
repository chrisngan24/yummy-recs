def parse_part_file(part_file):
    f = open(part_file, 'r')
    res = f.read()

    return res
    

def compare(part_file):
    test_results = parse_part_file(part_file)
    import pdb; pdb.set_trace()

if __name__ == "__main__":
    compare('part-r-00000')
