'use strict'

require('../style/reset.scss')
require('../style/normalize.scss')
require('../style/page.scss')

import { bind } from './steam-graph'
import { fetchAggregate } from './fetch'

const renderSteamGraph = bind(document.getElementById('tweets'))
fetchAggregate(function (data) {
  const unbind = renderSteamGraph(data)
})
