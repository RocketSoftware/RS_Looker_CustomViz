import React from "react";
import numeral from "numeral"
// import "./css/my_vis.css"

export default function MyVis({ values, label, title, config, links, format }) {
  // const displayFirstValue = values.leftMostValue.value;
  // const displaySecondValue = values.secondLeftMostValue.value;
  console.log(values)
  const leftMostFormatted =  typeof (values.leftMostValue.value) === "number" ? numeral(values.leftMostValue.value).format(format.leftMostFormat) : values.leftMostValue.value
  const secondLeftMostFormatted =  typeof (values.secondLeftMostValue.value) === "number" ? numeral(values.secondLeftMostValue.value).format(format.secondLeftMostFormat) : values.secondLeftMostValue.value 

  const displayFirstValue = !values.leftMostValue ? "" : values.leftMostValue.rendered || leftMostFormatted
  const displaySecondValue = !values.secondLeftMostValue ? "" : values.secondLeftMostValue.rendered ||secondLeftMostFormatted
  const width = values.percentage.value === 0 ? 0 : `${values.percentage.value}%`;
  const overlayStyle = width ? { width: width } : { visibilty: "hidden" };
  const overlayWithPercent = config.compareType === "calculate_progress_with_percentage";
  const overlay = config.compareType === "calculate_progress" || overlayWithPercent;
  const percentageSpanClass = overlayWithPercent ? "" : "none"
  const leftMostLinks = links[0]
  const secondLeftMostLinks = links[1]

  const overlayBlock = (
    <React.Fragment>
      <div className="val-2 underlay-BG">
        <span></span> <span></span>
      </div>
      <div className="overlay" style={overlayStyle}>
      </div>
    </React.Fragment>
  );

  function clickHandler(event, linkArr){
    LookerCharts.Utils.openDrillMenu({
    links: linkArr,
    event: event
  });
}


  return (
    <div className="vis-container">
      <div className="val-1" onClick={(event) => clickHandler(event, leftMostLinks)}>{displayFirstValue}</div>
      <div id={"title"} className="title">
        {title}
      </div>

      {overlay && overlayBlock}
      <div className="val-2 format-val-2">
        <span className={percentageSpanClass} id={"percent-val"}>{values.percentage.rendered} <span id="of-text">of</span> </span>
        <span id={"second-val"} onClick={(event) => clickHandler(event, secondLeftMostLinks)}>{displaySecondValue} </span>{" "}
        <span className="label">{label}</span>
      </div>
    </div>
  );
}
