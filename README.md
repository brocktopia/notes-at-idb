![notes@ logo](src/assets/logo.png)

# notes-at-idb Sample App

> A note taking app that retrieves and stores location data for each note. I created version 
of [notes-at](https://github.com/brocktopia/notes-at) with back-end services and a database and I 
wanted to use that as a template to create a simpler version using LocalStorage. I decided to go 
with IndexedDB instead and chose Dexie.js for the task. It was remarkably easy to swap 
Dexie.js out for the Axios.js services I was using in the other version. This app is written in VueJS and
is based off of the VueJS [webpack-simple](https://github.com/vuejs-templates/webpack-simple) template. 
For detailed explanation on vue-loader, consult the [docs for vue-loader](http://vuejs.github.io/vue-loader).

## Dependencies

**Client-side**
* [VueJS 2.x](https://github.com/vuejs/vue)
* [Vue-router](https://github.com/vuejs/vue-router)
* [Dexie.js](http://dexie.org/)
* [vue-googlemaps](https://github.com/Akryum/vue-googlemaps)
* [Moment.js](https://momentjs.com/)
* [Google API Key](https://developers.google.com/maps/documentation/javascript/get-api-key) (for Maps JavaScript API &amp; Places API for Web)

## Configuration

You will need to set your Google API Key in [./src/main.js](src/main.js).
```js
Vue.use(VueGoogleMaps, {
  load: {
    key: 'your-google-api-key',
    libraries: 'places'
  }
});
```

## Build Setup

``` bash
# install dependencies
npm install

# build project (drop -dev for production build)
npm run build-dev

# serve with hot reload at localhost:8080
npm run dev
```

## Resources

* [Geolocation API](https://developer.mozilla.org/en-US/docs/Web/API/Geolocation_API) Documentation on navigator.geolocation from Mozilla.
* [Google Maps API Reference](https://developers.google.com/maps/documentation/javascript/reference/map)
* [Google Places Service API Reference](https://developers.google.com/maps/documentation/javascript/reference/places-service)

## Demo
I have a sample of the app up on my website [here](https://brocktopia.com/notes-at/).

## Author
Brock Henderson [@brocktopia](https://github.com/brocktopia/) ||
[brocktopia.com](https://brocktopia.com)
