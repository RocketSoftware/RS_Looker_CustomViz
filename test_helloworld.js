looker.plugins.visualizations.add({
  id: "hello_world_single_value",
  label: "Hello World Single Value",
  options: {},
 
  create: function (element, config) {
    this._container = element.appendChild(document.createElement("div"));
    this._container.id = "hello-world-container";
  },
 
  updateAsync: function (data, element, config, queryResponse, details, done) {
    this.clearErrors();
 
    // Require at least one field
    var fields = queryResponse.fields.measure_like.concat(
      queryResponse.fields.dimension_like
    );
 
    if (fields.length === 0) {
      this.addError({
        title: "No Fields",
        message: "This visualization requires at least one field.",
      });
      done();
      return;
    }
 
    // Get the first field's value from the first row
    var firstField = fields[0];
    var value =
      data.length > 0 ? data[0][firstField.name].rendered ||
        data[0][firstField.name].value : "Hello World";
 
    this._container.innerHTML =
      "<p>Hello World: " + value + "</p>";
 
    done();
  },
});
 