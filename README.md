# Happening Now

## What is this?

I used [k-means clustering](https://en.wikipedia.org/wiki/K-means_clustering), a machine learning algorithm, to group tweets from the Obama administration. As this is an [unsupservised learning algorithm](https://en.wikipedia.org/wiki/Unsupervised_learning), I had next to no control over how the clusters would form, aside from some basic normalization (removing URL's, replacing hashtags with words, stemming, etc).

Once I had these clusters, I gave them group titles based on what I observed to be the most common concept.

I visualized the results using [d3](https://d3js.org/). You can see the work at [http://lieu.io/whitehouse-tweet-topics/](http://lieu.io/whitehouse-tweet-topics/).

The raw data dumps from Twitter are available in the repo [here](https://github.com/dereklieu/whitehouse-tweet-topics/tree/master/tool/raw). The scripts I ultimately used to do the classification, in addition to a few dead-ends, are [here](https://github.com/dereklieu/whitehouse-tweet-topics/tree/master/tool).

## Who am I?

I'm an engineer and designer working at [DevelopmentSeed](https://www.developmentseed.org/) in Washington DC. You can find me on [Twitter](http://twitter.com/dereklieu).
