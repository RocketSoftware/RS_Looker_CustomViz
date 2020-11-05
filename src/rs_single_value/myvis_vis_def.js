import MyVis from "./My_Vis";
import ReactDOM from "react-dom";
import React from "react";
import modifyOptions from "./modifyOptions";
import { ELEMENT_ID } from "./constants";
import { parseData } from "./parser";
const style = require('./css/my_vis.css')

looker.plugins.visualizations.add({
  id: "new_vis",
  label: "new_vis",

  create(element) {
    element.innerHTML = `
    <style>
  
  .vis-body {
    width: 100%;
    height: 100%;
}
    * {
      font-family: "Open Sans", "Noto Sans JP", "Noto Sans CJK KR", "Noto Sans Arabic UI", "Noto Sans Devanagari UI", "Noto Sans Hebrew", "Noto Sans Thai UI", Helvetica, Arial, sans-serif, "Noto Sans";
}
   
    </style>
  `;

    const nStyle = document.createElement('style')
    nStyle.innerHTML = style
    document.head.appendChild(nStyle)
    this.vis = element.appendChild(document.createElement("div"));
    this.vis.className = "vis-body";
    this.vis.id = ELEMENT_ID;
  },

  updateAsync(data, element, config, queryResponse, details, done) {
    this.clearErrors();

    modifyOptions(this, config, queryResponse);

    const {leftMostValue, secondLeftMostValue, label, title, percentage, leftMostLinks, secondLeftMostLinks, leftMostFormat, secondLeftMostFormat} = parseData(data, queryResponse, config)
    

if(config.valueColor){
  this.chart = ReactDOM.render(<MyVis links={[leftMostLinks, secondLeftMostLinks]}config={config} title={title} format={{leftMostFormat, secondLeftMostFormat}} label={label} values={{leftMostValue, secondLeftMostValue, percentage}}/>, this.vis);

  document.querySelector(".val-1").style.color = config.valueColor
  document.querySelector(".label").style.color = config.labelColor
  
  document.getElementById("title").style.color = config.titleColor
  document.getElementById("second-val").style.color = config.secondValueColor
 
  document.querySelector(".val-1").style.fontSize = `${config.valueSize}px`
  document.querySelector(".label").style.fontSize = `${config.labelSize}px`

  document.getElementById("title").style.fontSize = `${config.titleSize}px`
  document.getElementById("second-val").style.fontSize = `${config.secondValueSize}px`
  document.getElementById("percent-val").style.fontSize = `${config.valueSize}px`

  if(config.compareType === "calculate_progress_with_percentage"){
    document.getElementById("of-text").style.color = config.labelColor
    document.getElementById("of-text").style.fontSize =  `${config.labelSize}px`
    document.getElementById("percent-val").style.color = config.secondValueColor
    document.getElementById("percent-val").style.fontSize = `${config.secondValueSize}px`
  }

  // document.body.style.backgroundColor = bodyColor
 
}

    done();
  },
});
