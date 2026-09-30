from urllib.request import urlretrieve
from os.path import isfile
import regex as re
from tqdm import tqdm

if __name__ == "__main__":
    filename = "raw-wordlist.txt"
    if not isfile(filename):
        urlretrieve("https://github.com/IlyaSemenov/wikipedia-word-frequency/raw/refs/heads/master/results/enwiki-2023-04-13.txt", filename)
    
    min_letters = 3
    max_letters = 10
    min_appearences = 300

    words = []
    for i in range((max_letters - min_letters) + 1):
        words.append([])
    with open(filename, "r") as file:
        for line in tqdm(file):
            line_args = file.readline().split(' ')
        
            if int(line_args[1]) < min_appearences:
                break

            match = re.match("^[a-zA-Z]*", line_args[0]) 
            if match == None or match.group() != line_args[0]:
                continue

            if len(line_args[0]) < min_letters or len(line_args[0]) > max_letters:
                continue

            words[len(line_args[0]) - min_letters].append(line_args[0])

    for i in tqdm(range((max_letters - min_letters) + 1)):
        with open(f"wordlists/{i + min_letters}.txt", "w") as file:
            file.write("\n".join(words[i]))
            
