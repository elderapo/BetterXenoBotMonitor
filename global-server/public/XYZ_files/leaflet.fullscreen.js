!function(){L.Control.FullScreen=L.Control.extend({options:{position:"topleft",title:"Full Screen",forceSeparateButton:!1,forcePseudoFullscreen:!1},onAdd:function(e){var n,t="leaflet-control-zoom-fullscreen";return n=e.zoomControl&&!this.options.forceSeparateButton?e.zoomControl._container:L.DomUtil.create("div","leaflet-bar"),this._createButton(this.options.title,t,n,this.toggleFullScreen,this),n},_createButton:function(n,t,l,r,o){var u=L.DomUtil.create("a",t,l);return u.href="#",u.title=n,L.DomEvent.addListener(u,"click",L.DomEvent.stopPropagation).addListener(u,"click",L.DomEvent.preventDefault).addListener(u,"click",r,o),L.DomEvent.addListener(l,e.fullScreenEventName,L.DomEvent.stopPropagation).addListener(l,e.fullScreenEventName,L.DomEvent.preventDefault).addListener(l,e.fullScreenEventName,this._handleEscKey,o),L.DomEvent.addListener(document,e.fullScreenEventName,L.DomEvent.stopPropagation).addListener(document,e.fullScreenEventName,L.DomEvent.preventDefault).addListener(document,e.fullScreenEventName,this._handleEscKey,o),u},toggleFullScreen:function(){var n=this._map;n._exitFired=!1,n._isFullscreen?(e.supportsFullScreen&&!this.options.forcePseudoFullscreen?e.cancelFullScreen(n._container):L.DomUtil.removeClass(n._container,"leaflet-pseudo-fullscreen"),n.invalidateSize(),n.fire("exitFullscreen"),n._exitFired=!0,n._isFullscreen=!1):(e.supportsFullScreen&&!this.options.forcePseudoFullscreen?e.requestFullScreen(n._container):L.DomUtil.addClass(n._container,"leaflet-pseudo-fullscreen"),n.invalidateSize(),n.fire("enterFullscreen"),n._isFullscreen=!0)},_handleEscKey:function(){var n=this._map;e.isFullScreen(n)||n._exitFired||(n.fire("exitFullscreen"),n._exitFired=!0,n._isFullscreen=!1)}}),L.Map.addInitHook(function(){this.options.fullscreenControl&&(this.fullscreenControl=L.control.fullscreen(this.options.fullscreenControlOptions),this.addControl(this.fullscreenControl))}),L.control.fullscreen=function(e){return new L.Control.FullScreen(e)};var e={supportsFullScreen:!1,isFullScreen:function(){return!1},requestFullScreen:function(){},cancelFullScreen:function(){},fullScreenEventName:"",prefix:""},n="webkit moz o ms khtml".split(" ");if("undefined"!=typeof document.exitFullscreen)e.supportsFullScreen=!0;else for(var t=0,l=n.length;l>t;t++)if(e.prefix=n[t],"undefined"!=typeof document[e.prefix+"CancelFullScreen"]){e.supportsFullScreen=!0;break}e.supportsFullScreen&&(e.fullScreenEventName=e.prefix+"fullscreenchange",e.isFullScreen=function(){switch(this.prefix){case"":return document.fullScreen;case"webkit":return document.webkitIsFullScreen;default:return document[this.prefix+"FullScreen"]}},e.requestFullScreen=function(e){return""===this.prefix?e.requestFullscreen():e[this.prefix+"RequestFullScreen"]()},e.cancelFullScreen=function(){return""===this.prefix?document.exitFullscreen():document[this.prefix+"CancelFullScreen"]()}),"undefined"!=typeof jQuery&&(jQuery.fn.requestFullScreen=function(){return this.each(function(){var n=jQuery(this);e.supportsFullScreen&&e.requestFullScreen(n)})}),window.fullScreenApi=e}();