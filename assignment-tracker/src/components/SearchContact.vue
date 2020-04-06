<!-- the code below belongs to jnarayan -->s

<template>
  <div>
    <h1>Add a Song</h1>
    <br />
    <form @submit.prevent="addSong">
      <label>Song Title:</label>
      <input type="text" v-model="song.title" />
      <label>Artist:</label>
      <input type="text" v-model="song.artist" />
      <label>Album:</label>
      <input type="text" v-model="song.album" />
      <label>Genre:</label>
      <select v-model="song.genre">
        <option>Pop</option>
        <option>Rock</option>
        <option>Alternative</option>
        <option>Hip hop</option>
        <option>R&B</option>
        <option>Jazz</option>
        <option>Classical</option>
        <option>Metal</option>
        <option>Electronic</option>
      </select>
      <input type="file" id="test" />
      <div class="form-group">
        <button class="btn btn-primary">Create</button>
      </div>
    </form>
  </div>
</template>

 

<script>
export default {
  data() {
    return {
      song: {},
      temp: "123",
      reader: null
    };
  },
  mounted() {
    this.reader = new FileReader();
    this.reader.onload = function() {
      this.temp = this.reader.result;
    };
  },
  methods: {
    addSong() {

      var x = document.getElementById("test").files[0];
      this.reader.readAsDataURL(x);

      console.log(this.temp);

      let uri = "http://localhost:4000/songs/add";
      this.axios.post(uri, this.song).then(() => {
        this.$router.push({ name: "songs" });
      });
    }
  }
};
</script>