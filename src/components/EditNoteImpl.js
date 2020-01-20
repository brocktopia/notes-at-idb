import PlacesDialog from './PlacesDialog'
import {GmapMap} from 'vue2-google-maps'
import ModalDialog from './ModalDialog'

let vm;
export default {

  components: {
    PlacesDialog,
    ModalDialog
  },

  props: {
    note:Object,
    mode:String
  },

  data() {
    return {
      google:null,
      activeView: 'edit-name',
      locationDenied: false,
      places:[],
      placeName:'',
      placesService: null,
      showPlacesDialog: false,
      showMoreButton: false,
      pagination: null,
      showMessage: false,
      messageClass: 'notify', // notify | warn
      messageTitle: '',
      messageBody: '',
      showConfirm: false,
      confirmTitle: '',
      confirmBody: '',
      confirmMethod: null,
      mapSearchInput: ''
    }
  },

  computed: {
    location() {
      return { lat: this.note.geocode.lat, lng: this.note.geocode.lng }
    },
    geoLat() {
      if (!this.note) return 0;
      return this.note.geocode.lat || 0;
    },
    geoLon() {
      if (!this.note) return 0;
      return this.note.geocode.lng || 0;
    },
    hasGeocoords() {
      if (!this.note || !this.note.geocode) {
        return false;
      }
      return (this.location.lat !== 0 && this.location.lng !== 0);
    },
    saveEnabled() {
      return ((this.note.name && this.note.note) && this.note.name.length > 0 && this.note.note.length > 0);
    }
  },

  mounted() {
    console.log(`NoteEditor.mounted() mode [${this.mode}] fetch geolocation data and google reference`);
    vm = this;
    // get location if this is a new note
    if (vm.mode === 'new') {
      vm.updateCoordinates(false);
    }
    // get google reference
    vm.$gmapApiPromiseLazy().then((google) => {
      vm.google = google;
    });
    // get places service
    vm.$refs.NoteMap.$mapPromise.then((map) => {
      vm.placesService = new vm.google.maps.places.PlacesService(map);
    });
  },

  methods:{

    updateCoordinates(userAction) {
      //console.log('NoteEditor.updateCoordinates()');
      navigator.geolocation.getCurrentPosition(
        (position) => {
          let latlonObj = {
            lat: Number(position.coords.latitude.toFixed(7)),
            lng: Number(position.coords.longitude.toFixed(7))
          };
          // clear any loaded places
          vm.places = [];
          vm.$emit('latlon', latlonObj);
        },
        (err) => {
          console.warn(`updateCoordinates() ERROR(${err.code}): ${err.message}`);
          console.dir(err);
          if (err.message === 'User denied Geolocation') {
            vm.locationDenied = true;
            if (userAction) {
              this.messageTitle = 'User Denied Geolocation';
              this.messageBody = 'Access to browser geolocation data has been denied. You must allow access to that data to enable this feature. This can be done in your browser settings.';
              this.messageClass = 'warn';
              this.showMessage = true;
            }
          } else if (userAction) {
            this.messageTitle = 'Geolocation Failed';
            this.messageBody = 'Your device was unable to determine your current location.';
            this.messageClass = 'notify';
            this.showMessage = true;
          }
        },
        {
          enableHighAccuracy: true
        }
      );
    },

    saveNote() {
      //console.log('NoteEditor.saveNote()');
      vm.$emit('save');
    },

    closeNote() {
      //console.log('NoteEditor.closeNote()');
      if (vm.mode === 'edit') {
        vm.$emit('cancel');
      } else {
        vm.$emit('close');
      }
    },

    hasPlace(note) {
      return !!(note.place && note.place.name);
    },

    findPlace(placeName) {
      //console.log(`NoteEditor.findPlace()`);
      let options = {
        location:{
          lat:vm.geoLat,
          lng:vm.geoLon
        },
        radius:1000
      };
      if (vm.placeName) {
        options.keyword = vm.placeName;
      }
      // Make sure user is getting location data
      if (options.location.lat === 0 && options.location.lng ===0) {
        vm.messageTitle = 'Location Not Available';
        vm.messageBody = 'Your current location cannot be determined. You must allow this application to know your location in order to use the Places service.';
        vm.showMessage = true;
        return;
      }
      // clear no-results
      vm.noPlaceResults = false;
      // Check to see if places have already been loaded
      if (this.places.length > 0) {
        vm.showPlacesDialog = true;
      } else {
        // Call PlacesService
        vm.placesService.nearbySearch(options, (res, status, pagination) => {
          //console.log(`NoteEditor.findPlace() nearbySearch() status [${status}]`);
          if (status !== 'OK') {
            if (status === 'ZERO_RESULTS') {
              vm.noPlaceResults = true;
            } else {
              vm.showServiceFailure();
              return;
            }
          }
          vm.places ? vm.places = vm.places.concat(res) : vm.places = res;
          vm.showPlacesDialog = true;
          if (pagination.hasNextPage) {
            vm.showMoreButton = true;
            vm.pagination = pagination;
          } else {
            vm.showMoreButton = false;
            vm.pagination = null;
          }
        });
      }
    },

    moreSelected() {
      //console.log('NoteEditor.moreSelected()');
      if (vm.pagination) {
        vm.pagination.nextPage();
      }
    },

    mapMarkerMoved(marker) {
      //console.log('NoteEditor.mapMarkerMoved()');
      let latlonObj = {
        lat:  Number(marker.latLng.lat().toFixed(7)),
        lng: Number(marker.latLng.lng().toFixed(7))
      };
      // clear any loaded places
      vm.places = [];
      vm.$emit('latlon', latlonObj);
    },

    placesClose() {
      //console.log('NoteEditor.placesClose()');
      vm.showPlacesDialog = false;
    },

    placeSelected(place) {
      //console.log(`NoteEdit.placeSelected() ${place.place_id}`);
      let options = {
        placeId: place.place_id,
        fields:['name', 'url']
      };
      vm.placesService.getDetails(options, (placeDetail, status) => {
        //console.log('NoteEdit.placeSelected() place details ['+status+']');
        if (status === 'OK') {
          let placeObj = {
            name: place.name,
            icon: place.icon,
            url: placeDetail.url,
            _id: place.place_id
          };
          let latlonObj = {
            lat: Number(place.geometry.location.lat().toFixed(7)),
            lng: Number(place.geometry.location.lng().toFixed(7))
          };
          vm.$emit('place', placeObj, latlonObj);
          // hide the 2 potential dialogs that call this method
          vm.showPlacesDialog = false;
          vm.showConfirm = false;
        } else {
          console.warn('NoteEdit.placeSelected() Error ['+status+'] getting Place details');
        }
      });
    },

    placeInputUpdated(name) {
      //console.log(`NoteEditor.placeInputUpdated() ${name}`);
      // clear current results
      vm.places = [];
      vm.placeName = name;
      vm.findPlace()
    },

    clearPlace() {
      //console.log('NoteEditor.clearPlace()');
      vm.$emit('place', null);
    },

    searchForLocation(location) {
      //console.log(`NoteEditor.searchForLocation() location [${location}]`);
      const options = {
        query: location
      };
      // Make sure we have valid geocoordinates
      if (this.hasGeocoords) {
        options.location = {
          lat: this.geoLat,
          lng: this.geoLon
        }
      }
      // perform Places textSearch
      this.placesService.textSearch(options, (res, status) => {
        //console.log(`NoteEditor.searchForLocation() status [${status}] results`);
        //console.dir(res);
        // TODO Future option for displaying multiple results
        if (status === 'OK') {
          const loc = res[0];
          this.note.geocode = this.note.geocode || {};
          this.$set(this.note.geocode, 'lat', Number(loc.geometry.location.lat().toFixed(7)));
          this.$set(this.note.geocode, 'lng', Number(loc.geometry.location.lng().toFixed(7)));
          if (loc.place_id) {
            this.confirmTitle = 'Add Place';
            this.confirmBody = `Your search for "${location}" found place information for <img src="${loc.icon}" width="25" height="25" style="vertical-align: middle;"><b>${loc.name}</b>. Would you like to save this with your note?`;
            this.confirmMethod = this.placeSelected.bind(this, loc);
            this.showConfirm = true;
          }
        } else if (status === 'ZERO_RESULTS') {
          this.messageTitle = 'No Results';
          this.messageBody = `Your search for [${location}] return no results.`;
          this.messageClass = 'notify';
          this.showMessage = true;
        } else {
          this.showServiceFailure();
        }
      })
    },

    showServiceFailure() {
      //console.log(`NoteEditor.showServiceFailure()`);
      vm.messageTitle = 'Service Failure';
      vm.messageBody = 'There was a problem searching for places at your current location.';
      vm.showMessage = true;
    }

  }
}