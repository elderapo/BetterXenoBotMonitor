(function() {
    function TibiaXYZ() {
        this.map = null;
        this.floor = 7;
        this.mapFloors = [];
        this.mapDataStore = [];
        this.waypoints = [];
    }
    TibiaXYZ.MAP_COLORS = [];
    //green -- grass
    TibiaXYZ.MAP_COLORS[0x0C] = [13, 83, 2];
    TibiaXYZ.MAP_COLORS[0x18] = [5, 111, 0];
    TibiaXYZ.MAP_COLORS[0x8C] = [114, 213, 114];

    //gray 
    TibiaXYZ.MAP_COLORS[0x56] = [66, 66, 66];
    TibiaXYZ.MAP_COLORS[0x81] = [158, 158, 158];

    //brown - caves?
    TibiaXYZ.MAP_COLORS[0x72] = [78, 52, 46];
    TibiaXYZ.MAP_COLORS[0x79] = [121, 85, 72];

    //light blue - ice
    TibiaXYZ.MAP_COLORS[0xB3] = [179, 229, 252];

    //red - walls
    TibiaXYZ.MAP_COLORS[0xBA] = [229, 28, 35];

    //orange - ??
    TibiaXYZ.MAP_COLORS[0xC0] = [191, 54, 12];

    //yellow - sand
    TibiaXYZ.MAP_COLORS[0xCF] = [255, 209, 128];

    //yellow stairs
    TibiaXYZ.MAP_COLORS[0xD2] = [255, 235, 59];



    // unused
    TibiaXYZ.MAP_COLORS[0x1e] = [100, 221, 23];
    TibiaXYZ.MAP_COLORS[0x28] = [86, 119, 252];
    TibiaXYZ.MAP_COLORS[0xD7] = [225, 245, 254];
    TibiaXYZ.EMPTY_MAP_DATA = new Uint8Array(new ArrayBuffer(256 * 256));
    TibiaXYZ._padNumber = function(number, size) {
        var s = "000000000" + number;
        return s.substr(s.length - size);
    };
    TibiaXYZ._getUrlPosition = function(defaultPos, defaultFloor) {
	    function getUrlVars() {
	        var vars = [], hash;
	        var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');

	        for(var i = 0; i < hashes.length; i++) {
	            hash = hashes[i].split('=');
	            hash[1] = unescape(hash[1]);
	            vars.push(hash[0]);
	            vars[hash[0]] = hash[1];
	        }

	        return vars;
	    }
        var position = defaultPos || [0, 0],
            floor = defaultFloor || 7,
            zoom = 3;
        var location = window.location.pathname.slice(1).split(':');
        if (getUrlVars()["x"]) {
            position[0] = parseInt(getUrlVars()["x"]);
            position[1] = parseInt(getUrlVars()["y"]);
            floor = parseInt(getUrlVars()["z"]);
            zoom = parseInt(getUrlVars()["zoom"]);
        }
        return {
            position: position,
            floor: floor,
            zoom: zoom
        };
    }
    TibiaXYZ._modifyLeaflet = function() {
        L.CRS.CustomZoom = L.extend({}, L.CRS.Simple, {
            scale: function(zoom) {
                switch (zoom) {
                    case 0:
                        return 256;
                    case 1:
                        return 512;
                    case 2:
                        return 1792;
                    case 3:
                        return 5120;
                    case 4:
                        return 10240;
                    default:
                        256;
                }
            },
            latLngToPoint: function(latlng, zoom) {
                var projectedPoint = this.projection.project(latlng),
                    scale = this.scale(zoom);
                return this.transformation._transform(projectedPoint, scale);
            },
            pointToLatLng: function(point, zoom) {
                var scale = this.scale(zoom),
                    untransformedPoint = this.transformation.untransform(point, scale);
                return this.projection.unproject(untransformedPoint);
            }
        });
    };
    TibiaXYZ.prototype._saveMapTile = function(name, data) {
        function noop() {}

        function onInitFs(fs) {
            fs.root.getFile(name, {
                create: true
            }, function(fileEntry) {
                fileEntry.createWriter(function(fileWriter) {
                    fileWriter.write(data);
                }, noop);
            }, noop);
        }
        window.webkitRequestFileSystem(window.TEMPORARY, 1024 * 1024, onInitFs, noop);
    };
    TibiaXYZ.prototype._getSavedMapTile = function(name, size, callback) {
        function errorHandler() {
            callback(false);
        }

        function onInitFs(fs) {
            fs.root.getFile(name, {
                create: false
            }, function(fileEntry) {
                callback(fileEntry.toURL());
            }, errorHandler);
        }
        window.webkitRequestFileSystem(window.TEMPORARY, 1024 * 1024, onInitFs, errorHandler);
    };
    TibiaXYZ.prototype._getMapData = function(x, y, z, callback) {
        var mapName = TibiaXYZ._padNumber(x, 3) + TibiaXYZ._padNumber(y, 3) + TibiaXYZ._padNumber(z, 2);
        var dataStore = this.mapDataStore;
        if (dataStore[mapName]) {
            window.requestAnimationFrame(function() {
                callback(dataStore[mapName]);
            });
        } else {
            var xhr = new XMLHttpRequest();
            xhr.open('GET', '/XYZ_files/Automap/' + mapName + '.map', true);
            xhr.responseType = 'arraybuffer';
            xhr.onload = function(e) {
                var mapData;
                if (this.status === 200) {
                    mapData = new Uint8Array(this.response);
                } else {
                    mapData = TibiaXYZ.EMPTY_MAP_DATA;
                }
                dataStore[mapName] = mapData;
                callback(mapData);
            };
            xhr.send();
        }
    };
    TibiaXYZ.prototype._createMapImageData = function(imageData, baseX, baseY, baseZ, callback) {
        this._getMapData(baseX, baseY, baseZ, function(mapData) {
            var index = 0;
            for (var x = 0; x < 256; x++) {
                for (var y = 0; y < 256; y++) {
                    var data = mapData[index];
                    var blankColor = [0, 0, 0];
                    var color = (TibiaXYZ.MAP_COLORS[data] || blankColor);
                    var base = (y * imageData.width + x) * 4;
                    imageData.data[base + 0] = color[0];
                    imageData.data[base + 1] = color[1];
                    imageData.data[base + 2] = color[2];
                    imageData.data[base + 3] = 255;
                    index++;
                }
            }
            callback(imageData);
        });
    };
    TibiaXYZ.prototype._createMapFloorLayer = function(floor) {
        var mapLayer = this.mapFloors[floor] = new L.GridLayer();
        var map = this.map;
        var xeno = this;
        mapLayer._getTileSize = function() {
            return L.CRS.CustomZoom.scale(map.getZoom())
        };
        mapLayer._setZoomTransform = function(level, center, zoom) {
            var scale = this._map.getZoomScale(zoom, level.zoom),
                translate = level.origin.multiplyBy(scale).subtract(this._map._getNewPixelOrigin(center, zoom)).round();
            L.DomUtil.setTransform(level.el, translate, scale);
        };
        mapLayer.createTile = function(coords, done) {
            var name = coords.x + '_' + coords.y + '_' + floor + '.png',
                tile = document.createElement('canvas');
            tile.width = tile.height = 256;
            var ctx = tile.getContext('2d'),
                data = ctx.createImageData(256, 256);
            xeno._createMapImageData(data, coords.x, coords.y, floor, function(image) {
                ctx.putImageData(image, 0, 0);
                ctx.imageSmoothingEnabled = false;
                done(null, tile);
            });
            return tile;
        };
        return mapLayer
    };
    TibiaXYZ.prototype._showHoverTile = function() {
        var map = this.map;
        var xeno = this;
        map.on('mouseout', function(e) {
            xeno.hoverTile.setBounds([
                [0, 0],
                [0, 0]
            ]);
        });
        map.on('mousemove', function(e) {
            var pos = map.project(e.latlng, 0);
            var x = Math.floor(pos.x);
            var y = Math.floor(pos.y);
            var bounds = [map.unproject([x, y], 0), map.unproject([x + 1, y + 1], 0)];
            if (!xeno.hoverTile) {
                xeno.hoverTile = L.rectangle(bounds, {
                    color: "rgb(0, 158, 255)",
                    weight: 1,
                    clickable: false,
                    pointerEvents: 'none'
                }).addTo(map);
            } else {
                xeno.hoverTile.setBounds(bounds);
            }
        });
    };
    
    TibiaXYZ.prototype.setPosition = function(x, y, z) {
		var map = this.map;
		var zoom = map.getZoom()
	    map.setView(map.unproject([x, y], 0), zoom);

		if (this.floor != z) {
			this.mapFloors[this.floor].remove(map)
		    this.floor = z;
		    this.mapFloors[this.floor].addTo(map);
		}
        if (window.history) {
            var url = 'map?x=' + x + '&y=' + y + '&z=' + z + '&zoom=' + zoom;
            window.history.pushState(null, null, url);
        }
    };

    TibiaXYZ.prototype.init = function() {
        var xeno = this;
        TibiaXYZ._modifyLeaflet();
        var map = this.map = L.map('map', {
            fadeAnimation: true,
            minZoom: 0,
            maxZoom: 4,
            maxNativeZoom: 0,
            zoomAnimationThreshold: 4,
            fullscreenControl: true,
            attributionControl: false,
            keyboardPanOffset: 200,
            unloadInvisibleTiles: false,
            updateWhenIdle: true,
            keyboardPanOffset: 500,
            crs: L.CRS.CustomZoom
        });
        var baseMaps = {};
        for (var i = 0; i <= 15; i++) {
            baseMaps['Floor: ' + i] = this._createMapFloorLayer(i);
        }
        L.control.layers(baseMaps, {}).addTo(map);
        var current = TibiaXYZ._getUrlPosition([32368, 32198], 7);
        xeno.floor = current.floor;
        map.setView(map.unproject(current.position, 0), current.zoom);
        this.mapFloors[current.floor].addTo(map);
        // window.addEventListener("popstate", function(e) {
        //     console.log("asdasdas");
        //     var current = TibiaXYZ._getUrlPosition();
        //     if (current.floor !== xeno.floor) {
        //         xeno.floor = current.floor;
        //         this.mapFloors[xeno.floor].addTo(map);
        //     }
        //     if (current.zoom !== map.getZoom()) {
        //         map.setZoom(current.zoom);
        //     }
        //     map.panTo(map.unproject(current.position, 0));
        // });
        // map.on('baselayerchange', function(layer) {
        //     console.log("DASDSAD");
        //     for (var i = 0; i <= 15; i++) {
        //         if (xeno.mapFloors[i]._leaflet_id == layer._leaflet_id) {
        //             xeno.floor = i;
        //             break;
        //         }
        //     };
        // });
        // map.on('click', function(e) {
        //     if (window.history) {
        //         var coords = L.CRS.CustomZoom.latLngToPoint(e.latlng, 0),
        //             zoom = map.getZoom(),
        //             coordX = Math.round(Math.abs(coords.x)),
        //             coordY = Math.round(Math.abs(coords.y)),
        //             url = 'map?x=' + coordX + '&y=' + coordY + '&z=' + xeno.floor + '&zoom=' + zoom;
        //         window.history.pushState(null, null, url);
        //     }
        // });
		//L.crosshairs().addTo(map);
        L.control.coordinates({
            position: 'bottomleft',
            enableUserInput: false,
            decimals: 8,
            decimalSeperator: '.',
            labelFormatterLat: function(lat) {
                return '<b>Y</b>: ' + Math.round(Math.abs(lat * 256)) + ' <b>Z</b>: ' + xeno.floor;
            },
            labelFormatterLng: function(lng) {
                return '<b>X</b>: ' + Math.round(Math.abs(lng * 256));
            }
        }).addTo(map);
        console.log(L);
    };
    window.TibiaXYZ = TibiaXYZ;
})();