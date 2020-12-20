var map = L.map('map', {
    center: [38.00, 136.00],
    zoom: 5,
    minZoom: 3,
    maxZoom: 7,
    zoominfoControl: true,
    zoomControl: false
})

// ペイン定義 ペインのz-order定義
var pane_velocity = map.createPane('pane_velocity');  pane_velocity.style.zIndex = 500;
var pane_border   = map.createPane('pane_border');    pane_border.style.zIndex   = 450;
var pane_radar    = map.createPane('pane_radar');     pane_radar.style.zIndex    = 448;
var pane_lowest   = map.createPane('pane_lowest');    pane_lowest.style.zIndex   = 200;


/***************************
 * basemap
 ***************************/
var border = L.tileLayer('./tile/border/{z}/{x}/{y}.png', {
    pane: pane_border
}).addTo(map);

var own = L.tileLayer('./tile/own/{z}/{x}/{y}.png', {
    opacity: 0.6,
});

var hyp = L.tileLayer('./tile/hyp/{z}/{x}/{y}.png', {
    attribution: "<a href='https://www.naturalearthdata.com/' target='_blank'>Natural Earth</a>",
});

var chiri = L.tileLayer('https://cyberjapandata.gsi.go.jp/xyz/std/{z}/{x}/{y}.png', {
    attribution: "<a href='https://maps.gsi.go.jp/development/ichiran.html' target='_blank'>国土地理院</a>",
});

L.latlngGraticule({
    showLabel: true,
    color: '#f0f0f0',
    weight: 0.5,
    zoomInterval: [
        {start: 2, end: 3, interval: 30},
        {start: 4, end: 4, interval: 10},
        {start: 5, end: 7, interval: 5},
        {start: 8, end: 10, interval: 1}
    ]
}).addTo(map);

        
/***************************
 * overlay
***************************/
// 粒子
var velocity = L.layerGroup({pane: 'pane_velocity'});
$.getJSON('./json/wind.json', function (data) {
        var velocity_layer = L.velocityLayer({
		displayValues: true,
		displayOptions: {
			velocityType: 'Global Wind',
			displayPosition: 'bottomleft',
			displayEmptyString: 'No wind data'
		},
		data: data,
		maxVelocity: 30
	});
    velocity_layer.addTo(velocity)
});

// 等圧線
var prmsl = L.layerGroup();
$.getJSON("./geojson/prmsl.geojson", function(data) {
    var prmsl_layer = L.geoJson(data, {
        style: function(feature) {
            return {
              stroke: true,
              weight: 1,
              smoothFactor: 0.1,
              name: 'prmsl',
            };
        }
    });
    prmsl_layer.addTo(prmsl)
})

// 気温(png)
var temp = L.layerGroup();
var lat1 = 22.4;  var lon1 = 120.0;
var lat2 = 47.6;  var lon2 = 150.0;
var bounds = L.latLngBounds([lat1, lon1],[lat2, lon2]);
L.imageOverlay('./img/temp.png', bounds, {
    opacity: 0.8,
    pane: pane_lowest
}).addTo(temp);

// 気温(凡例)
var legend_temp = L.control.htmllegend({
    position: 'bottomleft',
    legends: [{
        layer: temp,
        elements: [{ html: '<div class="legend"><span>気温</span><img class="legend_img" src=./img/legend_temp.png></img></div>' }]
    }],
        disableVisibilityControls: true,
    })
    map.addControl(legend_temp)

// レーダー(png)
var radar = L.layerGroup();
var lat1 = 20.0;  var lon1 = 120.0;
var lat2 = 48.0;  var lon2 = 150.0;
var bounds = L.latLngBounds([lat1, lon1],[lat2, lon2]);
L.imageOverlay('./img/radar.png', bounds, {
    opacity: 0.8,
    pane: pane_radar
}).addTo(radar);

// レーダー(凡例)
var legend_radar = L.control.htmllegend({
    position: 'bottomleft',
    legends: [{
        layer: radar,
        elements: [{ html: '<div class="legend"><span>気象レーダー</span><img class="legend_img" src=./img/legend_radar.png></img></div>' }]
    }],
        disableVisibilityControls: true,
    })
    map.addControl(legend_radar)

// 衛星(png)
var eisei = L.layerGroup();
var lat1 = 20.0;  var lon1 = 120.0;
var lat2 = 48.0;  var lon2 = 150.0;
var bounds = L.latLngBounds([lat1, lon1],[lat2, lon2]);
L.imageOverlay('./img/eisei.png', bounds, {
    opacity: 1.0,
    pane: pane_lowest
}).addTo(eisei);

// METAR
var metar = L.layerGroup();
L.marker([42.40, 141.40])
    .bindPopup("<b>!!!DUMMY data!!!</b><br>XX/XXXXZ 27004KT 9999 VCSH FEW020 SCT040 BKN060 M07/M10 Q1010").openPopup()
    .addTo(metar);
L.marker([35.33, 139.46])
    .bindPopup("<b>!!!DUMMY data!!!</b><br>XX/XXXXZ 36015KT 9999 FEW030 BKN/// 08/M02 Q1016").openPopup()
    .addTo(metar);
L.marker([33.35, 130.27])
    .bindPopup("<b>!!!DUMMY data!!!</b><br>XX/XXXXZ 30011KT 9999 FEW030 SCT040 BKN/// 07/M02 Q1027").openPopup()
    .addTo(metar);

// METEOGRAM
var meteogram = L.layerGroup();
L.Icon.Default.imagePath = './leaflet/images/';
L.marker([42.40, 141.40], {icon: L.spriteIcon('green')}).on('click', function(){window.open('./img/meteogram_sample.png','_blank')}).addTo(meteogram);
L.marker([35.33, 139.46], {icon: L.spriteIcon('green')}).on('click', function(){window.open('./img/meteogram_sample.png','_blank')}).addTo(meteogram);
L.marker([33.35, 130.27], {icon: L.spriteIcon('green')}).on('click', function(){window.open('./img/meteogram_sample.png','_blank')}).addTo(meteogram);

/***************************
 * control
 ***************************/
var baseTree = {
    label: '地図選択',
    children: [
        { label: '標準図', layer: null },
        { label: 'Natural Earth', layer: hyp },
        { label: '国土地理院', layer: chiri },
    ],
    collapsed: true,
};

var overlayTree = {
    label: '要素選択',
    children: [
        {
            label: '観測',
            children: [
                { label: '気象レーダー', layer: radar },
                { label: '衛星画像', layer: eisei },
                { label: 'METAR', layer: metar },
            ]
        },{
            label: '予報',
            children: [
                { label: '地上 風粒子', layer: velocity },
                { label: '地上 等圧線', layer: prmsl },
                { label: '地上 気温', layer: temp },
                { label: 'METEOGRAM', layer: meteogram },
            ]
        }
    ]
};

var options = {
    collapsed: false
}
L.control.layers.tree(baseTree, overlayTree, options).addTo(map);

// 初期表示画像
map.addLayer(own);
map.addLayer(velocity);
map.addLayer(prmsl);
//map.addLayer(temp);
map.addLayer(radar);
