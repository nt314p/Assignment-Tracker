<template>
  <div>
    <div align="center">
      <br />
      <img style="height: 140px; max-width: 150px" src="../statics/tracker_logo.png" />

      <div v-if="loggedIn()">
        <h2>Welcome to Assignment Tracker,</h2>
        <h3 id="usernameBox" ></h3>
      </div>
      <div v-else>
        <h2>Welcome to Assignment Tracker!</h2>
        <q-btn label="Log In" color="primary" @click="login()" />
        <p />
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
      if (data != null) {
        let uri = "http://localhost:4000/accounts/func/getUsername";
        this.axios
          .get(uri, { headers: { Authorization: "Bearer " + data } })
          .then(res => {
            this.username = res.data.username;
            document.getElementById("usernameBox").innerText = this.username;
          });
      }
      return data != null;
    },
    login() {
      this.$router.push({ name : "account" });
    }
  }
};
</script>