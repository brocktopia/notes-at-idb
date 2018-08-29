import Vue from 'vue'
import App from './App'
import router from './router'
import moment from 'moment'
import dexie from 'dexie'
import * as VueGoogleMaps from 'vue2-google-maps'
import './css/style.scss'
import './assets/svg/symbols.svg'

Vue.use(VueGoogleMaps, {
  load: {
    key: 'your-google-api-key',
    libraries: 'places'
  }
});

let notesDB = new dexie('NotesDB');
notesDB.version(1).stores({
  notebooks: '++_id,name,Created_date',
  notes: '++_id,name,Created_date,note,notebook'
});

Vue.prototype.$notesDB = notesDB;

/*
Vue.prototype.$axios = axios.create({
  baseURL: serviceUrl + servicePort
});
*/

Vue.prototype.$moment = moment;

new Vue({
  el: '#app',
  router,
  render: h => h(App)
});
