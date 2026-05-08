looker.plugins.visualizations.add({
  id: "hello_viz",
  label: "Hello Viz",
  options: {
    font_size: {
      type: "string",
      label: "Font Size",
      values: [{"Large": "24px"}, {"Small": "14px"}],
      display: "radio",
      default: "24px"
    }
  },
  create: function(element, config) {
    element.style.fontFamily = "Arial, sans-serif";
    element.style.display = "flex";
    element.style.flexWrap = "wrap";
    element.style.gap = "12px";
    element.style.padding = "16px";
  },
  updateAsync: function(data, element, config, queryResponse, details, done) {
    // Clear previous render
    element.innerHTML = "";

    var dimName  = queryResponse.fields.dimensions[0].name;
    var measName = queryResponse.fields.measures[0].name;

    var colors = ["#00529B", "#0077CC", "#33A1DE", "#66C2F0", "#99DCFF"];

    data.forEach(function(row, i) {
      var card = document.createElement("div");
      card.style.cssText = [
        "background:" + colors[i % colors.length],
        "color:#fff",
        "border-radius:8px",
        "padding:16px 24px",
        "min-width:160px",
        "text-align:center",
        "box-shadow:0 2px 6px rgba(0,0,0,0.15)"
      ].join(";");

      var label = document.createElement("div");
      label.style.fontSize = "12px";
      label.style.opacity  = "0.85";
      label.textContent = row[dimName].value;

      var value = document.createElement("div");
      value.style.fontSize = config.font_size || "24px";
      value.style.fontWeight = "bold";
      value.style.marginTop = "6px";
      value.textContent = row[measName].rendered || row[measName].value;

      card.appendChild(label);
      card.appendChild(value);
      element.appendChild(card);
    });

    done();
  }
});
