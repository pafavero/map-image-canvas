MAP.imageCanvas = {
  mapContainer: null,
  labelStyle: null,
  //only feature belongs to special type are labelled
  type: null,
  deltaX : 35,
  deltaY :50, /* * Math.pow(canvasHeight/y,2)*/
  init: function (map, labelStyle, type, vectorSource) {
    var _this = this;
    this.mapContainer = map;
    this.labelStyle = labelStyle;
    this.type = type;
    this.vectorSource = vectorSource;
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
    /**
     * The generation of the labels should be again generated after span and zoom changes
     */
    this.mapContainer.on('moveend', function (evt) {
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
    this.imageCanvasSource.changed();
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
      var _features = this.vectorSource.getFeatures();
      for (var _index = 0; _index < _features.length; _index++) {
        MAP.imageCanvas.createCanvasForLabel(_features[_index],
            canvasHeight, context, extent, resolution);
      }
    }
    return canvas;
  },
  
  /**
   * Create overlay canvas which contains all labels
   * @param {type} feature
   * @param {type} canvasHeight
   * @param {type} context
   * @param {type} extent
   * @param {type} resolution
   * @returns {undefined}
   */
  createCanvasForLabel: function (feature, canvasHeight, context, extent,
      resolution) {
    if (feature.get('type') === this.type) {
      var geometry = feature.getGeometry();
      var coords = geometry.getCoordinates();
      var lon = coords[0];
      var lat = coords[1];

      var x = (lon - extent[0]) / resolution;
      var y = (lat - extent[1]) / resolution;
      this.drawText(context, feature.get('title'), x, y,
          canvasHeight, !!feature.get('isReverse'));
    }
  },
  drawText: function (ctx, txt, x, y, canvasHeight, isReverse) {
    ctx.save();
    ctx.font = this.labelStyle.font;

    var width = ctx.measureText(txt).width + (this.labelStyle.padding * 2);
    this.drawBaseForLabel(ctx, x, y, canvasHeight, width, isReverse);
    x = x + ((isReverse ? -1 : 1) * this.deltaX);
    y = canvasHeight - y - this.deltaY;

    ctx.textBaseline = 'top';
    ctx.fillStyle = this.labelStyle.fillStyle;
    ctx.lineWidth = this.labelStyle.lineWidth;
    ctx.strokeStyle = this.labelStyle.strokeStyle;
    ctx.strokeText(txt, x + this.labelStyle.padding - (isReverse ? width : 0), y - parseInt(this.labelStyle.font, 10) - 5);
    ctx.fillText(txt, x + this.labelStyle.padding - (isReverse ? width : 0), y - parseInt(this.labelStyle.font, 10) - 5);
    ctx.restore();
  },
  drawBaseForLabel: function (context, x, y, canvasHeight, width, isReverse) {
    context.lineWidth = this.labelStyle.baselineWidth;
    context.strokeStyle = this.labelStyle.baseStrokeStyle;
    context.fillStyle = this.labelStyle.baseStrokeStyle;
    context.beginPath();
    context.moveTo(x, canvasHeight - y);
    context.lineTo(this.deltaX * (isReverse ? -1 : 1) + x, canvasHeight - y - this.deltaY);
    context.closePath();
    context.stroke();

    context.beginPath();
    var deltaX = this.deltaX;
    context.moveTo(deltaX * (isReverse ? -1 : 1) + x, canvasHeight - y - this.deltaY);
    context.lineTo(deltaX * (isReverse ? -1 : 1) + x + ((isReverse ? -1 : 1) * width), canvasHeight - y - this.deltaY);
    context.closePath();
    context.stroke();
  }
};
