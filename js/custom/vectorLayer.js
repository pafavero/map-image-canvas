'use strict';
MAP.VectorLayer = (function () {
  // CONSTRUCTOR ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  function VectorLayer(map, poiStyle) {
    this.canvasArray = [];
    this.poiStyle = poiStyle;
    var _this = this;

    this.styleFunction = function (feature, resolution) {
      if (feature.get('type') !== 'custom-label')
        return [new ol.style.Style({
            image: new ol.style.Icon({
              anchor: [0.5, 1],
              src: 'img/' + feature.get('type') + '.png',
              scale: 0.8
            })
          })];

      return [new ol.style.Style({
          image: new ol.style.Circle({
            radius: _this.poiStyle.radius,
            fill: _this.poiStyle.fillStyle,
            stroke: new ol.style.Fill({color: _this.poiStyle.strokeStyle})
          })
        })];
    };

    this.vectorSource = new ol.source.Vector({
      projection: 'EPSG:3857'
    });
    _this.layer = new ol.layer.Vector({
      source: this.vectorSource,
      style: this.styleFunction
    });
    map.addLayer(_this.layer);
  }

  VectorLayer.prototype.getVectorSource = function () {
    return this.vectorSource;
  };

  return VectorLayer;
})();


