'use strict'

require('../style/steam-graph.scss')

import { select, selectAll } from 'd3-selection'
import { scaleLinear, scaleTime } from 'd3-scale'
import { area, curveCardinal, stack, stackOrderInsideOut, stackOffsetWiggle } from 'd3-shape'
import { isElement, without } from 'lodash'

function parseDate (dateString) {
  return new Date(dateString.slice(0, 4), dateString.slice(4, 6))
}

export function bind (container) {
  if (!isElement(container)) {
    throw new Error('Bind must be passed a node')
  }

  const svg = select(container).append('svg')
  const axis = svg.append('g').attr('class', 'x axis')
  const chart = svg.append('g').attr('class', 'steam-graph')
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

  let width, height

  function reflow () {
    const clientRect = container.getBoundingClientRect()
    width = clientRect.width
    height = clientRect.height

    svg.attr('width', width)
    .attr('height', height)

    x.range([0, width])
    y.range([height / 1.5, 0])
  }

  return function render (data) {
    reflow()
    const { topics, months, max } = data
    console.log(months)

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

    const marginTop = 150
    const years = months.map((d, i) => +d.date.month === 0 ? { year: d.date.year - 1, index: i } : false).filter(Boolean)
    const ticks = axis.selectAll('.tick')
    .data(years)
    .enter().append('g')
    .attr('class', 'tick')

    ticks.append('text')
    .text(d => d.year)
    .attr('y', marginTop)
    .attr('dy', -5)
    .attr('x', d => x(d.index))
    .attr('class', 'tick-text')

    ticks.append('line')
    .attr('class', 'tick-line')
    .attr('x1', d => x(d.index))
    .attr('x2', d => x(d.index))
    .attr('y1', marginTop)
    .attr('y2', height)
  }
}

export function unbind (container) {
  if (!isElement(container)) {
    throw new Error('Bind must be passed a node')
  }
}
