import logging
logging.basicConfig(format='%(asctime)s : %(levelname)s : %(message)s', level=logging.INFO)
from pprint import pprint
from nltk.corpus import stopwords
from nltk.tokenize import wordpunct_tokenize
from nltk.stem.porter import PorterStemmer
stemmer = PorterStemmer()

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.cluster import KMeans
from sklearn import metrics

import numpy as np

import json

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
    if word[0] == '@' or word == 'amp;' or word[0:2] == '.@' or word[0:4] == 'http':
        return False
    else:
        return True

raw = read_json('./output/flotus.json')

# only get the text for now (later I might need the tweet ids)
documents = [x['text'] for x in raw]

stoplist = set(stopwords.words('english'))
corpus = []
for sentence in documents:

    # filter out common twitter words like '.@', 'links, etc.
    sentence = ' '.join([word for word in sentence.lower().split() if validate_word(word)])

    # tokenize and remove stoplists, punctuation, random numbers.
    tokenized = [word for word in wordpunct_tokenize(sentence) if word not in stoplist and len(word) > 1]

    # stem, join, and append to list.
    corpus.append(' '.join([stemmer.stem(word) for word in tokenized]).encode('utf8'))

vectorizer = TfidfVectorizer()
X = vectorizer.fit_transform(corpus)
print X.shape

km = KMeans(n_clusters=10, max_iter=500)
km.fit(X)

clustered_labels = km.labels_
for idx, sentence in enumerate(documents):
    if clustered_labels[idx] == 0:
        print sentence
