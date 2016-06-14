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
            'title': "Examples 1",
            layers: [
                {
                    'title': "Stamen Watercolor",
                    'layer': L.tileLayer('http://{s}.tile.stamen.com/watercolor/{z}/{x}/{y}.jpg', { zIndex:1000, opacity:0.6 }),
                    'type': 'point', // point=circle icons in legend; anything_else=square icons in legend
                    'legend': [
                        { 'color':'#FF9933', 'text':"Legend Title and Color" },
                    ],
                },
                // add more layer objects to this section
            ]
        },
        {
            'title': "Examples 2",
            layers: [
                {
                    'title': "Stamen Toner",
                    'layer': L.tileLayer('http://{s}.tile.stamen.com/toner/{z}/{x}/{y}.png', { zIndex:1000, opacity:0.6 }),
                    'type': 'polygon', // point=circle icons in legend; anything_else=square icons in legend
                    'legend': [
                        { 'color':'#000000', 'text':"Legend Title and Color" },
                    ],
                },
                // add more layer objects to this section
            ]
        },
        // add more sections, with a 'section' title and a list of layers:[]
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
    * A *type* attribute, which affects the legend swatches generated.
        * If this is "point", then a circular legend swatch is used.
        * If this is any other value, then a rectangular legend swatch is used.
    * A *legend* attribute, this being the *Legend* object to be displayed for this layer.
* A Legend is a list object, containing legend entry objects as follows:
    * A *color* attribute, this being the color of the swatch for this classification.
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
