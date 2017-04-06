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

    // d3 v3 
    let margin = {top: 20, right: 120, bottom: 20, left: 120},
      w = 1024 - margin.left - margin.right,
      h = 2000 - margin.top - margin.bottom,
      duration = 750,
      i = 0;

    this.svg = d3.select(document.body).append('svg')
      .attr('width', w + margin.right + margin.left)
      .attr('height', h + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    this.tree = d3.tree()
      .size([h, w]);

    let diagonal = d3.svg.diagonal()
      .projection(d => ([d.y, d.x]));

    this.updateNodeTree();


    /*
    const diagonal = d => (
      `M${d.y},${d.x}C${((d.y + d.parent.y)/2)},${d.x} ${((d.y + d.parent.y)/2)},${d.parent.x} ${d.parent.y},${d.parent.x}`
    );

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
      */

  }

  updateNodeTree() {

    // compute new tree layout
    let nodes = this.tree.nodes(this.root).reverse(),
      links = this.tree.links(nodes);

    // normalize for fixed depth
    nodes.forEach(d => {
      d.y = d.depth * 180;
    });

    // update the nodes
    let node = this.svg.selectAll('g.node')
      .data(nodes, d => ( d.id || (d.id = ++i)));

    // enter any new nodes at parent's previous position
    let nodeEnter = node.enter().append('g')
      .attr('class', 'node')
      .attr('transform', d => `translate(${source.y0},${source.x0})`)
      .on('click', click);

  }
}

// Application Instance
const app = new App(contentJSON);
