let fileName = '../js/ssProject.json'; // '../js/sampleGraphData.json'

// TODO: If a root id is passed, then we should add a relationship from the project node to the selected id node
// TODO: Add the project name as the first node in the nodes list of JSON being given

// get the data
d3.json(fileName, function (error, graphData) {
  if (error) {
    console.log(error);
  }

  let passedID = 2142;  // Gets the passed parameter value from URL

  let width = 1000;
  let height = 800;

  // let nodes = {};
  let items = graphData.nodes;
  let itemRelations = graphData.edges;

  // Create a project node and add it to the items list
  let projectNode = { id: -1, name: graphData.name, image: '', type: -1 };
  items.unshift(projectNode);
  projectNode = items[0];

  // Map all node edges
  let nodeToEdgeMap = {};

  items.forEach( function (item) {
    nodeToEdgeMap[item.id] = itemRelations.filter( function (relItem) {
      return relItem.source === item.id; // Filter all of the edges that have this item source id
    }).map( function (mapItem) {
      // Map each item to an edge
      return mapItem.source === item.id ? mapItem.target : mapItem.source;
    });
  });

  // Append the SVG object to the body
  // Add a group element within it to encompass all the nodes - this fixes the chrome
  let svg = d3.select('body').append('svg')
    .attr('width', '100%')
    .attr('height', height)
    .call(d3.behavior.zoom().scaleExtent([1, 10])
      .on('zoom', function () {
        svg.attr('transform', 'translate(' + d3.event.translate + ')' + ' scale(' + d3.event.scale + ')');
      }))
    .on('dblclick.zoom', null)  // To remove the double click zoom function
    .append('g');

  // ============ build the arrows ================
  svg.append('svg:defs').selectAll('marker')
    .data(['end'])      // Different link/path types can be defined here
    .enter().append('svg:marker')    // This section adds in the arrows
    .attr('id', String)
    .attr('viewBox', '0 -5 10 10')
    .attr('refX', 25)
    .attr('refY', -1.5)
    .attr('markerWidth', 6)
    .attr('markerHeight', 6)
    .attr('orient', 'auto')
    .append('svg:path')
    .attr('d', 'M0,-5L10,0L0,5')
    .attr('class', 'arrow');

  let force = d3.layout.force()
    .size([width, height])
    .linkDistance(100)  // sets the target distance between linked nodes to the specified value
    .charge(-500)       // - value results in node repulsion, while + value results in node attraction
    .friction(0.8);     // closely approximates velocity decay

  updateGraph(passedID);  // Render the graph

  /*
   * Updates the graph visuals
   * @param {Integer} rootId is the id of the element that is to be the root node coming off the project node
   */
  function updateGraph (rootId = -1) {
    // For each relationship, add the target to the source node
    itemRelations.forEach(function (relItem) {
      let srcNode = items.find(function (item) {
        return item.id === relItem.source;
      });

      // Set the relationship source and target values
      // Note - Use objects only and not just ids of the nodes
      relItem.source = srcNode;
      relItem.target = items.find(function (item) {
        return item.id === relItem.target;
      });

      addDownstreamItemToNode(srcNode, relItem);  // Check if downstream items array exists
    });

    // Checks to see if a node id was passed
    if (rootId !== -1) {
      // Get the root item from the items list
      let rootItem = items.find(function (item) {
        return item.id === rootId;
      });
      // Add an edge from the project node to the passed node
      itemRelations.unshift({id: 0, source: projectNode, target: rootItem, type: -1});

      addDownstreamItemToNode(projectNode, itemRelations[0]);  // Add downstream item to project node
    }

    // Set the force nodes, edges and start the graph
    force
      .nodes(graphData.nodes)
      .links(graphData.edges)
      .on('tick', tick)
      .start();

    // ============ edges combined with the arrows ===========
    let path = svg.append('svg:g').selectAll('path')
      .data(force.links())
      .enter().append('svg:path')
      .attr('class', thisPath => {
        let result = 'link';
        // Check the type and add a style according to type
        result = (thisPath.type === -1) ? result + ' link-dot' : result;
        result = (thisPath.type === 8) ? ' link-dash' : result;

        return result;
      })
      .attr('marker-end', 'url(#end)');

    // ============ Node Properties Definition ===========
    let node = svg.selectAll('.node')
      .data(force.nodes())
      .enter()
      .append('g')
      .attr('class', function (thisNode) {
        // Add projectRoot class if the node is the project node
        return thisNode.id === -1 ? 'node projectRoot' : 'node';
      })
      .call(force.drag)
      .on('click', nodeClick)
      .on('dblclick', nodeDoubleClick);

    projectNode.fixed = true;  // Set the project Node to be fixed and not moving
    projectNode.x = height / 2;
    projectNode.y = width / 2;

    // White rectangle behind text configuration
    node.append('rect')
      .attr('x', -8)
      .attr('y', -9)
      .attr('height', 19)
      .attr('width', 120)
      .style('opacity', 0.80);

    // Circle at node behind icon configuration
    node.append('circle')
      .attr('x', '-14px')
      .attr('y', '-14px')
      .attr('r', 13)
      .style('opacity', 0.80);

    // Image in the node circle configuration
    node.append('image')
      .attr('xlink:href', function (n) {
        return n.image;
      })
      .attr('x', '-9px')
      .attr('y', '-9px')
      .attr('height', '18px')
      .attr('width', '18px');

    // Add Text for hovering that shows full filename
    node.append('svg:title')
      .text(function (d) {
        return d.name;
      });

    // Add the name of the node as text
    node.append('text')
      .attr('x', 18)
      .attr('dy', '.35em')
      .attr('class', 'nodeText')
      .text(function (d) {
        // Limit the length of the name text
        return d.name.length > 18 ? d.name.substring(0, 15) + '...' : d.name;
      });

    // ============= Node Path Definitions ==============
    /*
     * For every shift of the graph, this gets called.
     * It updates the location of the nodes and edges.
     *
     * @param {Object} e
     */
    function tick (e) {
      path.attr('d', function (d) {
        let dx = d.target.x - d.source.x;
        let dy = d.target.y - d.source.y;
        let dr = Math.sqrt(dx * dx + dy * dy);

        return 'M' + d.source.x + ',' + d.source.y + 'A' +
          dr + ',' + dr + ' 0 0,1 ' + d.target.x + ',' + d.target.y;
      });

      // Move the edge depending on node location
      node.attr('transform', function (d) {
        return 'translate(' + d.x + ',' + d.y + ')';
      });

      let k = 10 * e.alpha; // For the node offset

      // This section pushes sources up and targets down to form a weak tree-like structure.
      path.each(function (d) {
        d.source.x -= k;
        d.target.x += k;
      }).attr('x1', function (d) { return d.source.x; })
        .attr('y1', function (d) { return d.source.y; })
        .attr('x2', function (d) { return d.target.x; })
        .attr('y2', function (d) { return d.target.y; });

      // This sets the node position
      node.attr('cx', function (d) { return 5 * d.x; })
          .attr('cy', function (d) { return d.y; });
    }

    /*
     * Traverse through child nodes recursively
     *
     * @param {Object} d is the selected node
     */
    function downstreamCheck (d) {
      if (typeof d.downstream !== 'undefined') {
        if (d.downstream.length === 0 && d.downstream.noRelations === false) {
          // build downstream if you don't have one already and don't have the noRelationships flag set.
          graphData.edges.forEach(function (relItem, index) {
            if (d.id === relItem.source) {
              d.downstream.push(relItem);
            }
          });
          // This will be called if we have NO RELATIONSHIPS. So we're setting that flag.
          if (d.downstream.length === 0) {
            d.downstream.noRelations = true;
          }
        }
      }
    }

    /*
     * Shows the Nodes downstream by recursing through them
     *
     * @param {Object} d is the selected node
     */
    function showNodesDownstream (d) {
      // let downStreamArray = [];
      //
      // graphData.relationships.forEach( function (relItem) {
      //   if (d.id === relItem.source) {
      //     downStreamArray.push(relItem.target);
      //   }
      // });

      node.style('opacity', function (curNode) {
        if (typeof d.downstream !== 'undefined') {
          for (let i = 0; i < d.downstream.length; i++) {
            if (d.downstream[i].target === curNode.id) {
              curNode.isHighlighted = true;
            }
          }
        }
        return curNode.isHighlighted ? 1 : 0.1;
      });

      path.style('opacity', function (curPath) {
        return (curPath.source.isHighlighted && curPath.target.isHighlighted) ? 1 : 0.1;
      });
    }

    // ======= Click Events Below =======
    /*
     * Node click event toggles highlighting children on single click.
     *
     * @param {Object} clickedNode is the node that was clicked on
     */
    function nodeClick (clickedNode) {
      // Reduce the opacity of all but its neighbors
      downstreamCheck(clickedNode);
      clickedNode.isSelected = true;
      clickedNode.isHighlighted = true;
      showNodesDownstream(clickedNode);  // Run algorithm for showing all of the downstream items
    }

    /*
     * Node double click event hides all of the children nodes for double clicked node.
     *
     * @param {Object} clickedNode is the node that was clicked on
     */
    function nodeDoubleClick (clickedNode) {
      console.log('Double Click Fired');
    }

    /*
     * Adds a downstream item and downstream edge to a given Node
     *
     * @param {Object} nodeItem is a node item
     * @param {Object} edge is an edge object that is going to be added to the nodeItem
     */
    function addDownstreamItemToNode (nodeItem, edge) {
      // Check if downstream items array exists
      if (typeof nodeItem.downstream === 'undefined') {
        nodeItem.downstream = [];
      }
      nodeItem.downstream.push(edge.target);  // Add the target ID to list of downstream items

      // Check if downstream Edges array exists
      if (typeof nodeItem.downstreamEdges === 'undefined') {
        nodeItem.downstreamEdges = [];
      }
      nodeItem.downstreamEdges.push(edge);  // Add the target ID to list of downstream items
    }
  }

  /*
   * Hides all of the graph nodes except the root id
   */
  function collapseAll() {
    svg.selectAll('.node').style("opacity", function (item) {
      return item.id !== -1 ? 0 : 1;
    });
    svg.selectAll('path').style("opacity", 0);
  }
});
