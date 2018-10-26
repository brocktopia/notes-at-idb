<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>

<script>

  export default {

    name: 'app',

    data () {
      return {
        // this allows me to disable service workers while developing
        isDevMode: false
      }
    },

    mounted() {
      console.log(`App.mounted()`);
      if ('serviceWorker' in navigator && !this.isDevMode) {
        console.log(`App.mounted() Let's register some service workers!`);
        navigator.serviceWorker.register('serviceworkers.js', { scope: './' })
          .then(function(swRegistration) {
            console.log(`App.mounted() service workers registration`);
            console.dir(swRegistration);
            let sw;

            if(swRegistration.installing) {
              console.log('Service worker installing');
              sw = swRegistration.installing;
            } else if(swRegistration.waiting) {
              console.log('Service worker installed and waiting--skipWaiting');
              sw = swRegistration.waiting;
            } else if(swRegistration.active) {
              console.log('Service worker active');
              sw = swRegistration.active;
            }

            console.log(`App.mounted() service worker`);
            console.dir(sw);

        }).catch(function(error) {
          // registration failed
          console.warn('Service worker registration failed with ' + error);
        });
      }
    }

  }

</script>
