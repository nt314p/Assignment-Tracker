<template>
  <div>
    <div class="q-pa-md">
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
  </div>
</template>
 <script>
export default {
  data() {
    return {
      separator: "horizontal",
      data: [],
      columns: [
        { name: "name", label: "Name", field: "name" },
        { name: "type", label: "Assignment Type", field: "type" },
        { name: "course", label: "Course", field: "course" },
        { name: "dueDate", label: "Due Date", field: "dueDate" },
      ]
    };
  },
  created() {
    // function called once vue has been created
    let uri = "http://localhost:4000/assignments"; // make web service call
    this.axios.get(uri, {headers:{"Authorization": "Bearer " + sessionStorage.getItem("token")}}).then(response => {
      this.data = response.data; // grab contacts
      for (var i = 0; i < this.data.length; i++) {
        this.data[i].dueDate = this.data[i].dueDate.split("T")[0];
      }
    });
  },
  methods: {
    onRowClick(e, row) {
      this.$router.push({ name: "view", params: { id: row._id } });
    }
  }
};
</script>