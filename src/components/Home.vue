<template>
  <div class="app-container">

    <header>
      <h2>Home <span v-if="showStats">- Stats</span></h2>
      <router-link v-if="showStats" to="/" class="action-link">
        <svg class="icon" fill="#000" @click="router.push('/')"><use xlink:href="./dist/symbols.svg#close-note"></use></svg>
      </router-link>
    </header>

    <div class="content" v-if="!showStats">
      <img class="logo" src="../assets/logo.png" width="180" height="40" />
      <p>
        <b>notes<span class="at-char">@</span></b> allows you to connect an idea with a place.
        Create a new note and it will be tagged with the location where the note was created.
        The location will be stored as geolocation coordinates and can be associated with a place on Google Maps.
        You can organized notes into notebooks which can be viewed as a list or as points on a map.
      </p>
      <p>To get started create a new notebook now.</p>
      <button class="create-notebook" @click="createNewNotebook()">Create a Notebook</button>
    </div>

    <div class="content" v-if="showStats">
      <h2>Data Storage Statistics</h2>
      <div class="stats">
        <span>Data Storage Available: {{storageCapacityGB}}</span>
        <br/>
        <span>Data Storage Used: {{storageUsedMB}}</span>
        <br/>
        <span>{{notebooksCount}} Notebooks Created</span>
        <br/>
        <span>{{notesCount}} Notes Created</span>
      </div>
    </div>


    <div class="navigation">
      <router-link to="/notebooks">Go to Notebooks</router-link>
      <router-link v-if="!showStats" to="/stats" class="action-link">Stats</router-link>
      <router-link v-if="showStats" to="/" class="action-link">Hide Stats</router-link>
    </div>

  </div>
</template>

<script>
  
  export default {

    data() {
      return {
        showStats:false,
        storageCapacityGB:'0',
        storageUsedMB:'0',
        notebooksCount:0,
        notesCount:0
      }
    },

    mounted() {
      //console.log('Home.mounted()');
      // Testing for DB failure
      if (!this.$notesDB.isOpen()) {
        this.$notesDB.open()
          .then(() => {
            console.log('Home.mounted() $notesDB has been opened');
          })
          .catch((err) => {
            console.warn('Home.mounted() $notesDB has failed to open');
            console.dir(err);
          })
      } else {
        console.log('Home.mounted() $notesDB is already open');
      }
      // Build Stats
      this.showEstimatedQuota()
        .then((res) => {
          console.log('Home.mounted() $notesDB.showEstimatedQuota()');
          if (!res) {
            console.log('Home.mounted() No Storage Data');
            this.storageCapacityGB = 'Unknown';
            this.storageUsedMB = 'Unknown';
            return;
          }
          console.dir(res);
          if (!isNaN(res.quota)) {
            this.storageCapacityGB = (res.quota / 1000000000).toPrecision(4) + ' GB';
          }
          if (!isNaN(res.usage)) {
            this.storageUsedMB = (res.usage / 1000000).toPrecision(4) + ' MB';
          }
        });
      this.$notesDB.notebooks
        .count()
        .then(n => this.notebooksCount = n)
        .catch(this.handleError);
      this.$notesDB.notes
        .count()
        .then(n => this.notesCount = n)
        .catch(this.handleError);
      // Check route
      if (this.$route.name === 'home-stats') {
        this.showStats = true;
      }
    },

    watch: {
      $route(toRoute, fromRoute) {
        //console.log('Home.$route() toRoute ['+toRoute.name+'] fromRoute ['+fromRoute.name+'] path ['+toRoute.path+']');
        if (toRoute.name === 'home-stats') { // notebook home
          this.showStats = true;
        } else if (toRoute.name === 'home') { // notebook home
          this.showStats = false;
        }
      }
    },

    methods: {
      createNewNotebook() {
        //console.log('Home.createNewNotebook()');
        this.$router.push('/notebooks/new')
      },
      showEstimatedQuota: async function() {
        return await navigator.storage && navigator.storage.estimate ?
          navigator.storage.estimate() :
          undefined;
      },
      handleError(err) {
        console.warn('Home.handleError()');
        console.dir(err);
      }
    }

  }
</script>

<style scoped>
  .content {
    position: relative;
    padding: 20px;
    height: 100%;
  }
  .logo {
    display: block;
    margin: 30px auto;
  }
  .at-char {
    color: #4e7eef;
  }
  .create-notebook {
    display: block;
    margin: 30px auto;
    padding: 0.5rem 1.5rem;
  }
  .stats {

  }
</style>