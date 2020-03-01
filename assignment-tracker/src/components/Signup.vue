<template>
  <div>
    <div class="q-pa-md" style="max-width: 500px">
      <q-form
        @submit="createAccount"
        @reset="onReset"
        class="q-gutter-md"
        autocorrect="off"
        autocapitalize="off"
        autocomplete="off"
        spellcheck="false"
      >
        <q-input
          clearable
          filled
          v-model="account.name"
          label="Name"
          lazy-rules
          :rules="[ val => val && val.length > 0 || 'Please enter a name']"
        />

        <q-input
          ref="username"
          clearable
          filled
          v-model="account.username"
          label="Username"
          debounce="50"
          @input="this.verifyUniqueUsername"
          lazy-rules
          :rules="[(val => val && val.length > 0 || 'Please enter a username'), (val => this.isUniqueUsername || 'This username is already taken')
          ]"
        />

        <q-input
          clearable
          filled
          v-model="account.password"
          label="Password"
          type="password"
          lazy-rules
          :rules="[ val => val && val.length > 0 || 'Please enter a password']"
        />

        <q-input
          clearable
          filled
          v-model="verifyPass"
          label="Repeat Password"
          type="password"
          lazy-rules
          :rules="[ (val => val && val.length > 0 || 'Please enter a password'),
          (val => val && val == account.password || 'Passwords do not match')]"
        />

        <div>
          <q-btn label="Submit" type="submit" color="primary" />
          <q-btn label="Reset" type="reset" color="primary" flat class="q-ml-sm" />
        </div>
      </q-form>
    </div>
  </div>
</template>
 <script>
export default {
  data() {
    return {
      verifyPass: "",
      isUniqueUsername: false,
      account: {}
    };
  },
  methods: {
    verifyUniqueUsername(val) {
      console.log("running");
      let uri = "http://localhost:4000/accounts/checkUniqueUsername";
      this.axios.post(uri, { username: val }).then(res => {
        this.isUniqueUsername = res.data.result;
        this.$refs.username.validate()
      });
    },
    createAccount() {
      let uri = "http://localhost:4000/accounts/";
      this.axios.post(uri, this.account).then(() => {
        this.$router.push({ name: "list" }); // change later, push to home page of account
      });
    },
    onReset() {
      this.account = {};
    }
  }
};
</script>