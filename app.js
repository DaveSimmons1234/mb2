// Read GeoJSON file
let app_v = {
  geo_path: "https://casestudies.naturebasedsolutionsinitiative.org/wp-content/json/cs_geojson.json",
  //geo_path: "http://localhost/nbs_casestudies/wp-content/json/cs_geojson.json",
  geo_data: [],
  result_ids: [],
  paged_click: 0,
  map_view_props: {
    zoom_level: 1,
    center: [10.2179687498357, 20.66995747013945]
  },
  filtered_geo: {
    type: "FeatureCollection",
    features: []
  }
};

let app_f = {
  generate_study_map:  function(geojson_data, result_ids){
    // If there are no post ids coming in then render with complete geojson data else filter it.
    if(result_ids.length === 0){
      app_v.filtered_geo.features = geojson_data.features;
    }
    else {
      // Filter the JSON by the income IDs
      let filtered_features = geojson_data.features.filter(function (geo_point, index){
          return result_ids.indexOf(geo_point.properties.postid) != -1;
      });
      // Createing the filted GeoJSON, due to muttable aray
      app_v.filtered_geo.features = filtered_features;
    }


    // Map tokens
    // davesimmons1978
     mapboxgl.accessToken = 'pk.eyJ1IjoiZGF2ZXNpbW1vbnMxOTc4IiwiYSI6ImNrc3hqaDZhZDFnamozMWxzMWx4Y3c5NnAifQ.6i70V1LWVXBVKHg9WPG74Q';

    // mapboxes
    // mapboxgl.accessToken = 'pk.eyJ1IjoiZXhhbXBsZXMiLCJhIjoiY2p0MG01MXRqMW45cjQzb2R6b2ptc3J4MSJ9.zA2W0IkI0c6KaAhJfk9bWg';

    // strava
    // mapboxgl.accessToken = "pk.eyJ1Ijoic3RyYXZhIiwiYSI6IlpoeXU2U0UifQ.c7yhlZevNRFCqHYm6G6Cyg";

    // dm Store
    //mapboxgl.accessToken = "pk.eyJ1IjoibWFwYm94LWQwMjc3MTc4IiwiYSI6ImNqeXI2NXJ3ZDA3YmYzYnFkMG52Z3YyNnoifQ.ZmMgxmobkkjeQM7T_ixWqg"



      // console.log(geojson_data);
    var map = new mapboxgl.Map({
      container: 'map_study_locations',
      style: 'mapbox://styles/davesimmons1978/cksxjkkms848l17tc7i6t2ujo',
      center: app_v.map_view_props.center,
      zoom: app_v.map_view_props.zoom_level,
      maxZoom: 6,
      minZoom: 1
    });
    // disable map zoom when using scroll
    map.scrollZoom.disable();
    map.on('load', function () {
      var mapContainerEl = document.getElementById("map_study_locations");
      mapContainerEl.style.visibility = "visible";
      $('.render_msg').hide();
      // Add a new source from our GeoJSON data and
      // set the 'cluster' option to true. GL-JS will
      // add the point_count property to your source data.
      map.addSource('publications', {
      type: 'geojson',
      data: app_v.filtered_geo,
      cluster: true,
      clusterMaxZoom: 9, // Max zoom to cluster points on
      clusterRadius: 50 // Radius of each cluster when clustering points (defaults to 50)
      });

    map.addLayer({
      id: 'clusters',
      type: 'circle',
      source: 'publications',
      filter: ['has', 'point_count'],
      paint: {
        // Use step expressions (https://docs.mapbox.com/mapbox-gl-js/style-spec/#expressions-step)
        // with three steps to implement three types of circles:
        //   * Blue, 20px circles when point count is less than 100
        //   * Yellow, 30px circles when point count is between 100 and 750
        //   * Pink, 40px circles when point count is greater than or equal to 750
        'circle-color': ['step', ['get', 'point_count'],'#7a876f', 100,'#f1f075',750,'#f28cb1'],
        'circle-radius': ['step',['get', 'point_count'],20,100,30,750,40],
        'circle-opacity': 1,
        'circle-stroke-color': 'rgba(68,81,57,0.8)',
        'circle-stroke-width': 6
      }
    });

    map.addLayer({
      id: 'cluster-count',
      type: 'symbol',
      source: 'publications',
      filter: ['has', 'point_count'],
      layout: {
      'text-field': '{point_count_abbreviated}',
      'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
      'text-size': 12,
    },
    paint: {
      "text-color": "#fff"

    }
    });
    map.addLayer({
      id: 'unclustered-point',
      type: 'symbol',
      source: 'publications',
      filter: ['!', ['has', 'point_count']],
      layout: {
            "icon-image": "leaf_marker_green",
            "text-field": "{point_count_abbreviated}",
            "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
            "icon-size": 0.3,
            "icon-offset": [-12,-25],
            "text-size": 24,
            "text-anchor": "top",
            "text-line-height": 2.2
        },
        paint: {
          "text-color": "#8fc8f6"
    }
    });

    // Detect filter changes to update the GeoJSON
    $('#cs_quick_search').on('change', '.sf-input-select', function(e){
      if(app_v.result_ids.length === 0){
        app_v.filtered_geo.features = geojson_data.features;
      }
      else {
        // Filter the JSON by the income IDs
        let filtered_features = geojson_data.features.filter(function (geo_point, index){
            return app_v.result_ids.indexOf(geo_point.properties.postid) != -1;
        });
        // Createing the filted GeoJSON, due to muttable aray
        app_v.filtered_geo.features = filtered_features;
         map.getSource('publications').setData(app_v.filtered_geo);
      }
    });

    $(document).on("sf:ajaxfinish", ".searchandfilter", function(){
      console.log(app_v.result_ids);
      if(app_v.result_ids.length === 0){
        app_v.filtered_geo.features = geojson_data.features;
      }
      else {
        // Filter the JSON by the income IDs
        let filtered_features = geojson_data.features.filter(function (geo_point, index){
            return app_v.result_ids.indexOf(geo_point.properties.postid) != -1;
        });
        // Createing the filted GeoJSON, due to muttable aray
        app_v.filtered_geo.features = filtered_features;
         map.getSource('publications').setData(app_v.filtered_geo);
      }
    });


    // inspect a cluster on click
    // Store the zoomlevel and the co-orinates.
    map.on('mouseup',function(e) {
      app_v.map_view_props.center = map.getCenter();

    });
    map.on('zoom',function(e) {
      app_v.map_view_props.zoom_level = map.getZoom();

    });

    map.on('click', 'clusters', function (e) {
      var features = map.queryRenderedFeatures(e.point, {
      layers: ['clusters']
      });

      var point_count = features[0].properties.point_count;
      var clusterId = features[0].properties.cluster_id;
      clusterSource = map.getSource('publications');

      var pathway_ids = [];

      var zoomlevel = map.getZoom();
      if(zoomlevel == 4) {

        clusterSource.getClusterLeaves(clusterId, point_count, 0, function(err, aFeatures){

          // Need to get pathway ids for search results.
          function get_docs(data){
            aFeatures.forEach((item, i) => {
              let obj = data.find(function (o) {
                return o[0] === "" + item.properties.docID + "";
              });
              pathway_ids.push(obj[1]);
            });

            // Setting these values makes sure the right type of results come-back i.e. not GeoJSON.
            app_v.location_view_props.render_map = 0;
            app_v.location_view_props.study_country = "no_country";
            // Get the results
            app_f.get_dataset_results(pathway_ids, 1, 1, app_v.heatmap_props, app_v.location_view_props, app_v.text_search);
            // Show the correct bit of interface
            $('.searchResult').show("slide", "swing", { direction: "left" }, 1000);
            $('.doc_view').show("slow", function(e){
              $('.doc_view_in').fadeIn("200");
            });

          }
          if(app_v.top_filtered_data.length > 0) {
            get_docs(app_v.top_filtered_data);
          }
          else {
            get_docs(app_v.parsed_dataset);
          }
        });
      }
      else {
        map.getSource('publications').getClusterExpansionZoom(
          clusterId,
          function (err, zoom) {

          if (err) return;
          map.easeTo({
            center: features[0].geometry.coordinates,
            zoom: zoom
            });
            }
        );
      }
    });
    // When a click event occurs on a feature
    map.on('click', 'unclustered-point', function (e) {
      // lets go get the data!
      let pathway_ids= [];
      if(app_v.top_filtered_data.length > 0) {
        let obj = app_v.top_filtered_data.find(function (o) {
          return o[0] === "" + e.features[0].properties.docID + "";
        });
        pathway_ids.push(obj[1]);
      }
      else {
        let obj = app_v.parsed_dataset.find(function (o) {
          return o[0] === "" + e.features[0].properties.docID + "";
        });
        pathway_ids.push(obj[1]);
      }
      // Setting these values makes sure the right type of results come-back i.e. not GeoJSON.
      app_v.location_view_props.render_map = 0;
      app_v.location_view_props.study_country = "no_country";
      // Get the results
      app_f.get_dataset_results(pathway_ids, 1, 1, app_v.heatmap_props, app_v.location_view_props, app_v.text_search);
      // Show the correct bit of interface
      $('.searchResult').show("slide", "swing", { direction: "left" }, 1000);
      $('.doc_view').show("slow", function(e){
        $('.doc_view_in').fadeIn("200");
      });

      var coordinates = e.features[0].geometry.coordinates.slice();

      // Ensure that if the map is zoomed out such that
      // multiple copies of the feature are visible, the
      // popup appears over the copy being pointed to.
      while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
        coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
      }
    });
    map.on('mouseenter', 'unclustered-point', function () {
        map.getCanvas().style.cursor = 'pointer';
    });
    map.on('mouseleave', 'unclustered-point', function () {
      map.getCanvas().style.cursor = '';
    });

    map.on('mouseenter', 'clusters', function () {
        map.getCanvas().style.cursor = 'pointer';
    });
    map.on('mouseleave', 'clusters', function () {
      map.getCanvas().style.cursor = '';
    });
    });
    map.addControl(new mapboxgl.NavigationControl(), 'bottom-right');

    // Remove map to free up memory.
    $(".page-link").on('click',function(){
      if (map == null){}
      else {
        map.remove();
        map = null;
      }
    });
  }
};
$(document).ready(function() {

  // Sets whether a pagination link has been clicked and sets value.
  // Do this so map doesn't render on pagination.
  $("#cs_case_list").on('click','a.page-numbers',function(){
    app_v.paged_click = 1;
  });

  $.getJSON( app_v.geo_path, function( data ) {
    // results to empty on initial loading.
    app_v.result_ids = [];
    app_v.geo_data = data;

    app_f.generate_study_map(data, app_v.result_ids);
  });





  $("#cs_case_list").on("click",".cs_permallink", function(e) {
      e.preventDefault();
      console.log('clicked');
      var postid = $(this).attr('id');
      $.ajax({
          type: "POST",
          url: my_ajax_object.ajax_url,
          dataType: "html",
          data: {
              action: 'load_case_ajax',
              postid: postid,
          },
          beforeSend: function() {
              $(".loaderDiv").show();
          },
          success: function (result) {
          }, error: function () {

          }
      }).done(function (data) {
          console.log('doned')
          // $(".loaderDiv").hide();
          $('#single_case').html(data);
      });
  });

});




//************************* MAP BOX   ********************************///
