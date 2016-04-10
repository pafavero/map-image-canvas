MAP.imageCanvasForExternLabel = {
  mapContainer: null,
  vectorSource: null,
  labelStyle: null,
  features: null,
  countLeftLabels: 0,
  countRightLabels: 0,
  //only feature belongs to special type are labelled
  type: null,
  init: function (map, labelStyle, type) {
    var _this = this;
    this.mapContainer = map;
    this.labelStyle = labelStyle;
    this.type = type;
    this.$container = $('#map-2-container');
    this.imageCanvasSource = new ol.source.ImageCanvas({
      canvasFunction: function (extent, resolution, pixelRatio,
          size, projection) {
        return _this.canvasFunction(extent, resolution, pixelRatio,
            size, projection);
      },
      projection: 'EPSG:3857'
    });
    this.imageLayer = new ol.layer.Image({
      source: this.imageCanvasSource
    });
    this.mapContainer.addLayer(this.imageLayer);
    this.mapContainer.getView().on('change:center', function (evt) {
      _this.$container.find('.div-label-2').remove();
      _this.countLeftLabels = 0;
      _this.countRightLabels = 0;
      _this.imageLayer.setVisible(false);
    });
    this.mapContainer.on('moveend', function (evt) {
      _this.imageLayer.setVisible(true);
      _this.imageCanvasSource.changed();
    });
  },
  addFeatures: function (features) {
    this.features = features.sort(function (a, b) {
      var aLat = a.getGeometry().getCoordinates()[1];
      var bLat = b.getGeometry().getCoordinates()[1];
      return bLat - aLat;
    }, function (d) {
      return d;
    });
    _this.imageCanvasSource.changed();
  },
  canvasFunction: function (extent, resolution, pixelRatio,
      size, projection) {

    var canvasWidth = size[0];
    var canvasHeight = size[1];
    var canvas = document.createElement('canvas');
    var context = canvas.getContext('2d');
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    if (this.features) {
      this.$container.find('.div-label-2').remove();
      this.countLeftLabels = 0;
      this.countRightLabels = 0;
      var _rotation = this.mapContainer.getView().getRotation();

      for (var _index = 0; _index < this.features.length; _index++) {
        MAP.imageCanvasForExternLabel.createCanvasForLabel(this.features[_index],
            canvasHeight, context, extent, resolution, _rotation);
      }
    }
    return canvas;
  },
  createCanvasForLabel: function (feature, canvasHeight, context, extent,
      resolution, rotation) {
    if (feature.get('type') === this.type) {
      var geometry = feature.getGeometry();
      var coords = geometry.getCoordinates();
      var lon = coords[0];
      var lat = coords[1];

      var x = (lon - extent[0]) / resolution;
      var y = (lat - extent[1]) / resolution;

      var extentViewPort = this.mapContainer.getView().calculateExtent(this.mapContainer.getSize());

      var xMin = (extentViewPort[0] - extent[0]) / resolution;
      var xMax = (extentViewPort[2] - extent[0]) / resolution;
      var yMin = (extentViewPort[1] - extent[1]) / resolution;
      var yMax = (extentViewPort[3] - extent[1]) / resolution;
      var xM = (((extentViewPort[2] + extentViewPort[0]) / 2) - extent[0]) / resolution;

      if (x <= xMax && x >= xMin && y <= yMax && y >= yMin) {
        this.drawText(context, x, y,
            canvasHeight, xMin, yMin, xMax, yMax, xM, feature);
      }
    }
  },
  drawText: function (ctx, x, y, canvasHeight, xMin, YMin, xMax, yMax, xM, feature) {
    ctx.save();
    ctx.font = this.labelStyle.font;

    ctx.lineWidth = this.labelStyle.baselineWidth;
    ctx.strokeStyle = this.labelStyle.baseStrokeStyle;
    ctx.fillStyle = this.labelStyle.baseStrokeStyle;
    ctx.beginPath();
    ctx.moveTo(x, canvasHeight - y);

    if (x <= xM) {
      var yL = ++this.countLeftLabels * 35;
      ctx.lineTo(xMin + 50, YMin + yL);
      ctx.lineTo(xMin, YMin + yL);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(xMin, YMin + yL, 3, 0, Math.PI*2, true); 
      ctx.closePath();
      ctx.fill();
      var _label = $('<div class="div-label-2">' + feature.get('title') + '</li>');
      this.$container.append(_label);
      _label.css('right', 660);
      _label.css('top', yL - 15);
    } else {
      var yL = ++this.countRightLabels * 35;
      ctx.lineTo(xMax - 50, YMin + yL);
      ctx.lineTo(xMax, YMin + yL);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(xMax, YMin + yL, 3, 0, Math.PI*2, true); 
      ctx.closePath();
      ctx.fill();
      var _label = $('<div class="div-label-2">' + feature.get('title') + '</li>');
      this.$container.append(_label);
      _label.css('left', 660);
      _label.css('top', yL - 15);
    }
  }
};
