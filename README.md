![notes@ logo](src/assets/logo.png)

# notes-at-idb Sample App

> A note taking app that retrieves and stores location data for each note. **notes-at-idb** stores 
 all of it's data locally using IndexedDB for local storage. I created a version 
of [notes-at](https://github.com/brocktopia/notes-at) with back-end services and a database, and I 
wanted to use that as a template to create a simpler version using LocalStorage. I decided to go 
with IndexedDB instead and chose Dexie.js for the task. It was remarkably easy to swap 
Dexie.js out for the Axios.js services I was using in the other version. This app is written in VueJS and
is based off of the VueJS [webpack-simple](https://github.com/vuejs-templates/webpack-simple) template. 
For detailed explanation on vue-loader, consult the [docs for vue-loader](http://vuejs.github.io/vue-loader).
>
> I've gone on to make this into a Progressive Web Application that can be installed on a supported device's 
home screen. Given that this version of the app uses IndexedDB, it is remarkably functional working without a 
network connection.

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

# serve with hot reload at localhost:8081
npm run dev
```

## Distribution

Putting the project up on line requires the `index.html`, `serviceworkers.js` and `/dist/` build folder in the same directory. 
The `notes-at-idb.webmanifest` needs to be in the root directory of the web server and point to resource files in the 
application directory. In my demo, linked below, I put the project in a `/notes-at-idb/` directory in my root directory. 
If you choose a different structure you will need to modify the [notes-at-idb.webmanifest](./notes-at-idb.webmanifest) file's 
`icon` and `start_url` properties.

## Resources

* [Geolocation API](https://developer.mozilla.org/en-US/docs/Web/API/Geolocation_API) Documentation on navigator.geolocation from Mozilla.
* [Google Maps API Reference](https://developers.google.com/maps/documentation/javascript/reference/map)
* [Google Places Service API Reference](https://developers.google.com/maps/documentation/javascript/reference/places-service)
* [Progressive web apps](https://developer.mozilla.org/en-US/docs/Web/Apps/Progressive)

## Notes on Progressive Web App update

I chose this version of the notes@ app to implement as a PWA because it was already using IndexedDB for data and it is a
simpler implementation of the app than more recent versions I've gone on to create. The core of creating a PWA is setting 
up service workers and publishing a manifest that will enable users to install your app as link from the device home screen. 
This allows your app to run without some of the browser chrome and give a more consistent user experience. I found the [Mozilla
MDN web docs](https://developer.mozilla.org/en-US/docs/Web/Apps/Progressive) to be the best resource for learning to create
PWAs. Ultimately, it was relatively simple to create a basic PWA with a small script for the service workers and a manifest
for making it into an installable web application.

## Demo
I have a sample of the app online here: [brocktopia.com/notes-at-idb](https://brocktopia.com/notes-at-idb/).

## Author
Brock Henderson [@brocktopia](https://github.com/brocktopia/) ||
[brocktopia.com](https://brocktopia.com)
