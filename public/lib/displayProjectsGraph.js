// let file = '../js/ssProject.json'; // '../js/sampleGraphData.json'

// get the data
d3.json('../js/ssProject.json', function (error, links) {
  if (error) {
    console.log(error);
  }

  // let nodes = {};
  let items = links.items;
  let linkedByIndex = {};      // Array with info as to what is connected to what
  let nodeSelectedToggle = 0;  // Toggle stores whether the highlighting is on

  for (let i = 0; i < items.length; i++) {
    linkedByIndex[items[i].id + ',' + items[i].id] = 1;
    items[i].downstream = []; // This will store the index for for relationships for each item *see downstreamCheck() below
    items[i].downstream.noRelations = false;
  }

  // Compute the distinct nodes from the links.
  links.relationships.forEach(function (relItem) {
    relItem.source = getItemWithId(items, relItem.fromItem);
    relItem.target = getItemWithId(items, relItem.toItem);
    relItem.value = +relItem.type;
    // create relationship tuples for linkedByIndex array
    linkedByIndex[relItem.source.id + ',' + relItem.target.id] = 1;
  });

  let width = 1000;
  let height = 800;

  let force = d3.layout.force()
    .nodes(d3.values(items))
    .links(links.relationships)
    .size([width, height])
    .linkDistance(100) // sets the target distance between linked nodes to the specified value
    .charge(-950)      // - value results in node repulsion, while + value results in node attraction
    .friction(0.5)     // closely approximates velocity decay
    .on('tick', tick)
    .start();

  let svg = d3.select('body').append('svg')
    .attr('width', '100%')
    .attr('height', height)
    .call(d3.behavior.zoom().scaleExtent([1, 10])
      .on('zoom', function () {
        svg.attr('transform', 'translate(' + d3.event.translate + ')' + ' scale(' + d3.event.scale + ')');
      }))
    .on('dblclick.zoom', null)  // To remove the double click zoom function
    .append('g');

  // ============ build the arrow ================
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

  // ============ links combined with the arrows ===========
  let path = svg.append('svg:g').selectAll('path')
    .data(force.links())
    .enter().append('svg:path')
    .attr('class', function (thisPath) {
      return 'link ' + (thisPath.type === 8 ? 'link-dash' : ''); // Need
    })
    .attr('marker-end', 'url(#end)');

  // define each node property
  let node = svg.selectAll('.node')
    .data(force.nodes())
    .enter().append('g')
    .attr('class', 'node')
    .call(force.drag)
    .on('click', nodeClick);

  // White rectangle behind text
  node.append('rect')
    .attr('x', -8)
    .attr('y', -9)
    .attr('height', 19)
    .attr('width', 120)
    .style('opacity', 0.80);

  // Circle at node behind icon
  node.append('circle')
    .attr('x', '-14px')
    .attr('y', '-14px')
    .attr('r', 13)
    .style('opacity', 0.80);

  // Image in the node circle
  node.append('image')
    .attr('xlink:href', function (n) {
      return n.image;
    })
    .attr('x', '-9px')
    .attr('y', '-9px')
    .attr('height', '18px')
    .attr('width', '18px');

  // add a title for hovering that shows full filename
  node.append('svg:title')
    .text(function (d) { return d.name; });

  // add the text
  node.append('text')
    .attr('x', 18)
    .attr('dy', '.35em')
    .attr('class', 'nodeText')
    .text(function (d) {
      return d.name.length > 18 ? d.name.substring(0, 15) + '...' : d.name;
    });

  // ============= add the curvy lines ==============
  function tick (e) {
    path.attr('d', function (d) {
      let dx = d.target.x - d.source.x;
      let dy = d.target.y - d.source.y;
      let dr = Math.sqrt(dx * dx + dy * dy);

      return 'M' + d.source.x + ',' + d.source.y + 'A' +
        dr + ',' + dr + ' 0 0,1 ' + d.target.x + ',' + d.target.y;
    });

    node.attr('transform', function (d) {
      return 'translate(' + d.x + ',' + d.y + ')';
    });

    let k = 10 * e.alpha;

    // Push sources up and targets down to form a weak tree.
    path.each(function (d) {
      d.source.x -= k;
      d.target.x += k;
    })
      .attr('x1', function (d) { return d.source.x; })
      .attr('y1', function (d) { return d.source.y; })
      .attr('x2', function (d) { return d.target.x; })
      .attr('y2', function (d) { return d.target.y; });

    node.attr('cx', function (d) { return 5 * d.x; })
      .attr('cy', function (d) { return d.y; });
  }

  // Gets the given node ToItem value
  /* function getToItemValues (array, value) {
   let result = [];

   array.forEach(function (item) {
   if (item.fromItem === value) {
   result.push(item.toItem);
   }
   });
   return result;
   }*/

  // Gets the item with id
  function getItemWithId (itemArray, id) {
    let result = null;

    itemArray.forEach(function (item) {
      if (item.id === id) {
        result = item;
        return;
      }
    });

    return result;
  }

  // This function looks up whether a pair are neighbours
  function neighbor (a, b) {
    return linkedByIndex[a.id + ',' + b.id];
  }

  /*
   * Traverse through child nodes recursively
   */

  function downstreamCheck(d) {
    console.log('try1');
    if (d.downstream.length === 0 && d.downstream.noRelations === false){
      console.log('try2');
      // build downstream if you don't have one already and don't have the noRelationships flag set.
      links.relationships.forEach( function (relItem, index) {
        if (d.id === relItem.fromItem) {
          d.downstream.push(relItem);
        }
      });
      //This will be called if we have NO RELATIONSHIPS. So we're setting that flag.
      if (d.downstream.length === 0) {
        d.downstream.noRelations = true;
      }
    }
  }
  function showNodesDownstream(d) {
    // let downStreamArray = [];
    //
    // links.relationships.forEach( function (relItem) {
    //   if (d.id === relItem.fromItem) {
    //     downStreamArray.push(relItem.toItem);
    //   }
    // });

    node.style('opacity', function (curNode) {
      for( let i = 0; i < d.downstream.length; i++ ){
        if (d.downstream[i].toItem ===curNode.id) {
          curNode.isHighlighted = true;
        }
      }
      return curNode.isHighlighted ? 1 : 0.1;
    });

    path.style('opacity', function (curPath) {
      return (curPath.source.isHighlighted && curPath.target.isHighlighted) ? 1 : 0.1;
    });

  }

  // ============ Toggle highlighting children on single click ===========
  function nodeClick () {
    // Reduce the opacity of all but its neighbors
    let d = d3.select(this).node().__data__;
    downstreamCheck(d);
    // if (d.isDisplayed == false) {
    d.isSelected = true;
    d.isHighlighted = true;
    showNodesDownstream(d);  // Run algorithm for showing all of the downstream items
    nodeSelectedToggle = 1;
    /*} else {
     // Set opacity to normal for all items in graph
     node.style('opacity', 1);
     path.style('opacity', 1);
     node.forEach( function () {

     });

     nodeSelectedToggle = 0;
     }*/
  }
});