import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom'

import { Popover, Table, Button, Card } from 'antd';
import { CloseOutlined } from '@ant-design/icons';

import 'ol/ol.css';

import Feature from 'ol/Feature';
import Map from 'ol/Map';
import View from 'ol/View';
import GeoJSON from 'ol/format/GeoJSON';
import Circle from 'ol/geom/Circle';
import Overlay from 'ol/Overlay';
import { boundingExtent } from 'ol/extent';
import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer';
import { OSM, Vector as VectorSource } from 'ol/source';
import { Circle as CircleStyle, Fill, Stroke, Style } from 'ol/style';

const image = new CircleStyle({
    radius: 5,
    fill: new Fill({
        color: 'rgba(255, 0, 0, 0.25)'
    }),
    stroke: new Stroke({ color: 'red', width: 1 })
});


const styles = {
    'Point': new Style({
        image: image
    }),
    'LineString': new Style({
        stroke: new Stroke({
            color: 'green',
            width: 1
        })
    }),
    'MultiLineString': new Style({
        stroke: new Stroke({
            color: 'green',
            width: 1
        })
    }),
    'MultiPoint': new Style({
        image: image
    }),
    'MultiPolygon': new Style({
        stroke: new Stroke({
            color: 'yellow',
            width: 1
        }),
        fill: new Fill({
            color: 'rgba(255, 255, 0, 0.1)'
        })
    }),
    'Polygon': new Style({
        stroke: new Stroke({
            color: 'blue',
            lineDash: [4],
            width: 3
        }),
        fill: new Fill({
            color: 'rgba(0, 0, 255, 0.1)'
        })
    }),
    'GeometryCollection': new Style({
        stroke: new Stroke({
            color: 'magenta',
            width: 2
        }),
        fill: new Fill({
            color: 'magenta'
        }),
        image: new CircleStyle({
            radius: 10,
            fill: null,
            stroke: new Stroke({
                color: 'magenta'
            })
        })
    })
};

var styleFunction = function (feature) {
    return styles[feature.getGeometry().getType()];
};

interface GeoJSONViewerProps {
    source: GeoJSON
}

const GeoJSONViewer: React.FC<GeoJSONViewerProps> = ({ source } : GeoJSONViewerProps) => {
    const [selectedFeatureProps, setSelectedFeatureProps] = useState({});
    // Storing a function, see https://medium.com/swlh/how-to-store-a-function-with-the-usestate-hook-in-react-8a88dd4eede1
    const [closePopoverFunction, setClosePopOverFunction] = useState(() => () => {
        // Does nothing for now, updated once button is loaded
    })


    const mapId = `map-${Math.random()}`;

    var geojsonObject = source;
    console.log(source)
        

    let closePopover = () => {};

    useEffect(() => {
        const coords = geojsonObject!.features.map((feature) => feature.geometry.coordinates)
        const boundingBox = boundingExtent(coords);

        var vectorSource = new VectorSource({
            features: (new GeoJSON()).readFeatures(geojsonObject)
        });

        vectorSource.addFeature(new Feature(new Circle([5e6, 7e6], 1e6)));

        const vectorLayer = new VectorLayer({
            source: vectorSource,
            style: styleFunction
        });

        const map = new Map({
            layers: [
                new TileLayer({
                    source: new OSM()
                }),
                vectorLayer
            ],
            target: document.getElementById(mapId),
            view: new View({
                center: [0, 0],
                zoom: 5
            })
        });

        map.getView().fit(boundingBox, map.getSize())

        const popover = document.getElementById('popover')
        const popup = new Overlay({
            element: popover,
            autoPan: true,
            offset: [0, 10]
        })
        map.addOverlay(popup)

        map.on("click", function (e) {
            map.forEachFeatureAtPixel(e.pixel, function (feature, layer) {
                const geometry = feature.getGeometry();
                const coord = geometry.getCoordinates();

                popup.setPositioning('top-center')
                popup.setPosition(coord)

                setSelectedFeatureProps(feature.values_)
            })
        }); 

        setClosePopOverFunction(() => () => {
            popup.setPosition(undefined)
        })

    }, [])

    const currentPropertiesTableData = Object.keys(selectedFeatureProps).filter((prop) => {
        return prop != "geometry"
    }).map((prop, ind) => ({
        "property": prop,
        "value": selectedFeatureProps[prop].valueOf(),
        "key": ind
    }))

    return (
        <React.Fragment>
            <Card id = "popover" title = "Feature Properties" extra = {<Button onClick = {closePopoverFunction} id = "close-popover" danger icon = {<CloseOutlined></CloseOutlined>}></Button>}>
                    <Table columns={[
                        { title: "Property", dataIndex: "property", key: "property" },
                        { title: "Value", dataIndex: "value", key: "value" }
                    ]} dataSource={currentPropertiesTableData}>

                    </Table>
            </Card>
            <div id={mapId} className="map" style={{
                width: "100%", height: "600px"
            }}></div>
        </React.Fragment>
    )
}

export default GeoJSONViewer