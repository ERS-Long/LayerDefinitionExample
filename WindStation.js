define([
    'dojo/_base/declare',
    'dijit/_WidgetBase',
    'dijit/_TemplatedMixin',
    'dijit/_WidgetsInTemplateMixin',
    'dijit/form/Button',
    'dojo/_base/lang',
    'dojo/_base/array',
    'dojo/dom', 
    'dojo/domReady!',
    'dojo/on',
    'dojo/text!./WindStation/templates/WindStation.html',
    'dojo/topic',
    'xstyle/css!./WindStation/css/WindStation.css',
    'dojo/dom-construct',
    'dojo/_base/Color',

    'esri/graphic',
    'esri/IdentityManager',
    'esri/layers/GraphicsLayer',
    'esri/layers/ArcGISDynamicMapServiceLayer',
    'esri/layers/ImageParameters',
    'esri/tasks/IdentifyTask',
    'esri/tasks/IdentifyParameters',
    'esri/InfoTemplate',
    'esri/dijit/Legend'
], function (declare, _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, Button, lang, arrayUtils, dom, ready, on, template, topic, css, domConstruct, Color, Graphic, 
    IdentityManager, GraphicsLayer, ArcGISDynamicMapServiceLayer, ImageParameters, IdentifyTask, IdentifyParameters, InfoTemplate, Legend
    ) {
    var dynamicMapServiceLayer;
    var map;
    var identifyTask, identifyParams;
    var legend;

    return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {
        name: 'WindStation',
        map: true,
        widgetsInTemplate: true,
        templateString: template,
        mapClickMode: null,

        postCreate: function(){
            this.inherited(arguments);
            map = this.map;
        //    this.initTrace();
        },

        AddStation: function () {
            //alert(this.map.extent.xmin);
            var imageParameters = new ImageParameters();
            imageParameters.format = "png32"; 
            
// here to get the layer defination setting from thh user input
          var layerDefs = [];
          var state = document.getElementById('State').value;
          var minPopulation = document.getElementById('minPopulation').value;
          var maxPopulation = document.getElementById('maxPopulation').value;

          layerDefs[5] = "STATE_NAME='" + state + "'";
          layerDefs[4] =  layerDefs[5] + "and POP2007>" + minPopulation + "and POP2007<" + maxPopulation; //STATE_NAME='Kansas' and POP2007>25000";
          layerDefs[3] = layerDefs[4] ;//"STATE_NAME='Kansas' and POP2007>25000";
          imageParameters.layerDefinitions = layerDefs;

          //I want layers 5,4, and 3 to be visible
          imageParameters.layerIds = [5, 4, 3];
          imageParameters.layerOption = ImageParameters.LAYER_OPTION_SHOW;
          imageParameters.transparent = true;

          var legendLayers = [];

     //       var url = "http://maps1.arcgisonline.com/ArcGIS/rest/services/NWS_Weather_Stations/MapServer";
          var url = "http://sampleserver1.arcgisonline.com/ArcGIS/rest/services/Demographics/ESRI_Census_USA/MapServer";
          if (dynamicMapServiceLayer)
          {
            console.log(dynamicMapServiceLayer.id);
            dynamicMapServiceLayer = this.map.getLayer(dynamicMapServiceLayer.id);
            dynamicMapServiceLayer.setLayerDefinitions(layerDefs);
          }
          else
          {
            dynamicMapServiceLayer = new ArcGISDynamicMapServiceLayer(url, {
              "opacity" : 1.0,
              "imageParameters" : imageParameters
            });

          legendLayers.push({ layer: dynamicMapServiceLayer, title: 'ESRI_Census_USA' });
//          this.map.on('layers-add-result', function () {
          if (!legend)  
          {
            legend = new Legend({
              map: this.map,
              layerInfos: legendLayers
            }, "legendDiv");
            legend.startup();
          }
//        });
            this.map.addLayer(dynamicMapServiceLayer);
          }

          this.map.on('click', mapReady);


          function mapReady (event) {
            console.log(url);
            //map.on("click", executeIdentifyTask);
            //create identify tasks and setup parameters
            identifyTask = new IdentifyTask(url);

            identifyParams = new IdentifyParameters();
            identifyParams.tolerance = 3;
            identifyParams.returnGeometry = true;
            identifyParams.layerIds = [3,4, 5];
            identifyParams.layerOption = IdentifyParameters.LAYER_OPTION_VISIBLE;
            identifyParams.width = map.width;
            identifyParams.height = map.height;

            identifyParams.geometry = event.mapPoint;
            identifyParams.mapExtent = map.extent;

  //console.log(identifyParams.geometry);

            var deferred = identifyTask
              .execute(identifyParams)
              .addCallback(function (response) {
                // response is an array of identify result objects
                // Let's return an array of features.
                console.log(response);

                return arrayUtils.map(response, function (result) {
                  var feature = result.feature;
                  var layerName = result.layerName;

                  console.log(layerName);

                  feature.attributes.layerName = layerName;


                  var popupInofTemplate = new InfoTemplate("", '${*}');
                  feature.setInfoTemplate(popupInofTemplate);

                  return feature;
                });
              });

            // InfoWindow expects an array of features from each deferred
            // object that you pass. If the response from the task execution
            // above is not an array of features, then you need to add a callback
            // like the one above to post-process the response and return an
            // array of features.
            map.infoWindow.setFeatures([deferred]);
            map.infoWindow.show(event.mapPoint);
          }
        },

        onAddStation: function()
        {
            this.AddStation();
        },


        onClear: function()
        {
            //needs to remove the service
            if (dynamicMapServiceLayer){
                this.map.removeLayer(dynamicMapServiceLayer)
                dynamicMapServiceLayer = null;
            }
                
        }

    });
});
