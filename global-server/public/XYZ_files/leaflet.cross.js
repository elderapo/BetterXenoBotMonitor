L.Crosshairs = L.LayerGroup.extend({
    options: {
        style: {
            opacity: 1,
            fillOpacity: 0,
            weight: 2,
            color: "#333",
            clickable: !1,
            pointerEvents: "none"
        }
    },
    initialize: function(t) {
        L.LayerGroup.prototype.initialize.call(this), L.Util.setOptions(this, t), this.crosshair = {
            rectangle: L.rectangle([
                [0, 0],
                [1, 1]
            ], this.options.style),
            longitude_line_north: L.polyline([], this.options.style),
            longitude_line_south: L.polyline([], this.options.style),
            latitude_line_east: L.polyline([], this.options.style),
            latitude_line_west: L.polyline([], this.options.style)
        };
        for (var s in this.crosshair) this.addLayer(this.crosshair[s])
    },
    onAdd: function(t) {
        this._map = t, this._moveCrosshairs({
            latlng: this._map.getCenter()
        }),
        this._map.on("click", this._moveCrosshairs.bind(this)),
        this._map.on("move", this._moveCrosshairs.bind(this)),
        this._map.on("zoomend", this._moveCrosshairs.bind(this)),
        this._map.on("mouseover", this._show.bind(this)), this.eachLayer(t.addLayer, t)


    },
    onMove: function(x, y, z) {

    },
    onRemove: function() {
        this._map.off("click", this._moveCrosshairs), this._map.off("zoomend", this._moveCrosshairs), this.eachLayer(this.removeLayer, this)
    },
    _show: function() {
        this.eachLayer(function(t) {
            this._map.addLayer(t)
        }, this)
    },
    _hide: function() {
        this.eachLayer(function(t) {
            this._map.removeLayer(t)
        }, this)
    },
    _moveCrosshairs: function(t) {
        var s;
        if (t.latlng) {
            var i = this._map.project(t.latlng, 0),
                e = Math.floor(i.x),
                o = Math.floor(i.y);
            s = L.latLngBounds(this._map.unproject([e, o], 0), this._map.unproject([e + 1, o + 1], 0))
        } else s = this.crosshair.rectangle.getBounds();
        var n = s.getCenter();
        this.crosshair.rectangle.setBounds(s);
        var a = this._map.project(n);
        this.crosshair.longitude_line_north.setLatLngs([this._map.unproject([a.x, a.y]), this._map.unproject([a.x, this._map.getPixelBounds().min.y])]), this.crosshair.longitude_line_south.setLatLngs([this._map.unproject([a.x, a.y]), this._map.unproject([a.x, this._map.getPixelBounds().max.y])]), this.crosshair.latitude_line_east.setLatLngs([this._map.unproject([a.x, a.y]), this._map.unproject([this._map.getPixelBounds().min.x, a.y])]), this.crosshair.latitude_line_west.setLatLngs([this._map.unproject([a.x, a.y]), this._map.unproject([this._map.getPixelBounds().max.x, a.y])])
    }
}), L.crosshairs = function(t) {
    return new L.Crosshairs(t);
};