'use strict'

require('../style/reset.scss')
require('../style/normalize.scss')
require('../style/page.scss')

import d3 from 'd3'
import { bind, unbind } from './steam-graph'

console.log('obama')

const renderSteamGraph = bind(document.getElementById('tweets'))
renderSteamGraph()
