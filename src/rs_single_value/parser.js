import React from "react";
import numeral from "numeral"

function getLeftMostField(fieldsObj) {
  let name = "";
  let label = "";
  let valueFormat = ""
  if (fieldsObj.measures.length) {
    let measure = fieldsObj.measures[0];
    name = measure.name;
    label = measure.label;
    valueFormat = measure.value_format
  } else if (fieldsObj.dimensions.length) {
    let dimension = fieldsObj.dimensions[0];
    name = dimension.name;
    label = dimension.label;
    valueFormat = dimension.value_format
  }
  if(!valueFormat){
    valueFormat = '0,0'
  }
  return { name, label, valueFormat };
}

function getSecondLeftMostField(fieldsObj) {
  const measureLength = fieldsObj.measures.length;
  const dimensionLength = fieldsObj.dimensions.length;
  let name = "";
  let label = "";
  let valueFormat = ""
  function assignNameLabel(fieldParam) {
    name = fieldParam.name;
    label = fieldParam.label;
    valueFormat = fieldParam.value_format
  }

  if (measureLength > 1) {
    assignNameLabel(fieldsObj.measures[1]);
  } else if (measureLength === 1 && dimensionLength) {
    assignNameLabel(fieldsObj.dimensions[0]);
  } else if (!measureLength && dimensionLength > 1) {
    assignNameLabel(fieldsObj.dimensions[1]);
  } else {
    const fieldObj = getLeftMostField(fieldsObj);
    assignNameLabel(fieldObj);
  }

  if(!valueFormat){
    valueFormat = '0,0'
  }
  return { name, label, valueFormat };
}

function getComparisonValue(data, field, isLeftMostAlsoSecondLeftMost = false) {
  let value = "";
  if (isLeftMostAlsoSecondLeftMost) {
    value = data[1][field.name];
  } else {
    !data.length ? (value = "No Data") : (value = data[0][field.name]);
  }
  return value;
}

function getComparisonDrillLinks(data, field, isLeftMostAlsoSecondLeftMost = false) {
  let links = [];
  if (isLeftMostAlsoSecondLeftMost) {
    links = data[1][field.name].links;
  } else {
    !data.length ? (links = "No Data") : (links = data[0][field.name].links);
  }
  return links;
}

function makeLabel(config, secondLeftMostField) {
  let label = "";
  if (config.show_comparison && config.show_label) {
    config.label
      ? (label = config.label)
      : (label = secondLeftMostField.label);
  }

  if(config.labelStyle !== "choose"){
    if(config.labelStyle === "italic"){
      label = <i>{label}</i>
    }
    else{
    label = <b>{label}</b>
    }

  }
  return label;
}

function makeTitle(config) {
  let title = "";
  if (config.show_title) {
    title = config.title;
  }
  return title;
}

function showAsChange(val, pos_bad, format) {
  let formattedValue = val;
  const posSpan = <span style={{ color: "#5f9524" }}>{`▲ ${numeral(val).format(format)}`}</span>;
  const badSpan = <span style={{ color: "#cc1F37" }}>{`▼ ${numeral(val).format(format)}`}</span>;
  const pos = pos_bad ? badSpan : posSpan;
  const bad = pos_bad ? posSpan : badSpan;
  if (typeof val === "number") {
    if (Math.sign(val) === 1) {
      formattedValue = pos;
    } else if (Math.sign(val) === -1) {
      formattedValue = bad;
    } else {
      formattedValue = <span>{`${val}`}</span>;
    }
  }
  console.log(formattedValue)
  return formattedValue;
}

function calcPercentage(val1, val2) {
  const percentage = { value: 0, rendered: "" };
  if (typeof val1 !== "number" || typeof val2 !== "number") {
    percentage.rendered = "∅";
  } else {
    percentage.value = (val1 / val2) * 100;
    percentage.rendered = `${Math.floor(percentage.value)}%`;
  }
  return percentage;
}

function returnOperation(string) {
  var operation;
  if (string === "equal_to") {
    operation = "===";
  } else if (string === "not_equal_to") {
    operation = "!==";
  } else if (string === "less_than") {
    operation = "<";
  } else {
    operation = ">";
  }
  return operation;
}

function conditionallyFormat(leftVal, operation, comparedVal, fontCol, BG) {
  if (typeof leftVal !== "number" || !comparedVal) {
    return leftVal;
  }

  if (eval(`${leftVal} ${returnOperation(operation)} ${comparedVal}`)) {
    // bodyColor = BG
    document.body.style.backgroundColor = BG
    return (
      <span
        style={{
          padding: "100vw",
          backgroundColor: `${BG}`,
          color: `${fontCol}`,
        }}
      >{`${leftVal}`}</span>
    );
  } else {
    document.body.style.backgroundColor = "rgba(255, 0, 0, 0.0)"
    return leftVal;
  }
}



export const parseData = (data, queryResponse, config) => {
  const leftMostField = getLeftMostField(queryResponse.fields);
  const secondLeftMostField = getSecondLeftMostField(queryResponse.fields);
  const leftMostValue = getComparisonValue(data, leftMostField)
  const leftMostLinks = getComparisonDrillLinks(data, leftMostField);
  const leftMostFormat = leftMostField.valueFormat
  const secondLeftMostFormat = secondLeftMostField.valueFormat
  const secondLeftMostLinks = config.show_comparison
    ? getComparisonDrillLinks(
        data,
        secondLeftMostField,
        leftMostField.name === secondLeftMostField.name
      )
    : [];

  const secondLeftMostValue = config.show_comparison
    ? getComparisonValue(
        data,
        secondLeftMostField,
        leftMostField.name === secondLeftMostField.name
      )
    : "";
// console.log("val", secondLeftMostValue.value)
  if (
    config.compareType === "show_as_change" &&
    typeof secondLeftMostValue === "object" &&
    typeof secondLeftMostValue.value === "number"

  ) {
    secondLeftMostValue.rendered = showAsChange(
      secondLeftMostValue.value,
      config.pos_bad,
      secondLeftMostFormat
    );
  }

  const percentage = calcPercentage(
    leftMostValue.value,
    secondLeftMostValue.value
  );

  const label = makeLabel(config, secondLeftMostField);
  const title = makeTitle(config);
  if (config.format !== "select" && typeof leftMostValue === "object") {
    leftMostValue.value = conditionallyFormat(
      leftMostValue.value,
      config.format,
      config.formatVal,
      config.formatFontColor,
      config.formatBGColor
    );
  }

  return { leftMostValue, secondLeftMostValue, label, title, percentage,  leftMostLinks, secondLeftMostLinks, leftMostFormat, secondLeftMostFormat};
};
