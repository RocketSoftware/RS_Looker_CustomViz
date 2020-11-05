const modifyOptions = (vis, config, qr) => {
  let options = {};

 

  options.valueColor = {
    order: 0,
    default: "rgb(39, 39, 39)",
    display: "color",
    display_size: "half",
    label: "Value Color",
    section: "Style",
    type: "string",
  };

  options.secondValueColor = {
    order: 1,
    default: "rgb(39, 39, 39)",
    display: "color",
    display_size: "half",
    label: "Second Value Color",
    section: "Style",
    type: "string",
  };
  
  options.titleColor = {
    order: 2,
    default: "rgb(39, 39, 39)",
    display: "color",
    display_size: "half",
    label: "Title Color",
    section: "Style",
    type: "string",
  };
  options.labelColor = {
    order: 3,
    default: "rgb(39, 39, 39)",
    display: "color",
    display_size: "half",
    label: "Label Color",
    section: "Style",
    type: "string",
  };

  options.valueSize = {
    order: 4,
    default: 72,
    display_size: 'third',
    label: "Value Size",
    section: "Style",
    type: 'number',
  },


  options.labelSize = {
    order: 5,
    default: 16,
    display_size: "third",
    label: "Label Size",
    section: "Style",
    type: "number",
  };

  options.secondValueSize = {
    order: 6,
    default: 16,
    display_size: "third",
    label: "Value 2 Size",
    section: "Style",
    type: "number",
  };
  options.labelStyle = {
    order: 7,
    default: "choose",
    display: "select",
    label: "Select Label Style",
    section: "Style",
    type: "string",
    values: [
      { "Choose Font Style": "choose" },
      { "Italic": "italic" },
      { "Bold": "bold" },
    ]};
  

  options.show_title = {
    order: 8,
    display_size: "whole",
    type: "boolean",
    label: "Show Title",
    default: false,
    section: "Style",
  };

  if(config.show_title){
    options.title = {
      order: 9,
      display_size: "whole",
      type: "string",
      label: "Title",
      placeholder: "Title overide",
      section: "Style",
      default: "",
    };
    options.titleSize = {
      order: 10,
      default: 20,
      display_size: "whole",
      label: "Title Font Size",
      section: "Style",
      type: "number",
    };
  }

  options.show_comparison = {
    order: 0,
    display_size: "whole",
    type: "boolean",
    label: "Show Comparison",
    default: false,
    section: "Comparison",
  };

  if(config.show_comparison){

    (options.compareType = {
      default: "show_as_value",
      display: "select",
      label: "Value Label",
      order: 0.5,
      section: "Comparison",
      type: "string",
      values: [
        { "Show as Value": "show_as_value" },
        { "Show as Change": "show_as_change" },
        { "Calculate Progress": "calculate_progress" },
        { "Calculate Progress With Precentage": "calculate_progress_with_percentage" },
      ],
    });
    if(config.compareType === "show_as_change"){
      options.pos_bad = {
        order: 1,
        display_size: "whole",
        type: "boolean",
        label: "Positive Values Are bad",
        default: false,
        section: "Comparison",
      };
    }
   
  (options.show_label = {
        order: 2,
        display_size: "whole",
        type: "boolean",
        label: "Show Label",
        default: false,
        section: "Comparison",
      });
      if(config.show_label){
        options.label = {
          order: 3,
          display_size: "whole",
          type: "string",
          label: "Label",
          placeholder: "Leave blank to use field label",
          section: "Comparison",
          default: "",
        };
      }
  }
  

  (options.format = {
    default: "select",
    display: "select",
    label: "Format Filter",
    order: 0,
    section: "Formatting",
    type: "string",
    values: [
      { "select formatting filter": "select" },
      { "equal to": "equal_to" },
      { "not equal to": "not_equal_to" },
      { "less than": "less_than" },
      { "greater than": "greater_than" },
    ],
  });

  if(config.format !== "select"){
    options.formatVal = {
      order: 1,
      display_size: "whole",
      type: "string",
      label: "Value",
      placeholder: "value to format against",
      section: "Formatting",
      default: "",
    };
  
    options.formatBGColor = {
      order: 2,
      default: "#592EC2",
      display: "color",
      display_size: "half",
      label: "Background Color",
      section: "Formatting",
      type: "string",
    };
  
    options.formatFontColor = {
      order: 3,
      default: "rgb(39, 39, 39)",
      display: "color",
      display_size: "half",
      label: "Font Color",
      section: "Formatting",
      type: "string",
    };
    // options.hidden = {
    //   order: 21,
    //     display_size: "whole",
    //     type: "boolean",
    //     label: "kudsryfgc",
    //     default: true,
    //     hidden: true
    // };
  }



  vis.trigger("registerOptions", options);
};

export default modifyOptions;
