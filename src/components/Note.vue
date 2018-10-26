<template>
  <div class="app-container">

    <header>
      <h2>Note</h2>
      <span class="button-bar">
         <button class="icon delete-note" @click="deleteNote()"><svg><use xlink:href="./dist/symbols.svg#delete-note">
          <title>Delete Note</title>
        </use></svg></button>
        <button class="desktop-only icon edit-note" @click="editNote()"><svg><use xlink:href="./dist/symbols.svg#edit-note">
          <title>Edit Note</title>
        </use></svg></button>
        <button class="mobile-only icon edit-note" @click="editNoteMobile()"><svg><use xlink:href="./dist/symbols.svg#edit-note">
          <title>Edit Note</title>
        </use></svg></button>
        <button v-if="showNoteMap" class="icon show-note" @click="showNote()"><svg><use xlink:href="./dist/symbols.svg#note">
          <title>Show Note</title>
        </use></svg></button>
        <button v-if="showNoteMap === false" class="icon show-map" @click="showMap()"><svg><use xlink:href="./dist/symbols.svg#map">
          <title>Show Map</title>
        </use></svg></button>
        <button class="icon close-note" @click="closeNote()"><svg><use xlink:href="./dist/symbols.svg#close-note">
          <title>Close Note</title>
        </use></svg></button>
      </span>
    </header>

    <div v-if="!showNoteMap" class="content">

      <h2 class="main">{{note.name}}</h2>

      <div class="body">

        <div class="date">{{$moment(note.date).format('LLLL')}}</div>

        <div class="geocoords" v-if="note.place && note.place.name">
          <img :src="note.place.icon" class="icon-tiny" />
          <span id="placeName">{{note.place.name}}</span>
          <a :href="note.place.url" target="_blank" style="display: inline-block; vertical-align: middle;">
            <svg class="icon-tiny"><use xlink:href="./dist/symbols.svg#launch"></use></svg>
          </a>
        </div>

        <div class="geocoords">
          <a @click="showMap()">
            <svg class="icon-tiny" style="vertical-align: text-bottom;"><use xlink:href="./dist/symbols.svg#my-location"></use></svg>
            {{note.geocode.lat +', '+note.geocode.lng}}
          </a>
        </div>

        <p class="note">{{note.note}}</p>

      </div>
    </div>

    <gmap-map
      class="content"
      v-if="showNoteMap"
      ref="NoteMap"
      :center="{'lat':geoLat,'lng':geoLon}"
      :zoom="15"
    >
      <gmap-info-window
        :options="infoOptions"
        :position="notePosition"
        :opened="infoWinOpen"
        @closeclick="infoWinOpen=false"
      >
        <div class="note-info" v-if="!!note">
          <h3 style="margin: 4px 0;">{{note.name}}</h3>
          <div>{{$moment(note.Created_date).format('l h:mm:ss a')}}</div>
          <div v-if="hasPlace">
            <img :src="note.place.icon" width="24" height="24"/>
            <span>{{note.place.name}}</span>
            <a :href="note.place.url" target="_blank">
              <svg class="icon-tiny"><use xlink:href="./dist/symbols.svg#launch"></use></svg>
            </a>
          </div>
          <p style="max-width: 300px; max-height: 280px; overflow-y: auto; white-space: pre-wrap;">{{note.note}}</p>
        </div>
      </gmap-info-window>
      <gmap-marker
        ref="myMarker"
        :position="notePosition"
        @click="toggleInfoWindow"
      />
    </gmap-map>

    <div class="navigation">
      <router-link to="/">Home</router-link>
      &gt;
      <router-link to="/notebooks">Notebooks</router-link>
      &gt;
      <a @click="closeNote()">Notebook</a>
      <span v-if="noteCount > 1" class="icon-button-bar">
        <a @click="previousNote()">
          <svg><use xlink:href="./dist/symbols.svg#arrow-back">
            <title>Previous Note</title>
          </use></svg>
        </a>
        <a @click="nextNote()">
          <svg><use xlink:href="./dist/symbols.svg#arrow-forward">
            <title>Next Note</title>
          </use></svg>
        </a>
      </span>
    </div>

    <!-- Dynamically loaded content -->

    <modal-dialog v-if="showConfirmModal" @close="showConfirmModal = false">
      <h3 slot="header">Confirm Delete</h3>
      <div slot="body">Are you sure you want to delete this note? This can not be undone.</div>
      <div slot="footer">
        <button class="modal-optional-button" @click="cancelDelete()">
          Cancel
        </button>
        <button class="modal-default-button" @click="confirmDelete()">
          Confirm
        </button>
      </div>
    </modal-dialog>

    <div class="loading-mask" v-if="isLoading"><span>{{loadingMessage}}</span></div>

  </div>
</template>

<script>
  import ModalDialog from './ModalDialog'
  import {gmapApi, GmapMap} from 'vue2-google-maps'

  export default {

    components: {
      ModalDialog
    },

    computed: {
      google: gmapApi,
      hasPlace() {
        return (this.note.place && this.note.place._id);
      },
      geoLat() {
        return this.note.geocode.lat || 0;
      },
      geoLon() {
        return this.note.geocode.lng || 0;
      },
      notePosition() {
        return this.note.geocode ? {
          lat: this.note.geocode.lat,
          lng: this.note.geocode.lng
        } : null;
      },
    },

    props: {
      note:Object,
      noteCount:Number
    },

    data() {
      return {
        showConfirmModal: false,
        isLoading: false,
        loadingMessage:'Loading...',
        showNoteMap:false,
        infoOptions: {
          pixelOffset: {
            width: 0,
            height: -35
          }
        },
        infoWinOpen: true
      }
    },

    mounted() {
      //console.log(`Note.mounted() noteCount [${this.noteCount}]`);
    },

    methods: {
      
      editNote() {
        //console.log('Note.editNote()');
        this.$emit('edit');
      },
      
      editNoteMobile() {
        //console.log('Note.editNoteMobile()');
        this.$emit('editmobile');
      },
      
      closeNote() {
        //console.log('Note.closeNote()');
        this.$emit('close');
      },
      
      nextNote() {
        //console.log('Note.nextNote()');
        this.$emit('next');
      },
      
      previousNote() {
        //console.log('Note.previousNote()');
        this.$emit('previous');
      },
      
      deleteNote() {
        //console.log('Note.deleteNote()');
        this.showConfirmModal = true;
      },
      
      cancelDelete() {
        //console.log('Note.cancelDelete()');
        this.showConfirmModal = false;
      },
      
      confirmDelete() {
        //console.log('Note.confirmDelete()');
        this.$emit('delete');
      },
      
      showMap() {
        //console.log('Note.showMap() lat ['+this.geoLat+'] lng ['+this.geoLon+']');
        this.showNoteMap = true;
      },
      
      showNote() {
        //console.log('Note.showNote()');
        this.showNoteMap = false;
      },
      
      toggleInfoWindow(marker) {
        //console.log('Note.toggleInfoWindow()');
        this.infoWinOpen = !this.infoWinOpen;
      },
      
      closeMap() {
        //console.log('closeMap()');
        this.showNoteMap = false;
      }
      
    }

  }
</script>

<style scoped>
  .body {
    padding: 20px;
  }
  .body > div {
    margin: 10px 0;
  }
  .geocoords img {
    vertical-align: middle;
  }
  .note {
    white-space: pre-wrap;
  }
  a svg {
    fill: #42b983;
  }
  .navigation a {
    display: inline-block;
  }
</style>