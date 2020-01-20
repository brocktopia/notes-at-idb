<template>
  <div class="modal-mask" @click="$emit('close')">

    <div class="modal-wrapper">

      <div class="modal-container" @click.stop="function(){}">

        <div class="modal-header">
          <h3>Nearby Places</h3>
        </div>

        <div class="modal-body">
          <input v-model="place.name" placeholder="Enter a place name" @input="updatePlaceSearch(place.name)">
          <ul class="place-list">
            <li class="place" v-for="place in places" @click="$emit('select', place)">
              <img :src="place.icon" width="25" height="25"/>
              <span class="place-name">{{place.name}}</span>
              <!--
              <span v-if="place.types" class="place-type">({{place.types[0]}})</span>
              -->
            </li>
          </ul>
          <span v-if="noResults">No places found at your current location.</span>
        </div>

        <div class="modal-footer">
          <button v-if="showMore" class="modal-optional-botton" @click="$emit('more')">
            More Results
          </button>
          <button class="modal-default-button" @click="$emit('close')">
            Cancel
          </button>
        </div>

      </div>

    </div>

  </div>
</template>

<script>
  var vm;

  module.exports = {

    data() {
      return {
        interval:null
      }
    },

    props:{
      places: Array,
      placeName: String,
      showMore: Boolean,
      noResults: Boolean
    },

    computed:{
      place() {
        return {'name': this.placeName}
      }
    },

    mounted: function() {
      vm = this;
    },

    methods: {

      updatePlaceSearch(name) {
        //console.log('PlacesDialog.updatePlaceSearch() placeName ['+placeName+']');
        if (vm.interval) {
          clearTimeout(vm.interval);
        }
        vm.interval = setTimeout(() => {
          vm.$emit('place', name);
          vm.interval = false;
        }, 500);
      }
    }

  };
</script>

<style lang="scss" scoped>
  input {
    width: 100%;
  }
  ul.place-list {
    max-height: 540px;
    margin: 10px 0;
    overflow-y: auto;
    overflow-x: hidden;
  }
  li.place {
    height: 30px;
    width: 100%;
    cursor: pointer;
    font-size: smaller;
    display: block;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  li.place img {
    vertical-align: middle;
  }
  /* Mobile rules */
  @media only screen and (min-device-width : 320px) and (max-device-width : 480px) {
    .modal-mask .modal-container {
      position: relative;
      width: 100%;
      height: calc(100vh - 140px);
      ul.place-list {
        max-height: calc(100vh - 320px);
        li.place {
          font-size: 1.2rem;
          height: 45px;
          img {
            width: 40px;
            height: 40px;
          }
        }
      }
    }
    .modal-footer {
      position: absolute;
      bottom: 5px;
      width: calc(100vw - 60px);
    }
  }
  /* Non-mobile rules */
  @media screen and (min-width: 800px) {
    .modal-mask .modal-container {
      width: 460px;
      max-height: 720px;
    }
  }
</style>