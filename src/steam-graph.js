'use strict'

require('../style/steam-graph.scss')

import { select, selectAll, mouse } from 'd3-selection'
import { scaleLinear } from 'd3-scale'
import { area, curveCardinal, stack, stackOrderInsideOut, stackOffsetWiggle } from 'd3-shape'
import { isElement, without, throttle } from 'lodash'

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
  const overlay = svg.append('g')
  .attr('class', 'overlay')
  .attr('transform', 'translate(-100,' + getMarginTop() + ')')

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

  function resize () {
    chart.selectAll('.layer')
    .attr('d', areaFn)

    const ticks = axis.selectAll('.tick')
    ticks.selectAll('.tick-text')
    .attr('y', getMarginTop())
    .attr('dy', -5)
    .attr('x', d => x(d.index))

    ticks.selectAll('.tick-line')
    .attr('x1', d => x(d.index))
    .attr('x2', d => x(d.index))
    .attr('y1', getMarginTop())
    .attr('y2', height)

    // hide overlay on resize
    overlay.attr('transform', 'translate(-100,' + getMarginTop() + ')')
  }

  function onWindowResize () {
    reflow()
    resize()
  }

  function getMarginTop () {
    return 150 // this *might* change on mobile
  }

  return function render (data) {
    reflow()
    const { topics, months, max } = data
    console.log(topics)

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
    .on('mouseover', function (d, i) {
      console.log(topics[i].sample.map(d => d.corpus).join('\n'))
    })

    const years = months.map((d, i) => +d.date.month === 0 ? { year: d.date.year, index: i } : false).filter(Boolean)
    const ticks = axis.selectAll('.tick')
    .data(years)
    .enter().append('g')
    .attr('class', 'tick')

    ticks.append('text')
    .text(d => d.year)
    .attr('y', getMarginTop())
    .attr('dy', -5)
    .attr('x', d => x(d.index))
    .attr('class', 'tick-text')

    ticks.append('line')
    .attr('class', 'tick-line')
    .attr('x1', d => x(d.index))
    .attr('x2', d => x(d.index))
    .attr('y1', getMarginTop())
    .attr('y2', height)

    overlay.append('text')
    .attr('class', 'overlay-text')
    .attr('dy', 10)

    overlay.append('line')
    .attr('class', 'overlay-line')
    .attr('y1', 15)
    .attr('y2', height - getMarginTop())

    svg.on('mousemove', throttle(function (d) {
      let location = mouse(this)
      let index = Math.round(x.invert(location[0]))
      let item = months[index]

      overlay.attr('transform', 'translate(' + location[0] + ',' + getMarginTop() + ')')
      overlay.select('.overlay-text')
      .text((item.date.month + 1) + '/' + item.date.year)
    }, 25, { trailing: false }))

    svg.on('mouseout', function () {
      overlay.attr('transform', 'translate(-100,' + getMarginTop() + ')')
    })

    const resizeHandler = throttle(onWindowResize, 400, { leading: false })
    window.addEventListener('resize', resizeHandler)

    return function unbind () {
      svg.remove()
      window.removeEventListener('resize', resizeHandler)
    }
  }
}
