'use strict'

import {
  area,
  curveCardinal,
  select,
  selectAll,
  scaleLinear,
  stack,
  stackOrderInsideOut,
  stackOffsetWiggle
} from 'd3'
import { isElement, without } from 'lodash'

export function bind (container) {
  if (!isElement(container)) {
    throw new Error('Bind must be passed a node')
  }

  const svg = select(container).append('svg')
  const chart = svg.append('g')
  const x = scaleLinear()
  const y = scaleLinear()
  const color = scaleLinear()
  .range(['#aad', '#556'])

  const stackFn = stack()
  .offset(stackOffsetWiggle)
  .order(stackOrderInsideOut)

  const areaFn = area()
  .curve(curveCardinal)
  .x((d, i) => x(i))
  .y0(d => y(d[0]))
  .y1(d => y(d[1]))

  function reflow () {
    const { width, height } = container.getBoundingClientRect()

    svg.attr('width', width)
    .attr('height', height)

    x.range([0, width])
    y.range([height / 1.5, 0])
  }

  return function render (data) {
    reflow()
    const { topics, months, max } = data

    x.domain([0, months.length - 1])
    y.domain([0, max])

    const keys = without(Object.keys(months[0]), 'date')
    stackFn.keys(keys)
    const layers = stackFn(months)

    chart.selectAll('.layer')
    .data(layers)
    .enter().append('path')
    .attr('class', 'layer')
    .attr('d', areaFn)
    .style('fill', () => color(Math.random()))
  }
}

export function unbind (container) {
  if (!isElement(container)) {
    throw new Error('Bind must be passed a node')
  }
}
