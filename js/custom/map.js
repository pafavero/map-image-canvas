'use strict';
/**
 * Initialization of the map (based on BingMaps) with its controls and layers
 */
MAP.Map = (function () {
  // CONSTRUCTOR ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  /**
   * @param {string} id - dom id
   */
  function Map(id) {
    this.labelStyle = {
      padding: 2,
      font: '24px Teko',
      fillStyle: '#fff',
      lineWidth: 1,
      strokeStyle: '#000',
      baselineWidth: 1,
      baseStrokeStyle: 'rgba(255,255,255,0.8)'
    };
    this.tooltip = null;
    this.poiStyle = {
      radius: 6,
      fillStyle: null,
      strokeStyle: '#ffffff'
    };

    this.id = id;
    this.map = new ol.Map({
      layers: [
        new ol.layer.Tile({
          source: new ol.source.BingMaps({
            key: 'As6ZfOj9-5kwo2ry59WYku6nGTuKC0eVUxcGomkmb3c27TCAe-TYF4lOLbyba4Lm',
            imagerySet: 'Aerial'
          })
        })
      ],
      controls: [],
      target: id,
      view: new ol.View({
        center: ol.proj.fromLonLat([11.5450, 45.5490]),
        zoom: 15
      })});

    if (id === 'map-1')
      this.tooltip = $('#tooltip');
    this.vectorLayer = new MAP.VectorLayer(this.map, this.poiStyle);
    if (id === 'map-1')
      MAP.imageCanvas.init(this.map, this.labelStyle, 'custom-label', this.vectorLayer.getVectorSource());
    else
      MAP.imageCanvasForExternLabel.init(this.map, this.labelStyle, 'custom-label', this.vectorLayer.getVectorSource());
    addEvents.call(this);
    addJsonData.call(this);
  }

  // METHODS ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  var addEvents = function () {
    this.map.addControl(new ol.control.Attribution());
    var _this = this;
    $(this.map.getViewport()).on('mousemove', function (evt) {
      var _pixel = _this.map.getEventPixel(evt.originalEvent);
      var _f = _this.map.forEachFeatureAtPixel(_pixel, function (feature, layer) {
        return feature;
      });
      if (_f && _f.get('type') !== 'custom-label') {
        var _txt = _f.get('title');
        if (_txt && _this.tooltip) {
          _this.tooltip.html(_txt);
          _this.tooltip.css("left", _pixel[0] + 'px');
          _this.tooltip.css("top", (_pixel[1] + 30) + 'px');
          _this.tooltip.show();
        }
      } else {
        if (_this.tooltip)
          _this.tooltip.hide();
      }
    });
  };
  var addJsonData = function () {
    var _this = this;
    $.ajax('data/pois.json').done(function (data) {
      var _converter = new ol.format.GeoJSON();
      var _feature = _converter.readFeatures(data, {
        dataProjection: 'EPSG:4326',
        featureProjection: 'EPSG:3857'
      });
      _this.vectorLayer.getVectorSource().addFeatures(_feature);

      if (_this.id === 'map-1')
        MAP.imageCanvas.addFeatures(_feature);
      else
        MAP.imageCanvasForExternLabel.addFeatures(_feature);
    });
  };

  return Map;
})();
