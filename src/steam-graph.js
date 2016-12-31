'use strict'

import { scaleLinear } from 'd3'
import { isElement } from 'lodash'

export function bind (container) {
  if (!isElement(container)) {
    throw new Error('Bind must be passed a node')
  }

  return function render (data) {
    const { width, height } = container.getBoundingClientRect()

    console.log(width, height)
    console.log(data)

    const properties = Object.keys(data).sort()
    const n = properties.length
    const x = scaleLinear()
  }
}

export function unbind (container) {
  if (!isElement(container)) {
    throw new Error('Bind must be passed a node')
  }
}
