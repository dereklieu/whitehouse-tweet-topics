'use strict'

import { isElement } from 'lodash'

export function bind (container) {
  if (!isElement(container)) {
    throw new Error('Bind must be passed a node')
  }

  return function render (data) {
    let dimensions = container.getBoundingClientRect()
    console.log(dimensions)
  }
}

export function unbind (container) {
  if (!isElement(container)) {
    throw new Error('Bind must be passed a node')
  }
}
