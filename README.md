# LayerDefinitionExample
CMV widget for layer definition demo

Config Setting
            
            layerDefinitionExample: {
                include: true,
                id: 'layerDefinitionExample',
                type: 'titlePane',
                canFloat: true,
                path: 'widgets/WindStation',
                title: '<i class="icon-large icon-upload"></i>&nbsp;&nbsp;Layer Definition Example',
                position: 19,
                options: {
                    map: true
                }
            }
            
            
Legend

Becasue it is not a layer that defined in config file, so we have to process our own legend. The simple way is to use the right pane, in that pane, we just need to define a div for the legend

        	right: {
        		id: 'sidebarRight',
        		placeAt: 'outer',
        		region: 'right',
        		splitter: true,
            open: 'none',
        		collapsible: true,
                content: '<div id="legendDiv" style="height:100%;"></div>'
        	}, 
        	
Map Service we are using is from the ESRI example
   
            https://developers.arcgis.com/javascript/jssamples/map_multiplelayerdef.html

