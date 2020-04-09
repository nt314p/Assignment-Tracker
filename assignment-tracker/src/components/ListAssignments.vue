<template>
  <div>
    <div v-if="loggedIn()" class="q-pa-md">
      <q-table
        :data="data"
        :columns="columns"
        row-key="name"
        :separator="separator"
        @row-click="onRowClick"
      >
        <template v-slot:no-data="{ icon, message, filter }">
          <div class="full-width row flex-center text-accent q-gutter-sm">
            <q-icon size="2em" name="sentiment_dissatisfied" />
            <span>No assignments were found.</span>
            <q-icon size="2em" :name="filter ? 'filter_b_and_w' : icon" />
          </div>
        </template>
      </q-table>
    </div>
    <div v-else>
      <span style="font-size:16px">You're not logged in! Log in to view assignments.</span>
    </div>
  </div>
</template>
 <script>
export default {
  data() {
    return {
      separator: "horizontal",
      data: [],
      columns: [
        { name: "name", label: "Name", field: "name", sortable: true },
        {
          name: "type",
          label: "Assignment Type",
          field: "type",
          sortable: true
        },
        { name: "course", label: "Course", field: "course", sortable: true },
        { name: "dueDate", label: "Due Date", field: "dueDate", sortable: true }
      ]
    };
  },
  mounted() {
    let uri = "http://localhost:4000/assignments"; // make web service call
    this.axios
      .get(uri, {
        headers: { Authorization: "Bearer " + sessionStorage.getItem("token") }
      })
      .then(response => {
        this.data = response.data; // grab contacts
        for (var i = 0; i < this.data.length; i++) {
          this.data[i].dueDate = this.data[i].dueDate.split("T")[0];
        }
      })
      .catch(err => {
        if (err.response.status == 403) console.log("not logged in");
      });
  },
  methods: {
    onRowClick(e, row) {
      this.$router.push({ name: "view", params: { id: row._id } });
    },
    loggedIn() {
      let data = sessionStorage.getItem("token");
      return data != null;
    }
  }
};
</script>