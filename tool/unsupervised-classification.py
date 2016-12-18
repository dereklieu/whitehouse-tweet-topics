import re
from pprint import pprint
from nltk.corpus import stopwords
from nltk.tokenize import wordpunct_tokenize
from nltk.stem.porter import PorterStemmer
stemmer = PorterStemmer()

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.cluster import KMeans
from sklearn import metrics

#import matplotlib.pyplot as plt
#import numpy as np
import json

K = 10

# read json as native structure
def read_json(filename):
    with open(filename) as f:
        d = json.load(f)
    return d


# write json to filename
def write_json(filename, data):
    with open(filename, 'w') as f:
        json.dump(data, f)


def validate_word(word):
    if word[0] == '@' or word == 'amp;' or word[0:2] == '.@':
        return False
    else:
        return True

raw = read_json('./output/whitehouse.json')

# only get the text for now (later I might need the tweet ids)
documents = [x['text'] for x in raw]

stoplist = set(stopwords.words('english'))
corpus = []
for tweet in documents:

    tweet = tweet.lower()

    # convert www.* or https?://* to URL
    tweet = re.sub('((www\.[^\s]+)|(https?://[^\s]+))','URL',tweet)

    # replace #word with word
    tweet = re.sub(r'#([^\s]+)', r'\1', tweet)

    # trim
    tweet = tweet.strip('\'"')

    # filter out common twitter words like '.@', 'links, etc.
    tweet = ' '.join([word for word in tweet.split() if validate_word(word)])

    # tokenize and remove stoplists, punctuation, random numbers.
    tokenized = [word for word in wordpunct_tokenize(tweet) if word not in stoplist and len(word) > 1]

    # stem, join, and append to list.
    corpus.append(' '.join([stemmer.stem(word) for word in tokenized]).encode('utf8', 'ignore'))

# vectorize using tfidf
vectorizer = TfidfVectorizer()
X = vectorizer.fit_transform(corpus)
print X.shape

km = KMeans(n_clusters=K, max_iter=500)
km.fit(X)

clustered_labels = km.labels_
aggregate = [[] for i in range(0, K)]
for idx, label in enumerate(clustered_labels):
    raw_data = raw[idx]

    # only need the first part, ie 2016-11-12
    tweeted_at = raw_data['timestamp'].split(' ')[0].split('-')
    result = {}
    result['text'] = raw_data['text'].encode('utf-8', 'ignore')
    result['corpus'] = corpus[idx]
    result['id'] = raw_data['tweet_id']
    result['year'] = tweeted_at[0]
    result['month'] = tweeted_at[1]
    result['day'] = tweeted_at[2]
    aggregate[label].append(result)

write_json('output/categorized.json', aggregate)
