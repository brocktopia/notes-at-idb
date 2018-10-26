<template>
  <div>

    <div class="app-container" v-if="activeView === 'notebook'">

      <header>
        <h2>Notebook</h2>
        <span class="button-bar">
          <svg class="icon" @click="deleteNotebook()"><use xlink:href="./dist/symbols.svg#delete-note"></use></svg>
          <svg class="icon" @click="editNotebook()"><use xlink:href="./dist/symbols.svg#edit-note"><title>Edit Notebook</title></use></svg>
          <svg class="icon" @click="showMap()"><use xlink:href="./dist/symbols.svg#map"></use></svg>
          <svg class="desktop-only icon" @click="addNote()"><use xlink:href="./dist/symbols.svg#add-note"></use></svg>
          <svg class="mobile-only icon" @click="addNoteMobile()"><use xlink:href="./dist/symbols.svg#add-note"></use></svg>
        </span>
      </header>

      <div class="content">
        <h2 class="main">{{notebook.name}}</h2>
        <ul class="notebook">

          <li v-for="note in notebook.notes" class="note-item" @click="noteSelect(note)">
            <span class="title">{{note.name}}</span><br/>
            <span class="date">{{$moment(note.Created_date).format('ddd l h:mm a')}}</span>
            <span v-if="!note.place || !note.place.name" class="geocoords">
              <svg class="icon-tiny location-icon"><use xlink:href="./dist/symbols.svg#my-location"></use></svg>
              {{(note.geocode.lat ? note.geocode.lat.toFixed(5) : 'Unknown') + ', ' + (note.geocode.lng ? note.geocode.lng.toFixed(5) : 'Unknown')}}
            </span>
            <span v-if="note.place && note.place.name" class="place">
              <svg class="icon-tiny place-icon"><use xlink:href="./dist/symbols.svg#place"></use></svg>
              {{note.place.name}}
            </span>
            <br clear="all"/>
            <span class="note">{{note.note.length > 84 ? note.note.substr(0,84) + '...' : note.note}}</span>
          </li>

        </ul>
        <div class="notebook-message">{{message}}</div>
      </div>

      <div class="navigation">
        <router-link to="/">Home</router-link>
        &gt;
        <router-link to="/notebooks">Notebooks</router-link>
      </div>

    </div>

    <notebook-map
      v-if="activeView === 'map'"
      :name="notebook.name"
      :notes="notebook.notes"
      v-on:close="closeNotebookMap"
      v-on:edit="editNotebook"
      v-on:delete="deleteNotebook"
      v-on:addNote="addNote"
      v-on:addNoteMobile="addNoteMobile"
      v-on:select="noteSelect"
    ></notebook-map>

    <edit-notebook-dialog
      v-if="showEditNotebook"
      @close="showEditNotebook = false"
      :mode="'edit'"
      :notebook="notebook"
      v-on:save="saveNotebook"
    ></edit-notebook-dialog>

    <modal-dialog
      v-if="showConfirmModal"
      @close="showConfirmModal = false"
    >
      <h3 class="warn" slot="header">Confirm Notebook Delete</h3>
      <div slot="body">Are you sure you want to delete this notebook? <span v-html="notebookDeleteMsg"></span> This can not be undone.</div>
      <div slot="footer">
        <button class="modal-optional-button" @click="cancelDelete()">
          Cancel
        </button>
        <button class="modal-default-button" @click="confirmDelete()">
          Confirm
        </button>
      </div>
    </modal-dialog>

    <modal-dialog v-if="showMessage" @close="showMessage = false">
      <h3 :class="messageClass" slot="header">{{messageTitle}}</h3>
      <div slot="body" v-html="messageBody"></div>
    </modal-dialog>

    <note-view
      v-if="activeView === 'note'"
      :note="activeNote"
      :noteCount="noteCount"
      v-on:edit="editNote"
      v-on:editmobile="editNoteMobile"
      v-on:close="closeNote"
      v-on:delete="deleteNote"
      v-on:next="nextNote"
      v-on:previous="previousNote"
    ></note-view>

    <note-edit-mobile
      v-if="activeView === 'mobile-note-edit'"
      :note="activeNote"
      :mode="noteEditMode"
      v-on:save="saveNote"
      v-on:close="closeNoteNew"
      v-on:cancel="cancelNoteEdit"
      v-on:latlon="updateNoteGeocode"
      v-on:place="updateNotePlace"
    ></note-edit-mobile>

    <note-edit
      v-if="activeView === 'note-edit'"
      :note="activeNote"
      :mode="noteEditMode"
      v-on:save="saveNote"
      v-on:close="closeNoteNew"
      v-on:cancel="cancelNoteEdit"
      v-on:latlon="updateNoteGeocode"
      v-on:place="updateNotePlace"
    ></note-edit>

    <div class="loading-mask" v-if="isLoading"><span>{{loadingMessage}}</span></div>

  </div>
</template>

<script>
  import ModalDialog from './ModalDialog'
  import EditNotebookDialog from './EditNotebookDialog'
  import NotebookMap from './NotebookMap'
  import NoteView from './Note'
  import NoteEdit from './NoteEdit'
  import NoteEditMobile from './NoteEditMobile'
  import {GmapMap} from 'vue2-google-maps'

  export default {

    components: {
      NoteView, NoteEdit, NoteEditMobile, ModalDialog, EditNotebookDialog, NotebookMap
    },

    data() {
      return {
        notebook:{},
        notebookRouteExtra: '',
        message: '',
        showMessage: false,
        activeView: 'notebook',
        activeNote: null,
        messageClass: 'notify',
        messageTitle: '',
        messageBody: '',
        noteEditMode: '',
        showConfirmModal: false,
        showEditNotebook:false,
        isLoading: true,
        loadingMessage: 'Loading...'
      }
    },

    mounted() {
      const notebook_id = Number(this.$route.params.notebook_id);
      //console.log('Notebook.mounted() get notebook by id ['+notebook_id+']');
      // Load notebook data
      this.$notesDB.notebooks
        .get({'_id':notebook_id})
        .then((notebook) => {
          this.isLoading = false;
          this.notebook = notebook;
        })
        .then(() => {
          if (!this.notebook) {
            console.warn('Notebook.mounted() no notebook reference was returned');
            this.$router.replace('/notebooks');
            return false;
          }
          // get notes
          this.$notesDB.notes
            .where('notebook').equals(notebook_id)
            .toArray()
            .then((notes) => {
              console.log('Notebook.mounted() notes');
              console.dir(notes);
              if (notes && notes.length > 0) {
                this.message = ' '; // BUG - First item isn't showing up if message is empty string
                this.notebook.notes = notes;
              } else {
                this.notebook.notes = [];
                this.message = 'No notes in this notebook.';
              }
            })
            .catch(this.handleError)
            .then(() => { // check route for deep-linking
              if (this.$route.params.note_id) {
                const note_id = Number(this.$route.params.note_id);
                this.setActiveNote(note_id);
                if (this.$route.name === 'notebook-note') {
                  this.activeView = 'note';
                } else if (this.$route.name === 'notebook-note-edit') {
                  this.noteEditMode = 'edit';
                  this.activeView = 'note-edit';
                } else if (this.$route.name === 'notebook-note-edit-mobile') {
                  this.noteEditMode = 'edit';
                  this.activeView = 'mobile-note-edit';
                }
              }
              else if (this.$route.name === 'notebook-note-new') {
                this.activeNote = this.getNoteTemplate();
                this.noteEditMode = 'new';
                this.activeView = 'note-edit';
              }
              else if (this.$route.name === 'notebook-note-new-mobile') {
                this.activeNote = this.getNoteTemplate();
                this.noteEditMode = 'new';
                this.activeView = 'mobile-note-edit';
              }
              else if (this.$route.name === 'notebook-map') {
                this.notebookRouteExtra = '/map';
                this.activeView = 'map';
              }
            })
        })
        .catch(this.handleError);
      // Get google reference
      this.$gmapApiPromiseLazy().then((google) => {
        this.google = google;
      });
    },

    computed:{
      notebookDeleteMsg() {
        //console.log('Notebook.computed.notebookDeleteMsg');
        let notes = this.notebook.notes;
        return (notes.length > 0 ? '<b style="color:darkred;">All ' + (notes.length > 2 ? notes.length : '') + ' notes</b> in this notebook will be deleted. ' : '')
      },
      noteCount() {
        return this.notebook.notes ? this.notebook.notes.length : 0;
      }
    },

    watch: {
      $route (toRoute, fromRoute) {
        //console.log('Notebook.$route() toRoute ['+toRoute.name+'] fromRoute ['+fromRoute.name+'] path ['+toRoute.path+']');
        if (toRoute.name === 'notebook') { // notebook home
          this.activeNote = {};
          this.notebookRouteExtra = '';
          this.activeView = 'notebook';
        }
        else if (toRoute.name === 'notebook-map') { // notebook map
          this.notebookRouteExtra = '/map';
          this.activeView = 'map';
        }
        else if (toRoute.name === 'notebook-note') { // notebook note
          if (this.setActiveNote(Number(this.$route.params.note_id))) this.activeView = 'note';
        }
        else if (toRoute.name === 'notebook-note-new') { // notebook new note
          this.activeNote = this.getNoteTemplate();
          this.noteEditMode = 'new';
          this.activeView = 'note-edit';
        }
        else if (toRoute.name === 'notebook-note-new-mobile') { // notebook new note for mobile
          this.activeNote = this.getNoteTemplate();
          this.noteEditMode = 'new';
          this.activeView = 'mobile-note-edit';
        }
        else if (toRoute.name === 'notebook-note-edit') { // notebook edit note
          if (this.setActiveNote(Number(this.$route.params.note_id))) {
            this.noteEditMode = 'edit';
            this.activeView = 'note-edit';
          }
        }
        else if (toRoute.name === 'notebook-note-edit-mobile') { // notebook edit note for mobile
          if (this.setActiveNote(Number(this.$route.params.note_id))) {
            this.noteEditMode = 'edit';
            this.activeView = 'mobile-note-edit';
          }
        }
        else {
          console.warn('Notebook.$route() Unhandled route');
          console.dir(toRoute);
        }
      }
    },

    methods:{

      // Utility methods

      setActiveNote(note_id) {
        // for IndexedDB _id needs to be typed as a Number
        //console.log('Notebook.setActiveNote() for '+note_id+':'+typeof(note_id));
        // see if active note is already set
        if (this.activeNote && this.activeNote._id === note_id) {
          return true;
        }
        // look up note
        this.activeNote = this.notebook.notes.find(note => note._id === note_id);
        if (this.activeNote) {
          return true;
        } else {
          console.warn('Notebook.setActiveNote() Failed to locate note ['+note_id+']');
          // show user message
          this.messageClass = 'warn';
          this.messageTitle = 'Note Not Found';
          this.messageBody = 'The note in your link could not be found. It may have been removed from the notebook.';
          this.showMessage = true;
          // clear route
          this.$router.push('/notebook/'+this.notebook._id + this.notebookRouteExtra);
          return false;
        }
      },

      // Navigation inside notebook using $router

      noteSelect(note) {
        //console.log('Notebook.noteSelect() '+note._id);
        // Let route watcher manage change
        this.$router.push('/notebook/'+this.notebook._id+'/note/'+note._id);
      },

      nextNote() {
        //console.log('Notebook.nextNote()');
        let i = this.notebook.notes.findIndex(x => x._id === this.activeNote._id);
        i++;
        if (!isNaN(i)) {
          if (this.notebook.notes[i]) {
            this.activeNote = this.notebook.notes[i];
          } else {
            this.activeNote = this.notebook.notes[0];
          }
        }
        this.$router.push('/notebook/'+this.notebook._id+'/note/'+this.activeNote._id);
      },

      previousNote() {
        //console.log('Notebook.previousNote()');
        let i = this.notebook.notes.findIndex(x => x._id === this.activeNote._id);
        i--;
        if (!isNaN(i)) {
          if (i >= 0) {
            this.activeNote = this.notebook.notes[i];
          } else {
            this.activeNote = this.notebook.notes[this.notebook.notes.length - 1];
          }
        }
        this.$router.push('/notebook/'+this.notebook._id+'/note/'+this.activeNote._id);
      },

      editNote() {
        //console.log('Notebook.editNote()');
        this.$router.push('/notebook/'+this.notebook._id+'/note-edit/'+this.activeNote._id);
      },

      editNoteMobile() {
        //console.log('Notebook.editNoteMobile()');
        this.$router.push('/notebook/'+this.notebook._id+'/note-edit-mobile/'+this.activeNote._id);
      },

      addNote() {
        //console.log('Notebook.addNote()');
        this.$router.push('/notebook/'+this.notebook._id+'/note-new');
      },

      addNoteMobile() {
        //console.log('Notebook.addNoteMobile()');
        this.$router.push('/notebook/'+this.notebook._id+'/note-new-mobile');
      },

      closeNote() {
        //console.log('Notebook.closeNote()');
        this.$router.push('/notebook/'+this.notebook._id + this.notebookRouteExtra);
      },

      closeNoteNew() {
        //console.log('Notebook.closeNoteNew()');
        this.$router.push('/notebook/'+this.notebook._id + this.notebookRouteExtra);
      },

      cancelNoteEdit() {
        //console.log('NotebookcancelNoteEdit()');
        // need to reload note in case user changed something
        this.loadingMessage = 'Cancelling Edit...';
        this.isLoading = true;
        this.$notesDB.notes.get({'_id':this.activeNote._id})
          .then((note) => {
            // Error checking
            if (note._id) {
              // replace notebook.notes instance
              let i = this.notebook.notes.findIndex(x => x._id === this.activeNote._id);
              this.activeNote = note;
              this.notebook.notes[i] = note;
              this.$router.push('/notebook/'+this.notebook._id+'/note/'+this.activeNote._id);
            } else {
              console.warn('cancelNoteEdit Error updating note');
              console.dir(note);
            }
            this.isLoading = false;
          })
          .catch(this.handleError);
      },

      showMap() {
        //console.log('Notebook.showMap()');
        this.$router.push('/notebook/' + this.notebook._id + '/map');
      },

      closeNotebookMap() {
        //console.log('Notebook.closeNotebookMap()');
        this.$router.push('/notebook/' + this.notebook._id);
      },

      // Notebook methods

      editNotebook() {
        //console.log('Notebook.editNotebook()');
        this.showEditNotebook = true;
      },

      saveNotebook() {
        //console.log('Notebook.saveNotebook()');
        this.loadingMessage = 'Saving...';
        this.isLoading = true;
        this.$notesDB.notebooks
          .put(this.notebook)
          .then((res) => {
            console.log('Notebook.saveNotebook() Notebook updated');
            console.dir(res);
            this.isLoading = false;
            this.showEditNotebook = false;
          })
          .catch(this.handleError);
      },

      deleteNotebook() {
        //console.log('Notebook.deleteNotebook()');
        this.showConfirmModal = true;
      },

      cancelDelete() {
        //console.log('Notebook.cancelDelete()');
        this.showConfirmModal = false;
      },

      confirmDelete() {
        //console.log(`Notebook.confirmDelete() notebook [${this.notebook._id}]`);
        this.loadingMessage = 'Removing Notebook...';
        this.isLoading = true;
        this.$notesDB.notebooks
          .delete(this.notebook._id)
          .then(() => {
            //console.log('Notebook.confirmDelete() deleted');
            this.showConfirmModal = false;
            this.isLoading = false;
            this.$router.replace('/notebooks');
          })
          .catch(this.handleError);
      },

      updateNotes() {
        //console.log('Notebook.updateNotes()');
        this.loadingMessage = 'Updating Notebook...';
        this.isLoading = true;
        this.$notesDB.notes
          .where('notebook').equals(this.notebook._id)
          .toArray()
          .then((notes) => {
            if (notes.length > 0) {
              this.message = '';
              this.notebook.notes = notes;
            } else {
              this.notebook.notes = [];
              this.message = 'No notes in this notebook.';
            }
            this.isLoading = false;
          })
          .catch(this.handleError);
      },

      // Note edit methods

      getNoteTemplate() {
        return {
          name:'',
          Created_date: (new Date()).toISOString(),
          geocode: {
            lat:0,
            lng:0
          },
          note:'',
          notebook: this.notebook._id
        }
      },

      saveNote() {
        //console.log('Notebook.saveNote() editMode ['+this.noteEditMode+']');
        this.loadingMessage = 'Saving Note...';
        this.isLoading = true;
        if (this.noteEditMode === 'edit') {
          this.$notesDB.notes.put(this.activeNote)
            .then((res) => {
              console.log('Notebook.saveNote() Note updated');
              console.dir(res);
              this.isLoading = false;
              this.$router.push('/notebook/'+this.notebook._id+'/note/'+this.activeNote._id);
            })
            .catch(this.handleError);
        } else if (this.noteEditMode === 'new') {
          this.$notesDB.notes.add(this.activeNote)
            .then((id) => {
              console.log('Notebook.saveNote() New Note created ['+id+']');
              // confirm new note
              if (id) {
                this.activeNote._id = id;
                this.notebook.notes.unshift(this.activeNote);
                this.$router.push('/notebook/'+this.notebook._id+'/note/'+this.activeNote._id);
                this.updateNotes();
              } else {
                this.handleError({message:'Notebook.saveNote() did not return note id'});
              }
            })
            .catch(this.handleError);
        }

      },

      deleteNote() {
        //console.log('Notebook.deleteNote()');
        this.loadingMessage = 'Removing Note...';
        this.isLoading = true;
        this.$notesDB.notes
          .delete(this.activeNote._id)
          .then(() => {
            //console.log('Notebook.deleteNote() Note deleted');
            this.$router.push('/notebook/'+this.notebook._id + this.notebookRouteExtra);
            this.updateNotes();
          });
      },

      updateNoteGeocode(latLonObj) {
        //console.log('Notebook.updateNoteGeocode()');
        if (this.activeNote) {
          this.activeNote.geocode = latLonObj;
        }
      },

      updateNotePlace(placeObj, latLonObj) {
        //console.log('Notebook.updateNotePlace()');
        if (this.activeNote) {
          if (placeObj) {
            this.activeNote.place = placeObj;
          } else {
            // Vue is not reactive when setting object reference to null
            this.$delete(this.activeNote, 'place');
          }
          if (latLonObj) {
            this.activeNote.geocode = latLonObj;
          }
        }
      },

      handleError(err) {
        console.warn('Notebook.handleError()');
        console.dir(err);
        this.isLoading = false;
        this.messageClass = 'warn';
        if (err.message === 'Network Error') {
          this.messageTitle = 'Network Error';
          this.messageBody = 'There was a problem connecting to application services. Please try again. If the problem persist, please contact support.';
        } else if (err.message.indexOf('validation failed') != -1) {
          // show user message
          let msg = err.message,
            title = msg.substr(0, msg.indexOf(':')),
            msgBody = msg.slice(msg.indexOf(':') + 2);
          this.messageTitle = title;
          this.messageBody = '';
          if (msgBody.indexOf(',')) {
            msgBody.split(',').forEach(part => {
              this.messageBody += part.slice(part.indexOf(':') + 2) + '<br/>';
            });
          } else {
            this.messageBody += msgBody.slice(msgBody.indexOf(':') + 2);
          }
        } else {
          this.messageTitle = 'Unknown Error';
          this.messageBody = 'There was an unknown problem. Please try again. If the problem persist, please contact support.';
        }
        this.showMessage = true;
      }

    }
  }
</script>

<style scoped>
  ul {
    margin: 0;
  }
  ul.notebook li {
    margin: 0;
    list-style: none;
    width: 100%;
    background-color: #ffffff;
    border-top: 1px solid #cccccc;
    border-bottom: 1px solid #999999;
    padding: 10px 20px;
    text-align: left;
    cursor: pointer;
  }
  ul.notebook li span {
    display: inline-block;
  }
  .notebook-message {
    margin: 20px;
  }
  .date, .note {
    font-size: smaller;
  }
  .title {
    margin-bottom: 8px;
  }
  .note {
    margin-top: 8px;
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .geocoords, .place {
    float: right;
    font-size: smaller;
    width: 60%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .geocoords {
    color: #4e7eef;
  }
  .location-icon {
    fill: #4e7eef;
  }
  .place {
    color: #666;
  }
  .place-icon {
    fill: #ed453b;
  }
</style>