<template>
  <div>
    <div align="center">
      <br />
      <img style="height: 140px; max-width: 150px" src="../statics/tracker_logo.png" />

      <div v-if="loggedIn()">
        <h2>Welcome to Assignment Tracker,</h2>
        <h3 id="usernameBox"></h3>
      </div>
      <div v-else class="q-pa-md" style="max-width: 500px">
        <h2>Welcome to Assignment Tracker!</h2>
        <q-btn label="Log In" color="primary" @click="login()" />
        <q-btn label="Create Account" color="primary" @click="login()" />
      </div>
    </div>
  </div>
</template>



      <script>
export default {
  data() {
    return {
      username: ""
    };
  },
  methods: {
    loggedIn() {
      let data = sessionStorage.getItem("token");
      console.log(data);
      if (data != null) {
        let uri = "http://localhost:4000/accounts/func/getUsername";
        this.axios.get(uri, { headers: { Authorization: "Bearer " + data } }).then(res => {
          console.log(res);
          this.username = res.username;
        });
      }
      return data != null;
    },
    logIn() {
      this.$router.push({ name: "account" });
    }
  }
};
</script>