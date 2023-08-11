mapboxgl.accessToken = MAPBOX_TOKEN;

const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/streets-v12',
  center: campground.geometry.coordinates,
  zoom: 9,
});

const marker = new mapboxgl.Marker({
  color: '#FF0000',
  // draggable: true,
})
  .setLngLat(campground.geometry.coordinates)
  .setPopup(
    new mapboxgl.Popup({ offset: 10 }).setHTML(
      `<h3>${campground.title}</h3><p>${campground.location}</p>`
    )
  )
  .addTo(map);

map.addControl(new mapboxgl.NavigationControl());
