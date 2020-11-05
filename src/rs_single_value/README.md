## Generic Custom Vis

This is a skeleton repo for making a custom vis. It is a pared down version of the original Looker custom_visualizations_v2 repo. It assumes React and yarn.

### Quick start:

For dev, comment out `UglifyJSPlugin()` in `webpack.config.js` for faster build cycles.
Once: `$ yarn` to initialize project.

Terminal window 1:
`$ yarn watch` for hot reloading of changes

Terminal window 2:
`$ cd dist && pyhttps or http-server -p 3000 then use ngrok for https` to start server, add `localhost:4443/my_vis.js or https://ngrok.io/my_vis.js` to looker.



### Guided tour:

`myvis_vis_def.js` is the entry point. It has the setup logic that looker expects, ie, a `create` and `updateAsync` function. It is set up to render one component and import the required css.

`MyVis.jsx` is your top-level React component. The vis is set up to render this component. Pass it any props that you might need (most likely qr, data, config).

`css/my_vis.css` is already pulled into the setup as well, so you can set and reference styles here to have them reflected in your components.

`options.js` contains your vis config options (the UI settings that appear on the side of your vis in Looker) - there is a link at the top of this file to refresh your memory on how to structure each config option.

`modifyOptions.js` - this is only necessary if you need vis config options which aren't known ahead of time - a common example would be an individual input box for each measure the user has selected. More info in this file.
If the only config options you have are provided inside `options.js`, then you don't need this.


Things should just work as is, but you probably want to grep around for variations of `myVis`, `my_vis`, `MY_VIS`, `etc...` and rename them according to the current vis you're working on.

This was originally written in the before times, but it should be React hooks + TS ready if you want to work with either of these.