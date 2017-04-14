// TODO: how to include d3 within App as you would with React
// const d3 = require('d3');

class App {

  constructor(content) {
    this.root = d3.hierarchy(content);
    this.setupNodeTree();
    // console.log(this.root);
  }

  diagonal(d) {
    return `M${d.y},${d.x}C${((d.y + d.parent.y)/2)},${d.x} ${((d.y + d.parent.y)/2)},${d.parent.x} ${d.parent.y},${d.parent.x}`;
  };

  // TODO: create nodeTree class to instantiate from App (later build up d3 lib to allow any visualisation)
  setupNodeTree() {

    const diagonal = d => (
      `M${d.y},${d.x}C${((d.y + d.parent.y)/2)},${d.x} ${((d.y + d.parent.y)/2)},${d.parent.x} ${d.parent.y},${d.parent.x}`
    );

    const collapse = d => {
      if (d.children) {
        d._children = d.children;
        d._children.forEach(collapse);
        d.children = null;
      }
    };

    let margin = {top: 20, right: 120, bottom: 20, left: 120},
      w = 1024 - margin.left - margin.right,
      h = 2000 - margin.top - margin.bottom;

    this.svg = d3.select(document.body).append('svg')
      .attr('width', w + margin.right + margin.left)
      .attr('height', h + margin.top + margin.bottom);

    let g = this.svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    this.tree = d3.tree()
      .size([h, w]);

    // Link
    let link = g.selectAll('.link')
      .data(this.tree(this.root).descendants().slice(1))
      .enter().append('path')
      .attr('class', 'link')
      .attr('d', d => `M${d.y},${d.x}C${((d.y + d.parent.y)/2)},${d.x} ${((d.y + d.parent.y)/2)},${d.parent.x} ${d.parent.y},${d.parent.x}`);

    // Node
    let node = g.selectAll('node')
      .data(this.root.descendants())
      .enter().append('g')
      .attr('class', d => (`node${(d.children ? ' node--internal' : ' node--leaf')}`))
      .attr('transform', d => `translate(${d.y},${d.x})`);

    // Circle
    node.append('circle')
      .attr('r', 2.5);

    // Text Node
    node.append('text')
      .attr('dy', 3)
      .attr('x', d => (d.children ? -8 : 8))
      .style('text-anchor', d => (d.children ? 'end' : 'start'))
      .text(d => (d.data.name ? d.data.name : 'node'));

    // Collapse all but first 3
    this.root.children.forEach(collapse);

    this.updateNodeTree(this.root);

  }

  updateNodeTree(source) {

    // compute new tree layout
    // TODO: these are v3 layout
    let nodes = this.tree(this.root).descendants().reverse(),
      links = nodes.map(node => node.links())[0];

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
      .on('click', d => {
        if (d.children) {
          d._children = d.children;
          d.children = null;
        } else {
          d.children = d._children;
          d._children = null;
        }
        this.updateNodeTree(d);
      });

    nodeEnter.append('circle')
      .attr('r', 1e-6)
      .style('fill', d => d._children ? '#aaa' : '#eee');

    nodeEnter.append('text')
      .attr('x', d => d.children || d._children ? -10 : 10)
      .attr('dy', '.35em')
      .attr('text-anchor', d => d.children || d._children ? 'end' : 'start')
      .text(d => (d.data.name ? d.data.name : 'node'));

    // Transition Nodes to new position
    let nodeUpdate = node.transition()
      .duration(750)
      .attr('transform', d => `translate(${d.y},${d.x}`);

    nodeUpdate.select('circle')
      .attr('r', 4.5)
      .style('fill', d => d._children ? '#aaa' : '#eee');

    nodeUpdate.select('text')
      .style('fill-opacity', 1);

    // Transition exiting nodes to parents new position
    let nodeExit = node.exit().transition()
      .duration(750)
      .attr('transform', d => `translate(${source.y},${source.x})`)
      .remove();

    nodeExit.select('circle')
      .attr('r', 1e-6);

    nodeExit.select('text')
      .style('fill-opacity', 1e-6);

    let link = this.svg.selectAll('path.link')
      .data(links, d => d.target.id);

    // Enter any new links at the parents previous position
    link.enter().insert('path', 'g')
      .attr('class', 'link')
      .attr('d', d => {
        let o = {x: source.x0, y: source.y0};
        return this.diagonal({'source': o, 'target': o});
      });
    
    // transition links to their new positions
    link.transition()
      .duration(750)
      .attr('d', this.diagonal);

    link.exit().transition()
      .duration(750)
      .attr('d', d => {
        let o = {x: source.x, y: source.y};
        return this.diagonal({'source': o, 'target': o});
      })
      .remove();

    // stash the old positions for transition
    nodes.forEach(d => {
      d.x0 = d.x;
      d.y0 = d.y;
    });
  }
}

// Application Instance
const app = new App(contentJSON);
