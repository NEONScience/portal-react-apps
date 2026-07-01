import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

const NODE_SIZE = 6;
const TreeWithParents = ({
  data,
  config,
  onClickNode
}) => {
  const ref = useRef();
  const nodeById = new Map(data.nodes.map(n => [n.id, n]));  //turns nodes array into pairs  [id1, nodeObject1]
  const focusNode = data.nodes.find(n => n.symbolType === "circle")
  const parentNodes = data.nodes.filter(n => n.symbolType === "square");
  const previousNode = data.nodes.find(n => n.symbolType === "diamond");
  const childNodes = data.nodes.filter(n => n.symbolType === "triangle");
  const LEFT_MARGIN = config.layout?.leftMargin ?? 10;
  const TOP_MARGIN = config.layout?.topMargin ?? 10;
  const ROW_SPACING = config.spacing?.row ?? 20;

  // const buildRoundedElbow = (
  //   startX,
  //   startY,
  //   endX,
  //   endY,
  //   radius =8
  // ) => {

  //   const r = Math.min(
  //     radius,
  //     Math.abs(endX - startX) / 2,
  //     Math.abs(endY - startY) / 2
  //   );

  //   return `
  //     M${startX},${startY}
  //     L${startX},${endY - r}
  //     Q${startX},${endY} ${startX + r},${endY}
  //     L${endX},${endY}
  //   `;
  // };


  useEffect(() => {


  const columnSpacing = config.spacing?.column ?? 80;
  const width = 1200 + columnSpacing;

  d3.select(ref.current).selectAll("*").remove();
  // const height = 600;

  // console.log("svg height:", height);

  // const svg = d3.select(ref.current).append("svg")
  //   .attr("viewBox", [0, 0, width, height])
  //   .attr("width", "100%")
  //   .attr("height", "100%")
  //   .attr("preserveAspectRatio", "xMidYMid meet")   // Make sure this is really needed in the end


  parentNodes.forEach((n, i) => {
    n.x = LEFT_MARGIN;
    n.y = TOP_MARGIN + i * ROW_SPACING;
  });


  // parentNode.x = LEFT_MARGIN;
  // parentNode.y = TOP_MARGIN ;



  const firstParent = parentNodes.length > 0
    ? parentNodes.reduce((a, b) => (a.y < b.y ? a : b))
    : null;

  const lastParent = parentNodes.length > 0
    ? parentNodes.reduce((a, b) => (a.y > b.y ? a : b))
    : null;

  // if (!firstParent || !lastParent) {
  //   console.log("No parent nodes found", parentNodes);
  // return;
  // }

  // const firstParent = parentNodes.reduce((a, b) =>
  //   a.y < b.y ? a : b
  // );
  // const lastParent = parentNodes.reduce((a, b) =>
  //   a.y > b.y ? a : b
  // );




  const parentSpineBottomY = lastParent
    ? lastParent.y + ROW_SPACING
    : TOP_MARGIN + ROW_SPACING;


  //const parentSpineBottomY = lastParent.y + ROW_SPACING;

  const hasSingleParent = parentNodes.length === 1;


  const parentSpineX = parentNodes.length === 1
    ? LEFT_MARGIN
    : LEFT_MARGIN + 12


  const maxY = d3.max(parentNodes, d => d.y);




focusNode.x = LEFT_MARGIN + columnSpacing;
focusNode.y = parentSpineBottomY + (previousNode ? ROW_SPACING : 0);

if (previousNode) {
  previousNode.x = focusNode.x;
  previousNode.y = focusNode.y - ROW_SPACING;
}




// focusNode.x = LEFT_MARGIN + columnSpacing;

// if (previousNode) {
//   previousNode.x = focusNode.x;
//   previousNode.y = focusNode.y - ROW_SPACING;
// } else {
//   focusNode.y = parentSpineBottomY;
// }






  // focusNode.x = LEFT_MARGIN + columnSpacing;
  // focusNode.y = parentSpineBottomY;
  // //focusNode.y = maxY + NODE_SIZE + ROW_SPACING


  // if (previousNode) {
  //   previousNode.x = focusNode.x;

  //   if (firstParent) {
  //     previousNode.y = firstParent.y - ROW_SPACING;
  //   } else {
  //     previousNode.y = focusNode.y - ROW_SPACING;
  //   }
  // }





  //const minY = d3.min(parentNodes, d => d.y);
  // const maxY = d3.max(parentNodes, d => d.y);

  //  focusNode.x = LEFT_MARGIN + columnSpacing;
  //  focusNode.y = maxY + NODE_SIZE + ROW_SPACING;
  // if(parentNodes.length === 1){
  //   const p = parentNodes[0];
  //   focusNode.y = p.y + NODE_SIZE + ROW_SPACING
  // } else {
  //  focusNode.y = maxY + NODE_SIZE + ROW_SPACING
  // }


  // const startY = parentNode.y + NODE_SIZE;
  // focusNode.x = parentNode.x + columnSpacing;y
  // focusNode.y = startY + ROW_SPACING;

childNodes.forEach((n, i) => {
  n.x = focusNode.x + columnSpacing;
  n.y = focusNode.y + ((i + 1) * ROW_SPACING);
});

const maxNodeY = Math.max(
  focusNode?.y || 0,
  previousNode?.y || 0,
  ...parentNodes.map(n => n.y || 0),
  ...childNodes.map(n => n.y || 0)
);

const svgHeight = Math.max(
  600,
  maxNodeY + 100
);


const svg = d3.select(ref.current)
  .append("svg")
  .attr("width", width)
  .attr("height", svgHeight);


console.log("child count:", childNodes.length);
console.log("last child y:", childNodes[childNodes.length - 1]?.y);
console.log("svgHeight:", svgHeight);


  const linkLayer = svg.append("g")
    .attr("fill", "none")
    .attr("stroke", config.link?.stroke ?? "#999")
    .attr("stroke-width", config.link?.strokeWidth ?? 1.5);

    if (previousNode) {
      linkLayer.append("path")
        .attr("d", `
          M${previousNode.x},${previousNode.y + NODE_SIZE}
          L${focusNode.x},${focusNode.y - NODE_SIZE}
        `);
    }

if (firstParent && lastParent) {



    // const r = 10;

    // linkLayer.append("path")
    //   .attr("d", `
    //     M${parentSpineX},${firstParent.y}
    //     L${parentSpineX},${focusNode.y - r}
    //     Q${parentSpineX},${focusNode.y}
    //       ${parentSpineX + r},${focusNode.y}
    //     L${focusNode.x - NODE_SIZE},${focusNode.y}
    //   `);


  linkLayer.append("path")
    .attr("d", `
      M${parentSpineX},${firstParent.y}
      L${parentSpineX},${parentSpineBottomY}
    `)



//   const radius = 8;


// linkLayer.append("path")
//   .attr("d",
//     buildRoundedElbow(
//       parentSpineX,
//       parentSpineBottomY,
//       focusNode.x - NODE_SIZE,
//       focusNode.y,
//       25
//     )
//   );


  // linkLayer.append("path")
  //   .attr("d", `
  //     M${parentSpineX},${parentSpineBottomY}
  //     L${parentSpineX},${focusNode.y - radius}
  //     A ${radius} ${radius} 0 0 0 ${parentSpineX + radius} ${focusNode.y}
  //     L${focusNode.x - NODE_SIZE},${focusNode.y}
  //   `);



  linkLayer.append("path")
    .attr("d", `
      M${parentSpineX},${parentSpineBottomY}
      L${parentSpineX},${focusNode.y}
      L${focusNode.x - NODE_SIZE},${focusNode.y}
    `);
}



  const nodeGroups = svg.append("g")
    .selectAll("g")
    .data(data.nodes)
    .join("g")
    .attr("transform", d => `translate(${d.x},${d.y})`)
    .style("cursor", "pointer")
    .on("click", (event, nodeData) => {
      event.stopPropagation();

      if (onClickNode) {
        onClickNode(nodeData);
      }
    });


  nodeGroups.each(function (d) {
    if (d.symbolType === "circle") {
      d3.select(this)
        .append("circle")
        .attr("r", NODE_SIZE)
        .attr("fill", config.nodeStyles?.circle?.fill ?? "#1f4ea8")
        .attr("stroke", config.nodeStyles?.circle?.stroke ?? "#1f4ea8");
    }
    if (d.symbolType === "square") {
      d3.select(this)
        .append("rect")
        .attr("x", -NODE_SIZE)
        .attr("y", -NODE_SIZE)
        .attr("width", NODE_SIZE * 2)
        .attr("height", NODE_SIZE * 2)
        .attr("fill", config.nodeStyles?.square?.fill ?? "#5c8f1a")
        .attr("stroke", config.nodeStyles?.square?.stroke ?? "#5c8f1a");
    }

    if (d.symbolType === "diamond") {
      d3.select(this)
        .append("path")
        .attr("d", `
          M 0,${-NODE_SIZE}
          L ${NODE_SIZE},0
          L 0,${NODE_SIZE}
          L ${-NODE_SIZE},0
          Z
        `)
        .attr("fill", config.nodeStyles?.diamond?.fill ?? "#FFD966")
        .attr("stroke", config.nodeStyles?.diamond?.stroke ?? "#D6B656"
        );
    }

    if (d.symbolType === "triangle") {
      d3.select(this)
        .append("path")
        .attr("d", `
          M ${-NODE_SIZE},${NODE_SIZE}
          L ${NODE_SIZE},${NODE_SIZE}
          L 0,${-NODE_SIZE}
          Z
        `)
        .attr("fill", config.nodeStyles?.triangle?.fill ?? "#5b9bd5")
        .attr("stroke", config.nodeStyles?.triangle?.stroke ?? "#5b9bd5");
    }
    d3.select(this)
      .append("text")
      .attr("text-anchor", "start")
      .attr("x", d => {
        if (d.symbolType === "square") {
          return (parentSpineX - d.x) + 10;
        }
        return 10;
      })
      .attr("dy", "0.32em")
      .text(d.sampleName);
  });

  const spineStartX = focusNode.x;
  const spineStartY = focusNode.y + NODE_SIZE;


  const spineEndY = childNodes.length > 0
    ? childNodes.reduce((a, b) => (a.y > b.y ? a : b)).y
    : spineStartY;

  linkLayer.append("path")
    .attr("d", `
      M${spineStartX},${spineStartY}
      L${spineStartX},${spineEndY}
    `);



  // if (childNodes.length > 0) {
  //   const spineEndY = childNodes.reduce((a, b) =>
  //     a.y > b.y ? a : b
  //   ).y;

  //   linkLayer.append("path")
  //     .attr("d", `
  //       M${spineStartX},${spineStartY}
  //       L${spineStartX},${spineEndY}
  //     `);
  // }


//  const spineEndY = childNodes.reduce((a, b) => (a.y > b.y ? a : b)).y;

  // linkLayer.append("path")
  //   .attr("d", `
  //     M${spineStartX},${spineStartY}
  //     L${spineStartX},${spineEndY}
  //   `);

  //const lastParent = parentNodes.reduce((a, b) => (a.y > b.y ? a : b));

  linkLayer.selectAll("path.link")
    .data(data.links)
    .join("path")
    .attr("class", "link")
    .attr("d", d => {
      let s = nodeById.get(d.source);
      let t = nodeById.get(d.target);

      if (s.symbolType === "circle" && t.symbolType === "square") {
        const temp = s;
        s = t;
        t = temp;
      }

      if (s.symbolType === "square" && t.symbolType === "circle") {

        if (hasSingleParent) {
          return null;
        }

        const startX = s.x + NODE_SIZE;
        const startY = s.y;

        return `
          M${startX},${startY}
          L${parentSpineX},${startY}
        `;
      }

      // if (s.symbolType === "square" && t.symbolType === "circle") {
      //   const startX = s.x;
      //   const startY = s.y + NODE_SIZE;
      //   const endX = t.x
      //   const endY = t.y - NODE_SIZE;
      // //  const elbowY = startY + ROW_SPACING;
      //   const junctionY = lastParent.y - ROW_SPACING;


      //   if (s.id === lastParent.id) {
      //     const extendedY = startY + ROW_SPACING; // extra vertical drop

      //     return `
      //       M${startX},${startY}
      //       L${startX},${extendedY}
      //       L${endX},${extendedY}
      //       L${endX},${endY}
      //     `;
      //   }



      //   return `
      //     M${startX},${startY}
      //     L${startX},${junctionY}
      //     L${endX},${junctionY}
      //     L${endX},${endY}
      //   `;

      //   // return `
      //   //   M${startX},${startY}
      //   //   L${startX},${elbowY}
      //   //   L${endX},${elbowY}
      //   //   L${endX},${endY}
      // // `;
      //   }

      // safe guard target symbols are either square or triangle
      if (!(t.symbolType === "square" || t.symbolType === "triangle")) return null;

      if (t.symbolType === "triangle") {

        const branchStartX = s.x;
        const branchY = t.y;
        const endX = t.x - (NODE_SIZE * 0.75);
        const endY = t.y;

        return `
          M${branchStartX},${branchY}
          L${endX},${endY}
        `;
      }
      if (onClickNode) onClickNode(d);
    });

  }, [data, config, onClickNode]);
  return <div ref={ref} />;
};

export default TreeWithParents;
