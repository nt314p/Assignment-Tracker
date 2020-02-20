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
          clearable
          filled
          v-model="account.username"
          label="Username"
          lazy-rules
          :rules="[ val => val && val.length > 0 || 'Please enter a username']"
        />       

        <q-input
          clearable
          filled
          v-model="account.password"
          label="Password"
          lazy-rules
          :rules="[ val => val && val.length > 0 || 'Please enter a password']"
        />

        <!--<q-input
          clearable
          filled
          v-model="contact.phoneNumber"
          label="Phone Number"
          type="tel"
          mask="phone"
          unmasked-value
          lazy-rules
          :rules="[]"
        />-->
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
      account: {}
    };
  },
  methods: {
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