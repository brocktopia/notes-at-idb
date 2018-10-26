<template>
  <div class="app-container">

    <header>
      <h2>Notebooks</h2>
      <span class="button-bar">
        <svg class="icon" @click="addNotebook()"><use xlink:href="./dist/symbols.svg#add-item"></use></svg>
      </span>
    </header>

    <div class="content">
      <ul class="notebooks">
        <li
          v-for="notebook in notebooks"
          :key="notebook._id"
          class="list-item"
          @click="notebookSelect(notebook)"
        >
          <span class="list-item-name">{{notebook.name}}</span>
          <span class="notebook-date">{{$moment(notebook.Created_date).format("l")}}</span>
        </li>
      </ul>
      <div v-if="notebooks.length === 0" class="notebooks-message">No notebooks have been created.</div>
      <div class="loading-mask" v-if="isLoading"><span>{{loadingMessage}}</span></div>
    </div>

    <div class="navigation">
      <router-link to="/">Home</router-link>
    </div>

    <edit-notebook-dialog
      v-if="showNewNotebook"
      :mode="'create'"
      :notebook="notebookBaseObj"
      v-on:save="saveNewNotebook"
      v-on:close="cancelNewNotebook"
    ></edit-notebook-dialog>

  </div>
</template>

<script>
  import EditNotebookDialog from './EditNotebookDialog'

  export default {

    components:{
      EditNotebookDialog
    },

    data() {
      return {
        notebooks:[],
        showNewNotebook:false,
        isLoading: true,
        loadingMessage:'Loading...',
        notebookBaseObj:{}
      }
    },

    mounted() {
      console.log('Notebooks.mounted()');
      this.$notesDB.notebooks
        .toArray()
        .then((notebooks) => {
          this.isLoading = false;
          this.notebooks = notebooks;
        })
        .then(() => {
          // Check to see if route is to notebooks-new
          if (this.$route.name === 'notebooks-new') {
            this.showNewNotebook = true;
          }
        })
        .catch(this.handleError);
    },

    methods:{

      notebookSelect(notebook) {
        //console.log('Notebooks.notebookSelect() notebook');
        this.$router.push('/notebook/'+notebook._id);
      },

      addNotebook() {
        //console.log('Notebooks.addNotebook()');
        // initialize a new notebook instance
        this.notebookBaseObj = {name:'', Created_date: new Date()};
        this.showNewNotebook = true;
        this.$router.replace('/notebooks/new');
      },

      cancelNewNotebook() {
        //console.log('Notebooks.cancelNewNotebook()');
        // clear notebookBaseObj
        this.notebookBaseObj = {};
        this.showNewNotebook = false;
        this.$router.replace('/notebooks');
      },

      saveNewNotebook(notebook) {
        //console.log('Notebooks.saveNewNotebook()');
        this.$notesDB.notebooks.add(notebook)
          .then(id => {
            console.log('Notebooks.saveNewNotebook() notebook ['+id+'] added');
            notebook._id = id;
            this.notebooks.unshift(notebook);
            // clear notebookBaseObj
            this.notebookBaseObj = {};
            this.showNewNotebook = false;
            this.$router.replace('/notebooks');
          })
          .catch(error => console.log(error));
      }
    },

    handleError(err) {
      console.warn('Notebooks.handleError()');
      console.dir(err);
      this.isLoading = false;
    }

  }
</script>

<style scoped>
  ul {
    width: 100%;
    margin: 0px;
    text-align: left;
  }
  ul.notebooks li {
    list-style: none;
    width: 100%;
    height: 50px;
    padding: 0px 20px;
    background-color: #dddddd;
    border-top: 1px solid #ffffff;
    border-bottom: 1px solid #999999;
    line-height: 50px;
    cursor: pointer;
  }
  ul.notebooks li:hover {
    background-color: #eeeeee;
  }
  .notebook-date {
    float: right;
  }
  .notebooks-message {
    margin: 20px;
  }
</style>