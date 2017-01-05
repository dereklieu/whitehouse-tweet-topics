'use strict'

require('../style/steam-graph.scss')

import { select, selectAll, mouse } from 'd3-selection'
import { scaleLinear, scaleOrdinal } from 'd3-scale'
import { area, curveCardinal, stack, stackOrderInsideOut, stackOffsetWiggle } from 'd3-shape'
import { isElement, without, throttle } from 'lodash'
import { range } from 'd3-array'

import { clusterNames } from './topics'
import { colors } from './colors'

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
  const color = scaleOrdinal()
  .range(colors)
  .domain(range(0, colors.length))

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
    return 100 // this *might* change on mobile
  }

  return function render (data) {
    reflow()
    const { topics, months, max } = data

    x.domain([0, months.length - 1])
    y.domain([0, max])
    color.domain([0, Object.keys(topics[0]).length])

    const keys = without(Object.keys(months[0]), 'date')
    stackFn.keys(keys)
    const layers = stackFn(months)

    const paths = chart.selectAll('.layer')
    .data(layers)
    .enter().append('path')
    .attr('class', 'layer')
    .attr('d', areaFn)
    .style('fill', (d, i) => color(i))

    // toggle the opacity on mouse over/out
    paths.on('mouseover', function (d) {
      paths.style('opacity', (path, i) => {
        return +d.key === i ? 1 : 0.25
      })
    })
    .on('mouseout', function () {
      paths.style('opacity', 1)
      overlay.attr('transform', 'translate(-100,' + getMarginTop() + ')')
      overlayDate.text('')
      overlayText.selectAll('tspan').remove()
      currentId = null
    })

    let currentId = null // update sample tweet only on change
    paths.on('mousemove', throttle(function (d) {
      let location = mouse(this)
      // update the location of the guide line on move
      overlay.attr('transform', 'translate(' + location[0] + ',' + getMarginTop() + ')')

      let index = Math.round(x.invert(location[0]))
      let { key } = d

      // if we've changed either the month or the layer, update the text
      let identifier = String(index) + String(key)
      if (identifier !== currentId) {
        currentId = identifier
        let month = months[index]
        let tweets = topics[index][+key]

        let rightAlign = index > months.length * 0.6
        sampleTweet(overlayText, tweets, rightAlign)
        overlayText.style('text-anchor', rightAlign ? 'end' : 'start')

        overlayDate.text((month.date.month + 1) + '/' + month.date.year)
        overlayTitle.text('"' + clusterNames[+key] + '"')
          .style('text-anchor', rightAlign ? 'start' : 'end')
          .style('fill', color(+key))
          .attr('dx', rightAlign ? 5 : -5)
      }
    }, 25, { trailing: false }))

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

    const overlayDate = overlay.append('text')
    .attr('class', 'overlay-date')
    .attr('dy', 20)

    const overlayText = overlay.append('text')
    .attr('class', 'overlay-text')

    const overlayTitle = overlay.append('text')
    .attr('class', 'overlay-title')
    .attr('dy', 40)

    overlay.append('line')
    .attr('class', 'overlay-line')
    .attr('y1', 25)
    .attr('y2', height - getMarginTop())

    const resizeHandler = throttle(onWindowResize, 400, { leading: false })
    window.addEventListener('resize', resizeHandler)

    return function unbind () {
      svg.remove()
      window.removeEventListener('resize', resizeHandler)
    }
  }
}

const perLine = 6
function sampleTweet (textNode, tweets, rightAlign) {
  let count = tweets.length
  let lines = []
  if (count) {
    let index = Math.floor(Math.random() * count)
    let { text, id } = tweets[index]

    let words = text.split(' ')
    let wordCount = words.length

    let lineCount = Math.ceil(wordCount / perLine)
    for (let i = 0; i < lineCount; ++i) {
      let end = (i + 1) * perLine
      if (end > wordCount) {
        end = wordCount
      }
      lines.push(words.slice(i * perLine, end).join(' '))
    }
  }

  let tspans = textNode.selectAll('tspan')
  .data(lines)

  tspans.enter().append('tspan')
  .attr('x', 0)
  .attr('dx', rightAlign ? -5 : 5)
  .attr('y', (d, i) => (i + 1) * 20)
  .attr('dy', 20)
  .merge(tspans)
  .attr('dx', rightAlign ? -5 : 5)
  .text(d => d)

  tspans.exit().remove()
}
