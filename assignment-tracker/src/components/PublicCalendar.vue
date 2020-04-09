<!-- to install calendar: https://www.npmjs.com/package/@quasar/quasar-app-extension-qcalendar -->
<template>
  <div>
    <div v-if="loggedIn()" style="max-width: 800px; width: 100%;">
      <q-dialog v-model="displayEvent">
        <div>
          <q-card v-if="event">
            <q-toolbar
              :class="displayClasses(event)"
              :style="displayStyles(event)"
              style="min-width: 400px;"
            >
              <q-toolbar-title>{{ event.name }}</q-toolbar-title>
              <q-btn
                flat
                round
                color="white"
                icon="delete"
                v-close-popup
                @click="deleteEvent(event)"
              ></q-btn>
              <q-btn flat round color="white" icon="edit" v-close-popup @click="editEvent(event)"></q-btn>
              <q-btn flat round color="white" icon="close" v-close-popup></q-btn>
            </q-toolbar>
            <q-card-section class="inset-shadow">
              {{ event.details }}
              <div class="row full-width justify-start" style="padding-top: 12px;">
                <div class="col-12">
                  <div class="row full-width justify-start">
                    <div class="col-5" style="padding-left: 20px;">
                      <strong>Course</strong>
                    </div>
                    <div class="col-7">{{ event.course }}</div>
                  </div>
                  <div class="row full-width justify-start">
                    <div class="col-5" style="padding-left: 20px;">
                      <strong>Assignment Type</strong>
                    </div>
                    <div class="col-7">{{ event.type }}</div>
                  </div>
                  <div class="row full-width justify-start">
                    <div class="col-5" style="padding-left: 20px;">
                      <strong>Due Date:</strong>
                    </div>
                    <div class="col-7">{{ event.dueDate }}</div>
                  </div>
                </div>
              </div>
            </q-card-section>
            <q-card-actions align="right">
              <q-btn flat label="OK" color="primary" v-close-popup></q-btn>
            </q-card-actions>
          </q-card>
        </div>
      </q-dialog>

      <q-dialog v-model="addEvent" no-backdrop-dismiss>
        <div>
          <q-form v-if="contextDay" ref="event" @submit="onSubmit" @reset="onReset">
            <q-card v-if="addEvent" style="width: 400px;">
              <q-toolbar class="bg-primary text-white">
                <q-toolbar-title>{{ addOrUpdateEvent() }} Event</q-toolbar-title>
                <q-btn flat round color="white" icon="close" v-close-popup></q-btn>
              </q-toolbar>
              <q-card-section class="inset-shadow">
                <q-input
                  v-model="eventForm.name"
                  label="Name"
                  :rules="[v => v && v.length > 0 || 'Field cannot be empty']"
                  autofocus
                />

                <q-input v-model="eventForm.details" label="Details" />
                <q-input v-model="eventForm.course" label="Course" />

                <q-select
                  v-model="eventForm.type"
                  :options="assignmentOptions"
                  label="Assignment Type"
                />

                <q-input
                  clearable
                  v-model="eventForm.dueDate"
                  label="Due Date"
                  mask="date"
                  :rules="[]"
                >
                  <template v-slot:append>
                    <q-icon name="event" class="cursor-pointer">
                      <q-popup-proxy
                        ref="qDateProxy"
                        transition-show="scale"
                        transition-hide="scale"
                      >
                        <q-date v-model="eventForm.dueDate" @input="() => $refs.qDateProxy.hide()" />
                      </q-popup-proxy>
                    </q-icon>
                  </template>
                </q-input>
              </q-card-section>
              <q-card-actions align="right">
                <q-btn flat label="OK" type="submit" color="primary"></q-btn>
                <q-btn flat label="Cancel" type="reset" color="primary" v-close-popup></q-btn>
              </q-card-actions>
            </q-card>
          </q-form>
        </div>
      </q-dialog>

      <div>
        <q-calendar
          ref="calendar"
          class="calendar"
          v-model="selectedDate"
          animated
          transition-prev="slide-right"
          transition-next="slide-left"
          :view="calendarView"
          :hide-header="false"
          @click:interval="addEventMenu"
          @click:time="addEventMenu"
          @click:day="addEventMenu"
          @click:date="addEventMenu"
          day-padding="35px 0 0 0"
        >
          <template #day="{ date }">
            <template v-for="(event, index) in getEvents(date)">
              <q-badge
                :key="index"
                style="width: 100%; cursor: pointer; height: 14px; max-height: 14px"
                :class="badgeClasses(event, 'day')"
                :style="badgeStyles(event, 'day')"
                @click.stop.prevent="showEvent(event)"
                :draggable="true"
                @dragstart.native="(e) => onDragStart(e, event)"
                @dragend.native="(e) => onDragEnd(e, event)"
                @dragenter.native="(e) => onDragEnter(e, event)"
                @touchmove.native="(e) => {}"
              >
                <q-icon v-if="event.icon" :name="event.icon" class="q-mr-xs"></q-icon>
                <span class="ellipsis">{{ event.name }}</span>
              </q-badge>
            </template>
          </template>

          <template #intervals-header="days">
            <div class="fit flex justify-center items-end">
              <span class="q-calendar-daily__interval-text">{{ showOffset(days) }}</span>
            </div>
          </template>
        </q-calendar>
      </div>
    </div>
    <div v-else>
      <span style="font-size:16px">You're not logged in! Log in to view the calendar.</span>
    </div>
  </div>
</template>
<script>
// normally you would not import "all" of QCalendar, but is needed for this example to work with UMD (codepen)
import QCalendar from "@quasar/quasar-ui-qcalendar"; // ui is aliased from '@quasar/quasar-ui-qcalendar'

const formDefault = {
  name: "",
  details: "",
  type: "",
  course: "",
  dueDate: "",
  bgcolor: "#0000FF"
};

const CURRENT_DAY = new Date();

function getCurrentDay(day) {
  const newDay = new Date(CURRENT_DAY);
  newDay.setDate(day);
  const tm = QCalendar.parseDate(newDay);
  return tm.date;
}

export default {
  data() {
    return {
      calendarView: "month",
      selectedDate: "",
      displayEvent: false,
      addEvent: false,
      contextDay: null,
      event: null,

      events: [
        {
          name: "Test 1",
          details: "This is a first test for assignment tracker!",
          dueDate: getCurrentDay(1),
          type: "Homework",
          bgcolor: "#003CB3"
        }
      ],
      eventForm: { ...formDefault },
      assignmentOptions: [
        "Homework",
        "Test",
        "Project",
        "Presentation",
        "Other"
      ]
    };
  },
  mounted() {
    this.getData();
  },
  methods: {
    addEventMenu(day) {
      this.resetForm();
      this.contextDay = { ...day };
      this.eventForm.dueDate = QCalendar.getDateTime(day);
      this.eventForm.type = "";
      this.eventForm.bgcolor = "#0000FF"; // starting color
      this.addEvent = true; // show dialog
    },

    addOrUpdateEvent() {
      if (this.contextDay && this.contextDay.bgcolor) {
        return "Update";
      }
      return "Add";
    },

    eventsMap() {
      const map = {};
      this.events.forEach(event =>
        (map[event.date] = map[event.date] || []).push(event)
      );
      return map;
    },

    onSubmit() {
      this.saveEvent();
      console.log("submitted");
      console.log(this.events);
    },

    showEvent(event) {
      if (this.calendarView.indexOf("agenda") < 0) {
        this.event = event;
        this.displayEvent = true;
      }
    },

    displayClasses(event) {
      return {
        [`bg-${event.bgcolor}`]: false,
        "text-white": false
      };
    },

    displayStyles(event) {
      const s = {};
      s["background-color"] = event.bgcolor;
      s.color = "white";
      return s;
    },

    saveEvent() {
      const self = this;
      this.$refs.event.validate().then(success => {
        if (success) {
          // close the dialog
          self.addEvent = false;
          const form = { ...self.eventForm };
          let update = false;
          if (self.contextDay.bgcolor) {
            console.log("updating");
            update = true;
          } else {
            console.log("adding");
          }
          const data = {
            name: form.name,
            details: form.details,
            type: form.type,
            course: form.course,
            bgcolor: "#003CB3",
            dueDate: String(form.dueDate).replace(/\//g, "-")
          };
          if (update) {
            // send assignment update request to server
            var id = this.event._id;
            console.log(id);
            let uri = "http://localhost:4000/assignments/" + id;
            this.axios
              .patch(uri, data, {
                headers: {
                  Authorization: "Bearer " + sessionStorage.getItem("token")
                }
              })
              .then(res => {
                console.log(res);
                this.getData();
              })
              .catch(err => {
                console.log(err);
              });
          } else {
            // send assignment update to server
            let uri = "http://localhost:4000/assignments/add";
            this.axios
              .post(uri, data, {
                headers: {
                  Authorization: "Bearer " + sessionStorage.getItem("token")
                }
              })
              .then(res => {
                console.log(res);
                this.getData();
              })
              .catch(err => {
                console.log(err);
              });
          }

          console.log(self.events);
          self.contextDay = null;
        }
      });
    },
    getData() {
      console.log("fetching new data...");
      let uri = "http://localhost:4000/assignments"; // make web service call
      this.axios
        .get(uri, {
          headers: {
            Authorization: "Bearer " + sessionStorage.getItem("token")
          }
        })
        .then(response => {
          this.events = response.data; // grab events
          for (var i = 0; i < this.events.length; i++) {
            this.events[i].dueDate = this.events[i].dueDate.split("T")[0];
            this.events[i].bgcolor = "#003CB3";
          }
        })
        .catch(err => {
          if (err.response.status == 403) console.log("not logged in");
        });
    },

    onReset() {
      console.log("reset");
    },

    resetForm() {
      this.eventForm.bgcolor = formDefault.bgcolor;
      this.eventForm.type = formDefault.type;
      this.eventForm.name = formDefault.name;
      this.eventForm.course = formDefault.course;
      this.eventForm.details = formDefault.details;
      this.eventForm.dueDate = formDefault.dueDate;
    },

    isCssColor(color) {
      return !!color && !!color.match(/^(#|(rgb|hsl)a?\()/);
    },

    badgeClasses(infoEvent, type) {
      var color = infoEvent.bgcolor;
      const cssColor = !!color && !!color.match(/^(#|(rgb|hsl)a?\()/);
      const isHeader = type === "header";
      return {
        [`text-white bg-${color}`]: !cssColor,
        "full-width":
          !isHeader && (!infoEvent.side || infoEvent.side === "full"),
        "left-side": !isHeader && infoEvent.side === "left",
        "right-side": !isHeader && infoEvent.side === "right",
        "cursor-pointer": infoEvent.event !== void 0,
        "event-void": infoEvent.event === void 0 // height: 0, padding: 0
      };
    },

    badgeStyles(infoEvent, type, weekLength, timeStartPos, timeDurationHeight) {
      const s = {};
      s["background-color"] = infoEvent.bgcolor;
      if (timeStartPos) {
        s.top = timeStartPos(infoEvent.event.time) + "px";
      }
      if (timeDurationHeight) {
        s.height = timeDurationHeight(infoEvent.event.duration) + "px";
      }
      if (infoEvent.size !== void 0) {
        s.width = (100 / weekLength) * infoEvent.size + "% !important";
      }
      // s['align-items'] = 'flex-start'
      return s;
    },

    getEvents(dt) {
      const currentDate = QCalendar.parseTimestamp(dt);
      var eventsOnDate = [];
      for (var i = 0; i < this.events.length; ++i) {
        if (this.events[i].dueDate == dt) {
          eventsOnDate.push(this.events[i]);
        }
      }
      if (currentDate != null) return eventsOnDate;
      else return eventsOnDate;
    },
    editEvent(event) {
      this.resetForm();
      this.contextDay = { ...event };
      this.eventForm.bgcolor = event.bgcolor;
      this.eventForm.type = event.type;
      this.eventForm.name = event.name;
      this.eventForm.details = event.details;
      this.eventForm.dueDate = event.dueDate;
      this.addEvent = true; // show dialog
    },
    deleteEvent(event) {
      var id = event._id;
      console.log(id);
      let uri = "http://localhost:4000/assignments/" + id;
      this.axios
        .delete(uri, {
          headers: {
            Authorization: "Bearer " + sessionStorage.getItem("token")
          }
        })
        .then(res => {
          console.log(res);
          this.getData();
        })
        .catch(err => {
          console.log(err);
        });
    },
    findEventIndex(event) {
      for (let i = 0; i < this.events.length; ++i) {
        if (event.id === this.events[i].id) {
          return i;
        }
      }
    },

    insertEvent(events, weekLength, infoWeek, index, availableDays, level) {
      const iEvent = infoWeek[index];
      if (iEvent !== void 0 && iEvent.left >= availableDays) {
        // If you have space available, more events are placed
        if (iEvent.left - availableDays) {
          // It is filled with empty events
          events.push({ size: iEvent.left - availableDays });
        }
        // The event is built
        events.push({ size: iEvent.size, event: iEvent.event });

        if (level !== 0) {
          // If it goes into recursion, then the item is deleted
          infoWeek.splice(index, 1);
        }

        const currentAvailableDays = iEvent.left + iEvent.size;

        if (currentAvailableDays < weekLength) {
          const indexNextEvent = QCalendar.indexOf(
            infoWeek,
            e => e.id !== iEvent.id && e.left >= currentAvailableDays
          );

          this.insertEvent(
            events,
            weekLength,
            infoWeek,
            indexNextEvent !== -1 ? indexNextEvent : index,
            currentAvailableDays,
            level + 1
          );
        } // else: There are no more days available, end of iteration
      } else {
        events.push({ size: weekLength - availableDays });
        // end of iteration
      }
    },

    isBetweenDates(date, start, end) {
      return date >= start && date <= end;
    },

    isBetweenDatesWeek(dateStart, dateEnd, weekStart, weekEnd) {
      return (
        (dateEnd < weekEnd && dateEnd >= weekStart) ||
        dateEnd === weekEnd ||
        (dateEnd > weekEnd && dateStart <= weekEnd)
      );
    },
    loggedIn() {
      let data = sessionStorage.getItem("token");
      return data != null;
    }
  }
};
</script>