/*
 * Github project: https://github.com/GreenInfo-Network/L.Control.AccordionLegend
 *
 * Usage:
 *      // feed it a set of sections and layer-legend items
 *      // keep a reference to our layerControl cuz we will need it to generate and apply shared states... see getStatefulParams()
 *      var LAYERS_AND_LEGENDS = [
 *          {
 *              'title': "Community Engagement",
 *              layers: [.
 *                  {
 *                      'layer': 'Meeting_Locations',
 *                      'title': "Workshop locations",
 *                      'type': 'point',
 *                      'legend': [
 *                          { 'color':'rgb(235,200,55)', 'text':"Workshop location" },
 *                      ],
 *                  },
 *                  {
 *                      'layer': 'LanguageTranslation_Recommendation',
 *                      'title': "Tool kit languages, recommended",
 *                      'type': 'polygon',
 *                      'legend': [
 *                          { 'color':'rgb(204,204,204)', 'text':"English Only" },
 *                          { 'color':'rgb(115,90,242)', 'text':"Armenian" },
 *                          { 'color':'rgb(230,102,25)', 'text':"Chinese" },
 *                          { 'color':'rgb(84,217,217)', 'text':"Spanish" },
 *                          { 'color':'rgb(230,51,128)', 'text':"Spanish and Korean" },
 *                      ],
 *                  },
 *                  {
 *                      'layer': 'LanguageTranslation_Actual',
 *                      'title': "Tool kit languages, actual",
 *                      'type': 'polygon',
 *                      'legend': [
 *                          { 'color':'rgb(204,204,204)', 'text':"English Only" },
 *                          { 'color':'rgb(230,102,25)', 'text':"Chinese Only" },
 *                          { 'color':'rgb(84,217,217)', 'text':"Spanish Only" },
 *                          { 'color':'rgb(115,89,191)', 'text':"Spanish and Chinese" },
 *                          { 'color':'rgb(230,51,128)', 'text':"Spanish and Korean" },
 *                      ],
 *                  },
 *              ]
 *          },
 *      ];
 *      var layerControl = new L.Control.AccordionLegend({
 *          position: 'topleft',
 *          content: LAYERS_AND_LEGENDS,
 *      }).addTo(this.map).expandUI('Community Engagement').toggleLayer('LanguageTranslation_Actual',true);
 */

L.Control.AccordionLegend = L.Control.extend({
    options: {
        position: 'topleft'
    },
    initialize: function(options) {
        if (! options.content || ! Array.isArray(options.content) ) throw "L.Control.AccordionLegend: missing content list";
        L.setOptions(this,options);

        this.map = null;        // linkage to our containing L.Map instance
    },
    onAdd: function (map) {
        // add a linkage to the map, since we'll be managing map layers
        // and initialize our local registries of buttons, checkboxes, etc. for random access later
        var control = this;
        control.map = map;
        control.layerRegistry    = {};
        control.checkboxRegistry = {};
        control.titlebarRegistry = {};

        // first and foremost
        // we need to in fact create the L.TileLayer.WMS instances!
        this.options.content.forEach(function (section) {
            section.layers.forEach(function (layer) {
                control.layerRegistry[layer.title] = layer.layer;
            });
        });

        // okay
        // now we're good to start building the control

        // create our main container; the real action is inside the button and the panel, but they share this parent container
        var maindiv = L.DomUtil.create('div', 'leaflet-control-accordionlegend');

        // first, the button
        var button          = L.DomUtil.create('div', 'leaflet-control-accordionlegend-button', maindiv);
        button.control      = this;
        button.innerHTML    = 'Map Layers';
        L.DomEvent
            .addListener(button, 'mousedown', L.DomEvent.stopPropagation)
            .addListener(button, 'click', L.DomEvent.stopPropagation)
            .addListener(button, 'click', L.DomEvent.preventDefault)
            .addListener(button, 'click', function () {
                this.control.toggleUI();
            });

        // the panel
        // iterate over the accordion sections...
        // then iterate over layers within the section, generating both the map's L.TileLayer and also the legend entry with colored swatches and all
        var panel          = L.DomUtil.create('div', 'leaflet-control-accordionlegend-panel', maindiv);
        panel.control      = this;

        var sections = [];
        this.options.content.forEach(function (section) {
            // part 1
            // the title and toggle behavior, which itself is more complicated than it should be cuz of the toggling triangles
            // the 'sectitle' title bars get logged into titlebarRegistry
            // this is a mapping of name => [titlebar,div] and is used to random-access so one can toggle a section by name
            var sectitle = L.DomUtil.create('h2', 'accordionlegend-section-title', panel);
            var triangle = L.DomUtil.create('i', '+', sectitle);
            var title    = L.DomUtil.create('span', '', sectitle);
            title.innerHTML = section.title;

            var secdiv = L.DomUtil.create('div', 'accordionlegend-section accordionlegend-section-hidden', panel);

            control.titlebarRegistry[section.title] = [ sectitle, secdiv, triangle ];
            L.DomEvent
                .addListener(sectitle, 'mousedown', L.DomEvent.stopPropagation)
                .addListener(sectitle, 'click', L.DomEvent.stopPropagation)
                .addListener(sectitle, 'click', L.DomEvent.preventDefault)
                .addListener(sectitle, 'click', function () {
                    control.toggleSection(section.title);
                });

            L.DomEvent
                .addListener(secdiv, 'mousedown', L.DomEvent.stopPropagation)
                .addListener(secdiv, 'click', L.DomEvent.stopPropagation);

            // part 2
            // the 'secdiv' content of the layer-legends and layer-checkboxes
            // keep a registry of checkboxes, cuz toggleLayer() will need random access to them
            section.layers.forEach(function (layer) {
                var layerdiv = L.DomUtil.create('div', 'accordionlegend-layer', secdiv);
                var clbl = L.DomUtil.create('label', '', layerdiv);
                var cbox = L.DomUtil.create('input', '', clbl);
                cbox.type  = 'checkbox';
                cbox.value = layer.title;
                var ctxt = L.DomUtil.create('span', '', clbl);
                ctxt.innerHTML = ' ' + layer.title;

                control.checkboxRegistry[layer.title] = cbox; // the checkbox registry for toggleLayer()

                var legend = L.DomUtil.create('div', 'accordionlegend-legend accordionlegend-legend-hidden', layerdiv);

                var startingOpacity = layer.type == 'point' ? 100 : 66;
                var slider = L.DomUtil.create('input', 'accordionlegend-slider', legend);
                slider.type  = 'range';
                slider.min   = '0';
                slider.max   = '100';
                slider.title = 'Adjust the layer opacity';
                slider.value = layer.layer.options.opacity ? 100 * layer.layer.options.opacity : 100;
                L.DomEvent.addListener(slider, 'change', function() {
                    var opacity = 0.01 * this.value;
                    control.setOpacity(layer.title,opacity);
                });

                L.DomEvent.addListener(cbox, 'change', function () {
                    var layername = this.value;
                    var onoff     = this.checked;
                    if (onoff) {
                        L.DomUtil.removeClass(legend, 'accordionlegend-legend-hidden');
                        control.toggleLayer(layername,true);
                    }
                    else {
                        L.DomUtil.addClass(legend, 'accordionlegend-legend-hidden');
                        control.toggleLayer(layername,false);
                    }
                });

                layer.legend.forEach(function (classification) {
                    var swatchline = L.DomUtil.create('div', '', legend);

                    var swatch = L.DomUtil.create('div', 'accordionlegend-swatch', swatchline);
                    swatch.style.backgroundColor = classification.color;
                    var text   = L.DomUtil.create('div', 'accordionlegend-swatch-text', swatchline);
                    text.innerHTML = classification.text;

                    if (layer.type == 'point') L.DomUtil.addClass(swatch, 'accordionlegend-swatch-circle');
                });
            });
            sections.push(secdiv);
        });

        // assign all our buttons, panels, and DIVs where we can find them later
        // by "later" we mean a few lines below whrere we do final cleanup work
        this.maindiv = maindiv;
        this.button  = button;
        this.panel   = panel;

        // panel afterthought: on window resize try and make the panel have a height no more than 75% of the window height, to reduce the likelihood of over-length content pushing it past the bottom of the screen
        // 75% is a wild guess at a height that won't overflow past the bottom: an exact height depends on headers and footers, font sizes, ...
        var handleResize = function () {
            control.panel.style.maxHeight = (0.75 * window.innerHeight)+'px';
        };
        L.DomEvent.addListener(window, 'resize', handleResize);
        handleResize();

        // collapse the UI
        this.collapseUI();

        // and we're done!
        return maindiv;
    },
    toggleLayer: function (layername,onoff) {
        var map   = this.map;
        var layer = this.layerRegistry[layername];
        var cbox  = this.checkboxRegistry[layername];
        if (onoff) {
            cbox.checked = true;
            map.addLayer(layer);
        }
        else {
            cbox.checked = false;
            map.removeLayer(layer);
        }

        // return myself cuz method chaining is awesome
        return this;
    },
    listLayersStates: function () {
        var layerStates = {};
        var map = this.map;
        var layerRegistry = this.layerRegistry;

        // returns assoc: layername => opacity/false
        Object.keys(this.layerRegistry).forEach(function (layername) {
            layerStates[layername] = map.hasLayer(layerRegistry[layername]) ? Math.round(100*layerRegistry[layername].options.opacity) : false;
        });
        return layerStates;
    },
    setOpacity: function (layername,opacity) {
        var layer = this.layerRegistry[layername];
        layer.setOpacity(opacity);

        // return myself cuz method chaining is awesome
        return this;
    },
    toggleUI: function () {
        var viz = L.DomUtil.hasClass(this.panel, 'leaflet-control-accordionlegend-panel-hidden');
        viz ? this.expandUI() : this.collapseUI();
        return this;
    },
    expandSection: function (sectionname) {
        // collapse all section and expand the selected one
        // if the expanded one doesn't match e.g. "" or null or some such, then expanding nothing is a useful outcome
        var control = this;
        Object.keys(this.titlebarRegistry).forEach(function (thistitle) {
            var sectitle = control.titlebarRegistry[thistitle][0];
            var secdiv   = control.titlebarRegistry[thistitle][1];
            var triangle = control.titlebarRegistry[thistitle][2];

            if (sectionname === thistitle) {
                L.DomUtil.removeClass(secdiv, 'accordionlegend-section-hidden');
                triangle.innerHTML = '-';
            }
            else {
                L.DomUtil.addClass(secdiv, 'accordionlegend-section-hidden');
                triangle.innerHTML = '+';
            }
        });
    },
    collapseSection: function (sectionname) {
        var control = this;
        Object.keys(this.titlebarRegistry).forEach(function (thistitle) {
            if (sectionname !== thistitle) return; // not the one we want, not interested

            // collapse this section, plain and simple
            var sectitle = control.titlebarRegistry[sectionname][0];
            var secdiv   = control.titlebarRegistry[sectionname][1];
            var triangle = control.titlebarRegistry[sectionname][2];

            L.DomUtil.addClass(secdiv, 'accordionlegend-section-hidden');
            triangle.innerHTML = '+';
        });
    },
    toggleSection: function (sectionname) {
        var control = this;
        Object.keys(this.titlebarRegistry).forEach(function (thistitle) {
            if (sectionname !== thistitle) return; // not the one we want, not interested

            // now we've found the section, the titlebar, etc.
            // and can decide whether we really wanted collapseSection() or expandSection()
            var secdiv = control.titlebarRegistry[thistitle][1];
            var hidden = L.DomUtil.hasClass(secdiv, 'accordionlegend-section-hidden');
            if (hidden) {
                control.expandSection(sectionname);
            }
            else {
                control.collapseSection(sectionname);
            }
        });
    },
    collapseUI: function () {
        // add the CSS which hides the legend panel
        L.DomUtil.addClass(this.panel,'leaflet-control-accordionlegend-panel-hidden');

        // return myself cuz method chaining is awesome
        return this;
    },
    expandUI: function (sectionname) {
        // add the CSS which hides the legend panel
        L.DomUtil.removeClass(this.panel,'leaflet-control-accordionlegend-panel-hidden');

        // if a section name was given, then toggle the accordion to open that section
        if (sectionname) this.expandSection(sectionname);

        // return myself cuz method chaining is awesome
        return this;
    }
});
