# L.Control.AccordionLegend

An attractive accordion legend for Leaflet. Features include:
* Checkboxes to toggle layer visibility
* Expanding and collapsing sections for grouping the layers
* Opacity sliders

https://github.com/GreenInfo-Network/L.Control.AccordionLegend

http://greeninfo-network.github.io/L.Control.AccordionLegend



# Basic Usage

The *content* parameter is a structure for the legend. This consists of a list of "sections" and within each section a list of "layers" This is best illustrated with an example.

```
    var LAYERS_AND_LEGENDS = [
        {
            'title': "Base Maps",
            layers: [
                {
                    'title': "OSM Basemap",
                    'layer': L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {}),
                    'legend': [
                        { 'type':'line', 'color':'#e99dae', 'text':"Interstate Highway" },
                        { 'type':'line', 'color':'#f2baa8', 'text':"State Highway" },
                        { 'type':'line', 'color':'#e1c6db', 'text':"State Boundary" },
                        { 'type':'square', 'color':'#bdd3d3', 'text':"Water" },
                    ],
                },
                // add more layer objects to this section
            ]
        },
        // add more sections, with a 'section' title and a list of layers:[]
        {
            'title': "Second Section",
            layers: [ ... add layers to this accordion section ... ]
        },
    ];

    new L.Control.AccordionLegend({
        content: LAYERS_AND_LEGENDS,
    }).addTo(map);
```

A more formal description is as follows:
* The structure consists of a list of *Section* objects. These will be drawn in the sequence given.
* Each Section consists of the following:
    * A *title* attribute, this being the title of the section. This is used as an internal reference and therefore *must be unique* among Sections.
    * A *layers* attribute, this being a list of Layer objects.
* Each Layer object is structured as follows:
    * A *title* attribute, which is the title displayed in the legend. This is used as an internal reference and therefore *must be unique* among other Layers.
    * A *layer* attribute, which is the L.TileLayer instance to be managed by this legend entry.
    * A *legend* attribute, this being the list of *Legend* objects to be displayed for this layer.
* The list of Legend objects, are as follows:
    * A *type* attribute, which affects the legend swatch generated.
        * *square* -- The legend swatch will be a square.
        * *circle* -- The legend swatch will be a circle.
        * *line* -- The legend swatch will be a line.
        * *image* -- The legend swatch will be an image. The image will be sized to 1em X 1em, so should be about that size (15px or so) in order to look good.
    * A *color* attribute, this being the color of the swatch for this classification. This is only effective for *square*, *line*, and *circle* types.
    * A *url* attribute, this being the URL of the image. This is only effective for *image* types.
    * A *text* attribute, this being the text to display for this classification.
    * The Legend may be an empty list, in order to generate no visible legend.



# Other Methods and Tricks

**toggleLayer(layertitle,onoff)**

Toggle the specified layer to the specified on/off status.

**setOpacity(layertitle,opacity)**

Adjust the opacity of the specified layer. Opacity values are from 0.0 to 1.0 per standard Leaflet behavior.

**collapseUI()**

Collapse the control, hiding the panel of sections and layers.

**expandUI(sectiontitle)**

Expand the control, showing the panel of sections and layers. As a convenience, you may optionally specify the title of a Section and this will call expandSection(sectiontitle) for you.

**toggleUI()**

Calls either expandUI() or collapseUI() to show/hide the panel.

**expandSection(sectiontitle)**

Within the panel, expand the given section to show its layers. Since only one sections stays open at a time, this would implicitly close other sections.

**collapseSection(sectiontitle)**

Within the panel, collapse the given section.

**toggleSection(sectiontitle)**

Within the panel, expand the given section (f it's collapsed) or collapse the given section (if it's expanded).

**listLayersStates()**

Returns an object keyed by *layertitle* with values being that layer's *opacity*. This would be used to "peek" at the opacity and on/off state of all layers, in case you wanted to construct some additional control or usage. An example would be some external need to loop over all visible layers, or to construct a list of layers-and-opacity pairings for serializing the map state.
