// const d3 = require('d3');
// TODO: how to include d3 within App
// without having to separately link the lib from
// the index

class App {
  constructor(content) {
    this.root = d3.hierarchy(content);
    this.setupNodeTree();
  }

  setupNodeTree() {

    let svg = d3.select(document.body).append('svg'),
      w = 960,
      h = 2000,
      g = svg.append('g').attr('transform', 'translate(40, 0)');
    svg.attr('width', w);
    svg.attr('height', h);

    let tree = d3.tree()
      .size([h, w - 160]);

    let link = g.selectAll('.link')
      .data(tree(this.root).descendants().slice(1))
      .enter().append('path')
      .attr('class', 'link')
      .attr('d', d => `M${d.y},${d.x}C${((d.y + d.parent.y)/2)},${d.x} ${((d.y + d.parent.y)/2)},${d.parent.x} ${d.parent.y},${d.parent.x}`);

    let node = g.selectAll('node')
      .data(this.root.descendants())
      .enter().append('g')
      .attr('class', d => (`node${(d.children ? ' node--internal' : ' node--leaf')}`))
      .attr('transform', d => `translate(${d.y},${d.x})`);

    node.append('circle')
      .attr('r', 2.5);

    node.append('text')
      .attr('dy', 3)
      .attr('x', d => (d.children ? -8 : 8))
      .style('text-anchor', d => (d.children ? 'end' : 'start'))
      .text(d => (d.data.name ? d.data.name : 'node'));

  }
}

// Application Instance
const app = new App(contentJSON);
