'use strict'

import { resolve } from 'url'
import { json } from 'd3'
import  { basePath } from './config'

export function fetchAggregate (cb) {
  json(resolve(basePath, 'aggregate.json'), function (err, data) {
    if (err) {
      throw new Error(err)
    }
    cb(data)
  })
}
