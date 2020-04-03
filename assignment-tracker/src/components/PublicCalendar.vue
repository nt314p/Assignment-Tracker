<!-- to install calendar: https://www.npmjs.com/package/@quasar/quasar-app-extension-qcalendar -->
<template>
  <div style="max-width: 800px; width: 100%;">
    <q-dialog v-model="displayEvent">
      <div>
        <q-card v-if="event">
          <q-toolbar
            :class="displayClasses(event)"
            :style="displayStyles(event)"
            style="min-width: 400px;"
          >
            <q-toolbar-title>{{ event.title }}</q-toolbar-title>
            <q-btn flat round color="white" icon="delete" v-close-popup @click="deleteEvent(event)"></q-btn>
            <q-btn flat round color="white" icon="edit" v-close-popup @click="editEvent(event)"></q-btn>
            <q-btn flat round color="white" icon="close" v-close-popup></q-btn>
          </q-toolbar>
          <q-card-section class="inset-shadow">
            {{ event.details }}
            <div class="row full-width justify-start" style="padding-top: 12px;">
              <div class="col-12">
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
                v-model="eventForm.title"
                label="Title"
                :rules="[v => v && v.length > 0 || 'Field cannot be empty']"
                autofocus
              />
              <q-input v-model="eventForm.details" label="Details" />

              <q-select
                v-model="eventForm.type"
                :options="assignmentOptions"
                label="Assignment Type"
              />

              <q-input
                clearable
                filled
                v-model="eventForm.dueDate"
                label="Due Date"
                mask="date"
                :rules="[]"
              >
                <template v-slot:append>
                  <q-icon name="event" class="cursor-pointer">
                    <q-popup-proxy ref="qDateProxy" transition-show="scale" transition-hide="scale">
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
          <template v-if="calendarView.indexOf('agenda') < 0">
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
                <span class="ellipsis">{{ event.title }}</span>
              </q-badge>
            </template>
          </template>
        </template>

        <template #day-header="{ date }">
          <div v-if="calendarView.indexOf('agenda') < 0" class="row justify-center">
            <template v-for="(event, index) in eventsMap[date]">
              <q-badge
                v-if="!event.time"
                :key="index"
                style="width: 100%; cursor: pointer; height: 14px; max-height: 14px"
                :class="badgeClasses(event, 'header')"
                :style="badgeStyles(event, 'header')"
                @click.stop.prevent="showEvent(event)"
                :draggable="true"
                @dragstart.native="(e) => onDragStart(e, event)"
                @dragend.native="(e) => onDragEnd(e, event)"
                @dragenter.native="(e) => onDragEnter(e, event)"
                @touchmove.native="(e) => {}"
              >
                <q-icon v-if="event.icon" :name="event.icon" class="q-mr-xs"></q-icon>
                <span class="ellipsis">{{ event.title }}</span>
              </q-badge>
              <q-badge
                v-else
                :key="index"
                class="q-ma-xs self-end"
                :class="badgeClasses(event, 'header')"
                :style="badgeStyles(event, 'header')"
                style="width: 10px; max-width: 10px; height: 10px; max-height: 10px"
              />
            </template>
          </div>
        </template>

        <template #day-body="data">
          <template v-if="calendarView.indexOf('agenda') < 0">
            <template v-for="(event, index) in getEvents(data.date)">
              <q-badge
                v-if="event.time"
                :key="index"
                class="my-event justify-center"
                :class="badgeClasses(event, 'body')"
                :style="badgeStyles(event, 'body', data.timeStartPos, data.timeDurationHeight)"
                @click.stop.prevent="showEvent(event)"
                :draggable="true"
                @dragstart.native="(e) => onDragStart(e, event)"
                @dragend.native="(e) => onDragEnd(e, event)"
                @dragenter.native="(e) => onDragEnter(e, event)"
                @touchmove.native="(e) => {}"
              >
                <q-icon v-if="event.icon" :name="event.icon" class="q-mr-xs"></q-icon>
                <span class="ellipsis">{{ event.title }}</span>
              </q-badge>
            </template>
          </template>
        </template>

        <template #intervals-header="days">
          <div class="fit flex justify-center items-end">
            <span class="q-calendar-daily__interval-text">{{ showOffset(days) }}</span>
          </div>
        </template>
      </q-calendar>
    </div>

    <!--<q-calendar
      v-model="selectedDate"
      view="month"
      locale="en-us"
      :day-height="100"
      @click:date="addEventMenu"
      @mouseup="addEventMenu"
    >-->

    <!--@click:time="addEventMenu"
    @click:week="addEventMenu"-->
    <!--
      <template #week="{ week, weekdays, miniMode }">
        <template v-if="!miniMode">
          <template v-for="(computedEvent, index) in getWeekEvents(week, weekdays)">
            <q-badge
              :key="index"
              class="q-row-event"
              :class="badgeClasses(computedEvent, 'day')"
              :style="badgeStyles(computedEvent, 'day', week.length)"
            >
              <template v-if="computedEvent.event">
                <q-icon :name="computedEvent.event.icon" class="q-mr-xs"></q-icon>
                <span class="ellipsis">{{ computedEvent.event.title }}</span>
              </template>
            </q-badge>
          </template>
        </template>
    </template>-->
    <!--</q-calendar>-->
  </div>
</template>
<script>
// normally you would not import "all" of QCalendar, but is needed for this example to work with UMD (codepen)
import QCalendar from "@quasar/quasar-ui-qcalendar"; // ui is aliased from '@quasar/quasar-ui-qcalendar'

const formDefault = {
  title: "",
  details: "",
  type: "",
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
      /*events: [
        {
          title: "1st of the Month",
          color: "orange",
          start: getCurrentDay(1),
          end: getCurrentDay(1)
        },
        {
          title: "Sisters Birthday",
          color: "green",
          start: getCurrentDay(4),
          end: getCurrentDay(4),
          icon: "cake"
        },
        {
          title: "Meeting",
          color: "red",
          start: getCurrentDay(8),
          end: getCurrentDay(8),
          icon: "group"
        },
        {
          title: "Lunch",
          color: "teal",
          start: getCurrentDay(8),
          end: getCurrentDay(8),
          icon: "free_breakfast"
        },
        {
          title: "Visit Mom",
          color: "blue-grey",
          start: getCurrentDay(20),
          end: getCurrentDay(20),
          icon: "card_giftcard"
        },
        {
          title: "Conference",
          color: "blue",
          start: getCurrentDay(22),
          end: getCurrentDay(22),
          icon: "ondemand_video"
        },
        {
          title: "Girlfriend",
          color: "teal",
          start: getCurrentDay(22),
          end: getCurrentDay(22),
          icon: "fastfood"
        },
        {
          title: "Rowing",
          color: "purple",
          start: getCurrentDay(27),
          end: getCurrentDay(28),
          icon: "rowing"
        },
        {
          title: "Vacation",
          color: "purple",
          start: getCurrentDay(22),
          end: getCurrentDay(29),
          icon: "flight"
        }
      ],*/
      events: [
        {
          title: "Test 1",
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
            // an update
            update = true;
          } else {
            // an add
          }
          const data = {
            title: form.title,
            details: form.details,
            icon: form.icon,
            bgcolor: form.bgcolor,
            dueDate: String(form.dateTimeStart)
              .slice(0, 10)
              .replace(/\//g, "-")
          };
          if (update === true) {
            const index = self.findEventIndex(self.contextDay);
            if (index >= 0) {
              self.events.splice(index, 1, { ...data });
            }
          } else {
            // add to events array
            self.events.push(data);
          }
          self.contextDay = null;
        }
      });
    },

    onReset() {
      console.log("reset");
    },

    resetForm() {
      this.eventForm = formDefault;
    },

    isCssColor(color) {
      return !!color && !!color.match(/^(#|(rgb|hsl)a?\()/);
    },

    badgeClasses(infoEvent, type) {
      var color = infoEvent.bgcolor;
      console.log("color is " + color);
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
      // const events = []
      // for (let i = 0; i < this.events.length; ++i) {
      //   let added = false
      //   const event = this.events[i]
      //   if (event.date === dt) {
      //     if (event.time !== void 0) {
      //       if (events.length > 0) {
      //         // check for overlapping times
      //         const startTime = QCalendar.parseTimestamp(event.date + ' ' + event.time)
      //         const endTime = QCalendar.addToDate(startTime, { minute: event.duration })
      //         for (let j = 0; j < events.length; ++j) {
      //           const evt = events[j]
      //           if (evt.time !== void 0) {
      //             const startTime2 = QCalendar.parseTimestamp(evt.date + ' ' + evt.time)
      //             const endTime2 = QCalendar.addToDate(startTime2, { minute: evt.duration })
      //             if (QCalendar.isBetweenDates(startTime, startTime2, endTime2) || QCalendar.isBetweenDates(endTime, startTime2, endTime2)) {
      //               evt.side = 'left'
      //               event.side = 'right'
      //               events.push(event)
      //               added = true
      //               break
      //             }
      //           }
      //         }
      //       }
      //     }
      //     if (!added) {
      //       event.side = void 0
      //       events.push(event)
      //     }
      //   } else if (event.days) {
      //     // check for overlapping dates
      //     const startDate = QCalendar.parseTimestamp(event.date)
      //     const endDate = QCalendar.addToDate(startDate, { day: event.days })
      //     if (QCalendar.isBetweenDates(currentDate, startDate, endDate)) {
      //       events.push(event)
      //       added = true
      //     }
      //   }
      // }
      // return events
    },
    editEvent(event) {
      this.resetForm();
      this.contextDay = { ...event };
      let timestamp;
      if (event.time) {
        timestamp = QCalendar.parseTimestamp(event.date + " " + event.time);
        const endTime = QCalendar.addToDate(timestamp, {
          minute: event.duration
        });
        this.eventForm.dateTimeEnd = QCalendar.getDateTime(endTime);
      } else {
        timestamp = QCalendar.parseTimestamp(this.contextDay.date + " 00:00");
      }
      this.eventForm.dateTimeStart = QCalendar.getDateTime(timestamp);
      this.eventForm.allDay = !event.time;
      this.eventForm.bgcolor = event.bgcolor;
      this.eventForm.icon = event.icon;
      this.eventForm.title = event.title;
      this.eventForm.details = event.details;
      this.addEvent = true; // show dialog
    },
    deleteEvent(event) {
      const index = this.findEventIndex(event);
      if (index >= 0) {
        this.events.splice(index, 1);
      }
    },
    findEventIndex(event) {
      for (let i = 0; i < this.events.length; ++i) {
        if (
          event.title === this.events[i].title &&
          event.details === this.events[i].details &&
          event.date === this.events[i].date
        ) {
          return i;
        }
      }
    },

    // getWeekEvents(week /*, weekdays*/) {
    //   const tsFirstDay = QCalendar.parsed(week[0].date + " 00:00");
    //   const tsLastDay = QCalendar.parsed(week[week.length - 1].date + " 23:59");
    //   const firstDay = QCalendar.getDayIdentifier(tsFirstDay);
    //   const lastDay = QCalendar.getDayIdentifier(tsLastDay);

    //   const eventsWeek = [];
    //   this.events.forEach((event, id) => {
    //     const tsStartDate = QCalendar.parsed(event.start + " 00:00");
    //     const tsEndDate = QCalendar.parsed(event.end + " 23:59");
    //     const startDate = QCalendar.getDayIdentifier(tsStartDate);
    //     const endDate = QCalendar.getDayIdentifier(tsEndDate);

    //     if (this.isBetweenDatesWeek(startDate, endDate, firstDay, lastDay)) {
    //       const left = QCalendar.daysBetween(tsFirstDay, tsStartDate, true);
    //       const right = QCalendar.daysBetween(tsEndDate, tsLastDay, true);

    //       eventsWeek.push({
    //         id, // index event
    //         left, // Position initial day [0-6]
    //         right, // Number days available
    //         size: week.length - (left + right), // Size current event (in days)
    //         event // Info
    //       });
    //     }
    //   });

    //   const events = [];
    //   if (eventsWeek.length > 0) {
    //     const infoWeek = eventsWeek.sort((a, b) => a.left - b.left);
    //     infoWeek.forEach((event, i) => {
    //       this.insertEvent(events, week.length, infoWeek, i, 0, 0);
    //     });
    //   }

    //   return events;
    // },

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
    }
  }
};
</script>