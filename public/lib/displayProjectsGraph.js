let fileName = '../js/ssProject.json'; // '../js/sampleGraphData.json'

// TODO: If a root id is passed, then we should add a relationship from the project node to the selected id node
// TODO: Add the project name as the first node in the nodes list of JSON being given

// get the data
d3.json(fileName, function (error, graphData) {
  if (error) {
    console.log(error);
  }

  let passedID = 2142;  // Gets the passed parameter value from URL
  let clickedOnce = false;  // For monitoring the click event on node
  let timer;                // For click event monitoring

  let width = 1000;
  let height = 800;
  let reducedOpacity = 0.2;

  // let nodes = {};
  let items = graphData.nodes;
  let itemRelations = graphData.edges;
  let relationsChecked = false;

  // Create a project node and add it to the items list
  let projectNode = { id: -1, name: graphData.name, image: '', type: -1 };
  items.unshift(projectNode);
  projectNode = items[0];

  // Map all node edges
  let nodeToEdgeMap = {};

  items.forEach(function (item) {
    nodeToEdgeMap[item.id] = itemRelations.filter(function (relItem) {
      return relItem.source === item.id; // Filter all of the edges that have this item source id
    }).map(function (mapItem) {
      // Map each item to an edge
      return mapItem.source === item.id ? mapItem.target : mapItem.source;
    });

    item.noRelations = true;
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
    if (!relationsChecked) {
      // For each relationship, add the target to the source node
      itemRelations.forEach(function (relItem) {
        // Find node object based on the relationship source id
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

      // Check if there are relations for each node and set a flag
      items.forEach(function (item) {
        if (typeof item.downstream === 'undefined') {
          item.noRelations = true;
        } else {
          item.noRelations = (item.downstream.length === 0);
        }
      });

      relationsChecked = true;
    }

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
      .attr('id', function (d) {
        return d.id;  // Add an id element to each edge
      })
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
      .attr('id', function (d) {
        return d.id;  // Add an id element to each node
      })
      .attr('class', function (thisNode) {
        // Add projectRoot class if the node is the project node
        return thisNode.id === -1 ? 'node projectRoot' : 'node';
      })
      .call(force.drag)
      .on('click', function (d) {
        if (clickedOnce) {
            nodeClick(d);  // Call the single click function
        } else {
          timer = setTimeout(function() {
            nodeDoubleClick(d); // Call the double click function
          }, 300);
          clickedOnce = true;
        }
      });

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

    //
    // ============ Toggle highlighting nodes on single click ===========
    //
    /**
     * This function handles the logic for highlighting and un-highlighting nodes on single-click
     */
    function nodeClick (d) {
      console.log('===== Click Fired =====');
      d.isSelected = true; // Sets the node you clicked on to have a "selected" flag.
      let highlightedCount = -1; // this will count how many downstream nodes are highlighted.
      highlightedCount = downstreamHighlightCheck(d, highlightedCount);
      // If there are no downstream items and d is highlighted, un-highlight it.
      if (d.isHighlighted) {
        if (d.downstream && (highlightedCount !== d.downstream.length)) {
          highlightNodes(d);
        } else {
          unHighlightNodes(d);
        }
      } else {
        highlightNodes(d);
      }
      clickedOnce = false;  // This is for resetting the click flag
    }

    /**
     * This function will un-highlight d and the array of downstream nodes for d. This will NOT
     * un-highlight a node if all of it's children are highlighted (cycle checking)
     * @param {object} d
     */

    // TODO : Keep nodes with two highlighted upstream nodes highlighted on un-highlight with a count
    function unHighlightNodes (d) {
      d.isHighlighted = false;
      node.style('opacity', function (curNode) {
        let count = -1;
        if (d.downstream) {
          for (let i = 0; i < d.downstream.length; i++) {
            if (d.downstream[i].id === curNode.id) {
              downstreamHighlightCheck(curNode, count); // check downstream items for highlighting
            }
            if (count !== d.downstream.length && d.downstream[i].id === curNode.id) {
              curNode.isHighlighted = false;
            }
          }
        }
        return curNode.isHighlighted ? 1 : reducedOpacity;
      });

      path.style('opacity', function (curPath) {
        return (curPath.source.isHighlighted && curPath.target.isHighlighted) ? 1 : reducedOpacity;
      });
    }

    /**
     * This function will highlight the selected node "d" then highlight the nodes in it's downstream array
     * @param {object} d
     */
    function highlightNodes (d) {
      d.isHighlighted = true;
      node.style('opacity', function (curNode) {
        if (!d.noRelations) {
          for (let i = 0; i < d.downstream.length; i++) {
            if (d.downstream[i].id === curNode.id) {
              curNode.isHighlighted = true;
            }
          }
        }
        return curNode.isHighlighted ? 1 : reducedOpacity;
      });

      path.style('opacity', function (curPath) {
        return (curPath.source.isHighlighted && curPath.target.isHighlighted) ? 1 : reducedOpacity;
      });
    }

    /**
     * This function checks all the downstream items of your array to see if they are highlighted. This prevents
     * issues when we have a cycle and are un-highlighting nodes.
     * @param {object} d
     * @param {int} count
     */
    function downstreamHighlightCheck (d, count) {
      // This checks whether we should be highlighting or un-highlighting nodes
      d3.selectAll('g.node')  // Loops through all nodes and checks if they have downstream relations
        .each(function (curNode) {
          if (!d.noRelations) {
            for (let i = 0; i < d.downstream.length; i++) {
              // If the index matches and the node is already highlighted, increase our count.
              if (d.downstream[i].id === curNode.id) {
                if (curNode.isHighlighted) {
                  if (count === -1) {
                    count = 1;
                  } else {
                    count++;
                  }
                }
              }
            }
          }
        });
      return count;
    }

    // ============ Toggle collapsing nodes on Double click ===========
    /*
     * Node double click event hides all of the children nodes for double clicked node.
     *
     * @param {Object} clickedNode is the node that was clicked on
     */
    function nodeDoubleClick (clickedNode) {
      console.log('===== Double Click Fired =====');
      clickedOnce = false;  // For resetting the clickedOnce flag
      clearTimeout(timer);  // Reset the timer for click event
      collapse(clickedNode);
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
      nodeItem.noRelations = false;
    }

    /*
     * Collapses all of the graph nodes downstream from the selected node
     */
    function collapse (root) {
      console.log('Collapse Initiated');
      console.log(root);
      // Hide the node
      if (root.downstream) {
        root.downstream.forEach(function (child) {
          console.log('Child');
          let childSel = d3.select('.node').datum(child.id);
          console.log('Child ID: ' + child.id);
          console.log(childSel[0]);
          childSel[0].style('opacity', 1);
        });
        root._downstream = root.downstream;
        root.downstream = null;
        console.log(root);
      }
    }
  }

  /*
   * Hides all of the graph nodes except the root id
   */
  // function collapseAll () {
  //   svg.selectAll('.node').style('opacity', function (item) {
  //     return item.id !== -1 ? 0 : 1;
  //   });
  //   svg.selectAll('path').style('opacity', 0);
  // }
});
