var path = require('path')

const UglifyJSPlugin = require('uglifyjs-webpack-plugin')

var webpackConfig = {
  entry: {
    // amcharts_line: './src/amcharts_line/myvis_vis_def.js',
    rs_single_value: './src/rs_single_value/myvis_vis_def.js',
    // gauge_vis: "./src/gauge_vis/gauge_vis_def.js",
    // calendar: './src/calendar/myvis_vis_def.js',
    // horizontal_bar: './src/horizontal_bar/myvis_vis_def.js',
    // responsive_table: './src/responsive_table/responsive-table-def.js',
    // drill_vis: "./src/drill_vis/tubevis_vis_def.js",
    // tube_vis: "./src/tube_vis/tubevis_vis_def.js",
    // waterfall_vis: "./src/waterfall_vis/myvis_vis_def.js",
    // firehouse_scorecard: "./src/firehouse_scorecard/scorecard_vis_def.js",
    // uberflip_single_value: "./src/uberflip_single_value/myvis_vis_def.js",
    // wb_3d_scatterplot: "./src/wb_3d_scatterplot/myvis_vis_def.js",
    // uberflip_funnel: "./src/uberflip_funnel/funnel_vis_def.js",
    // uberflip_wordcloud: "./src/uberflip_wordcloud/wordcloud_vis_def.js",
    // hm: './src/highcharts/examples/heatmap/heatmap.js',
    // v1_common: './src/highcharts/common/common-entry.js',
    // hello_world: './src/highcharts/examples/hello_world/hello_world.js',
    // hello_world_react: './src/highcharts/examples/hello_world_react/hello_world_react.js',
  },
  output: {
    filename: "[name].js",
    path: path.join(__dirname, "dist"),
    library: "[name]",
    libraryTarget: "umd"
  },
  resolve: {
    extensions: [".ts", ".js", ".jsx"]
  },
  plugins: [
    //new UglifyJSPlugin()
  ],
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/
      },
      {
        test: /\.(js|jsx)$/,
        use: "babel-loader",
        exclude: /node_modules/
      },
      {
        test: /\.css$/,
        use: ['to-string-loader', 'css-loader'],
        exclude: /node_modules/

      }
    ],
    loaders: [
      { test: /\.(js|jsx)$/, loader: "babel-loader" },
      { test: /\.ts$/, loader: "ts-loader" },
      { test: /\.css$/, loader: ['to-string-loader', 'css-loader'] }
    ]
  },
  stats: {
    warningsFilter: /export.*liquidfillgauge.*was not found/
  }
}

module.exports = webpackConfig
