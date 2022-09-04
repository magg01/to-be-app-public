import * as SQLite from 'expo-sqlite';

const DEBUG = false;

let db;

const setUpDatabase = () => {
  db = SQLite.openDatabase('tobedb', '0.0.3');
  // default setting for sqlite is that foreign key constraints are not enforced.
  // So we need to turn the constraint enforcement on manually.
  db.exec([{ sql: 'PRAGMA foreign_keys = ON;', args: [] }], false, () => console.log('Foreign keys turned on'));
}

const setUpTables = () => {
  if (DEBUG) {
    // reset the tables on each reload
    db.transaction(
      (tx) => {
        tx.executeSql(
          'drop table if exists calevents',
        );
        tx.executeSql(
          'drop table if exists plans',
        );
        tx.executeSql(
          'drop table if exists tobeitems',
        );
        tx.executeSql(
          'drop table if exists repeaters',
        );
      },
    );
  }
  db.transaction(
    (tx) => {
      tx.executeSql(
        'create table if not exists tobeitems (id integer primary key not null, done int, title text, imageBackgroundUri text, tintColor text);',
      );
      tx.executeSql(
        'create table if not exists plans (id integer primary key not null, done int, title text, description text NOT NULL DEFAULT "", tobeitem integer not null, FOREIGN KEY(tobeitem) REFERENCES tobeitems(id) on delete cascade);',
      );
      tx.executeSql(
        'create table if not exists repeaters (id integer primary key not null, lastdonedatetime string, periodicity string, enddate string, notificationId string, shouldshowincalendar integer, calstarttime string, calendtime string, calday integer, caldate integer, plan integer not null, FOREIGN KEY(plan) REFERENCES plans(id) on delete cascade);',
      );
      tx.executeSql(
        'create table if not exists calevents (id integer primary key not null, eventdate string, eventstarttime string, eventendtime string, eventnotification string, planitem integer not null, FOREIGN KEY(planitem) REFERENCES plans(id) on delete cascade);',
      );
    },
    (e) => console.log(`setUpTables encountered an error -> ${e}`),
    () => console.log('setUpTables: success'),
  );
};

const addToBeItem = (title, imageBackgroundUri, tintColor) => {
  db.transaction(
    (tx) => {
      tx.executeSql('insert into tobeitems (done, title, imageBackgroundUri, tintColor) values (0, ?, ?, ?)', [title, imageBackgroundUri, tintColor]);
    },
    (e) => console.log(`addToBeItem encountered an error -> ${e}`),
    () => console.log(`addToBeItem: item with title:${title} successfully added to tobeitems table`),
  );
};

const addPlan = (title, tobeitem, calEvent) => new Promise((resolve, reject) => {
  db.transaction(
    (tx) => {
      tx.executeSql(
        'insert into plans (done, title, tobeitem) values (0, ?, ?)',
        [title, tobeitem],
        (tx, newPlan) => {
          if (calEvent) {
            tx.executeSql('insert into calevents (eventdate, eventstarttime, eventendtime, planitem) values (?, ?, ?, ?)', [calEvent.date, calEvent.start, calEvent.end, newPlan.insertId]);
          }
        },
      );
    },
    (e) => {
      console.log(`addPlan encountered an error -> ${e}`);
      reject(false);
    },
    () => {
      console.log(`addPlan: item with title:${title} successfully added to plans table`);
      resolve(true);
    },
  );
});

const addCalEvent = (date, startTime, endTime, planItem) => new Promise((resolve, reject) => {
  db.transaction(
    (tx) => {
      tx.executeSql('insert into calevents (eventdate, eventstarttime, eventendtime, planitem) values (?, ?, ?, ?)', [date, startTime, endTime, planItem]);
    },
    (e) => {
      console.log(`addCalEvent encountered an error -> ${e}`);
      reject(false);
    },
    () => {
      console.log(`addCalEvent: item with date:${date} successfully added to calevents table`);
      resolve(true);
    },
  );
});

const getToBeItemById = (id) => new Promise((resolve, reject) => {
  let result;
  db.readTransaction(
    (tx) => {
      tx.executeSql(
        'select * from tobeitems where id=?',
        [id],
        (_, { rows: { _array } }) => {
          // console.log(`getToBeItemById: _array is ${JSON.stringify(_array, null, 1)}`);
          result = _array[0];
        },
      );
    },
    (e) => {
      console.log(`getToBeItemById encountered an error -> ${e}`);
      reject(e);
    },
    () => resolve(result),
  );
});

const getPreviousToBeItemIdById = (id) => new Promise((resolve, reject) => {
  let result;
  db.readTransaction(
    (tx) => {
      tx.executeSql(
        'select * from tobeitems where id < ? order by id desc limit 1',
        [id],
        (_, { rows: { _array } }) => {
          console.log(`getPreviousToBeItemIdById: _array is ${JSON.stringify(_array, null, 1)}`);
          if (_array.length === 0) {
            getLastToBeItem().then((lastToBeItem) => {
              result = lastToBeItem.id;
              console.log(`getPreviousToBeItemIdById: result = ${result}`);
              resolve(result);
            });
          } else {
            result = _array[0].id;
            console.log(`getPreviousToBeItemIdById: result = ${result}`);
            resolve(result);
          }
        },
      );
    },
    (e) => {
      console.log(`getPreviousToBeItemIdById encountered an error -> ${e}`);
      reject(e);
    },
    console.log('getPreviousToBeItemIdById transaction success'),
  );
});

const getCalEventWithPlanDetailsByCalEventId = (calEventId) => new Promise((resolve, reject) => {
  let result;
  db.readTransaction(
    (tx) => {
      tx.executeSql(
        'SELECT C.id, C.eventdate, C.eventstarttime, C.eventendtime, C.eventnotification, P.title as plan_title, T.title as tobeitem_title, T.imageBackgroundUri from calevents C left join plans P ON C.planitem = P.id left join tobeitems T ON P.tobeitem = T.id where c.id = ?;',
        [calEventId],
        (_, { rows: { _array } }) => {
          console.log(`getCalEventWithPlanDetailsByCalEventId: _array is ${JSON.stringify(_array, null, 1)}`);
          result = _array[0];
        },
      );
    },
    (e) => {
      console.log(`getCalEventWithPlanDetailsByCalEventId encountered an error -> ${e}`);
      reject(e);
    },
    () => resolve(result),
  );
});

const getAllCalEventsWithPlanDetails = () => new Promise((resolve, reject) => {
  let result;
  db.readTransaction(
    (tx) => {
      tx.executeSql(
        'SELECT C.id, C.eventdate, C.eventstarttime, C.eventendtime, C.eventnotification, P.title as plan_title, T.title as tobeitem_title from calevents C left join plans P ON C.planitem = P.id left join tobeitems T ON P.tobeitem = T.id;',
        [],
        (_, { rows: { _array } }) => {
          console.log(`getCalEventWithPlanDetailsByCalEventId: _array is ${JSON.stringify(_array, null, 1)}`);
          result = _array;
        },
      );
    },
    (e) => {
      console.log(`getCalEventWithPlanDetailsByCalEventId encountered an error -> ${e}`);
      reject(e);
    },
    () => resolve(result),
  );
});

const getRepeaterEventWithPlanDetailsByRepeaterId = (repeaterId) => new Promise((resolve, reject) => {
  let result;
  db.readTransaction(
    (tx) => {
      tx.executeSql(
        'SELECT R.id, R.periodicity, R.calstarttime, R.calendtime, R.calday, R.caldate, R.notificationId, P.title as plan_title, T.title as tobeitem_title from repeaters R left join plans P ON R.plan = P.id left join tobeitems T ON P.tobeitem = T.id where R.id = ?;',
        [repeaterId],
        (_, { rows: { _array } }) => {
          console.log(`getRepeaterEventWithPlanDetailsByRepeaterId: _array is ${JSON.stringify(_array, null, 1)}`);
          result = _array[0];
        },
      );
    },
    (e) => {
      console.log(`getRepeaterEventWithPlanDetailsByRepeaterId encountered an error -> ${e}`);
      reject(e);
    },
    () => resolve(result),
  );
});

const getAllRepeaterEventsWithPlanDetails = () => new Promise((resolve, reject) => {
  let result;
  db.readTransaction(
    (tx) => {
      tx.executeSql(
        'SELECT R.id, R.periodicity, R.calstarttime, R.calendtime, R.calday, R.caldate, R.notificationId, R.enddate, P.title as plan_title, T.title as tobeitem_title from repeaters R left join plans P ON R.plan = P.id left join tobeitems T ON P.tobeitem = T.id where R.shouldshowincalendar = 1',
        [],
        (_, { rows: { _array } }) => {
          console.log(`getAllRepeaterEventsWithPlanDetails: _array is ${JSON.stringify(_array, null, 1)}`);
          result = _array;
        },
      );
    },
    (e) => {
      console.log(`getAllRepeaterEventsWithPlanDetails encountered an error -> ${e}`);
      reject(e);
    },
    () => resolve(result),
  );
});

const getNextToBeItemIdById = (id) => new Promise((resolve, reject) => {
  let result;
  db.readTransaction(
    (tx) => {
      tx.executeSql(
        'select * from tobeitems where id > ? order by id limit 1',
        [id],
        (_, { rows: { _array } }) => {
          console.log(`getNextToBeItemIdById: _array is ${JSON.stringify(_array, null, 1)}`);
          if (_array.length === 0) {
            getFirstToBeItem().then((firstToBeItem) => {
              result = firstToBeItem.id;
              console.log(`getNextToBeItemIdById: result = ${result}`);
              resolve(result);
            });
          } else {
            result = _array[0].id;
            console.log(`getNextToBeItemIdById: result = ${result}`);
            resolve(result);
          }
        },
      );
    },
    (e) => {
      console.log(`getNextToBeItemIdById encountered an error -> ${e}`);
      reject(e);
    },
    console.log('getNextToBeItemIdById transaction success'),
  );
});

const getFirstToBeItem = () => new Promise((resolve, reject) => {
  let result;
  db.readTransaction(
    (tx) => {
      tx.executeSql(
        'select * from tobeitems order by id limit 1',
        [],
        (_, { rows: { _array } }) => {
          result = _array[0];
          console.log(`getFirstToBeItem: result = ${JSON.stringify(result, null, 1)}`);
        },
      );
    },
    (e) => {
      console.log(`getFirstToBeItem encountered an error -> ${e}`);
      reject(e);
    },
    () => resolve(result),
  );
});

const getLastToBeItem = () => new Promise((resolve, reject) => {
  let result;
  db.readTransaction(
    (tx) => {
      tx.executeSql(
        'select * from tobeitems order by id desc limit 1',
        [],
        (_, { rows: { _array } }) => {
          result = _array[0];
          console.log(`getLastToBeItem: result = ${JSON.stringify(result, null, 1)}`);
        },
      );
    },
    (e) => {
      console.log(`getLastToBeItem encountered an error -> ${e}`);
      reject(e);
    },
    () => resolve(result),
  );
});

const getAllToBeItems = () => new Promise((resolve, reject) => {
  let result;
  db.readTransaction(
    (tx) => {
      tx.executeSql(
        'select * from tobeitems;',
        [],
        (_, { rows: { _array } }) => {
          // console.log(`getAllToBeItems: _array is ${JSON.stringify(_array, null, 1)}`);
          result = _array;
        },
      );
    },
    (e) => {
      console.log(`getAllToBeItems encountered an error -> ${e}`);
      reject(e);
    },
    () => resolve(result),
  );
});

const getAllCalEvents = () => new Promise((resolve, reject) => {
  let result;
  db.readTransaction(
    (tx) => {
      tx.executeSql(
        'select * from calevents order by eventstarttime',
        [],
        (_, { rows: { _array } }) => {
          console.log(`getAllCalEvents: _array is ${JSON.stringify(_array, null, 1)}`);
          result = _array;
        },
      );
    },
    (e) => {
      console.log(`getAllCalEvents encountered an error -> ${e}`);
      reject(e);
    },
    () => resolve(result),
  );
});

const getCalEventById = (id) => new Promise((resolve, reject) => {
  let result;
  db.readTransaction(
    (tx) => {
      tx.executeSql(
        'select * from calevents where id=?',
        [id],
        (_, { rows: { _array } }) => {
          console.log(`getCalEventById: _array is ${JSON.stringify(_array, null, 1)}`);
          result = _array[0];
        },
      );
    },
    (e) => {
      console.log(`getCalEventById encountered an error -> ${e}`);
      reject(e);
    },
    () => resolve(result),
  );
});

const deleteToBeItemById = (id) => new Promise((resolve, reject) => {
  db.transaction(
    (tx) => {
      tx.executeSql('delete from tobeitems where id=?', [id]);
    },
    (e) => {
      console.log(`deleteToBeItem encountered an error -> ${e}`);
      reject(false);
    },
    () => {
      console.log(`deleteToBeItem: item with id:${id} successfully deleted from tobeitems table`);
      resolve(true);
    },
  );
});

const deletePlanItemById = (id) => new Promise((resolve, reject) => {
  db.transaction(
    (tx) => {
      tx.executeSql('delete from plans where id=?', [id]);
    },
    (e) => {
      console.log(`deletePlanItemById encountered an error -> ${e}`);
      reject(false);
    },
    () => {
      console.log(`deletePlanItemById: item with id:${id} successfully deleted from plans table`);
      resolve(true);
    },
  );
});

const deleteCalEventById = (id) => new Promise((resolve, reject) => {
  db.transaction(
    (tx) => {
      tx.executeSql('delete from calevents where id = ?', [id]);
    },
    (e) => {
      console.log(`deleteCalEventById encountered an error -> ${e}`);
      reject(false);
    },
    () => {
      console.log(`deleteCalEventById: calEvent with id:${id} successfully deleted from calevents table`);
      resolve(true);
    },
  );
});

const getCalEventNotificationByCalEventId = (id) => new Promise((resolve, reject) => {
  let result;
  db.transaction(
    (tx) => {
      tx.executeSql(
        'SELECT eventnotification from calevents where id = ?',
        [id],
        (_, { rows: { _array } }) => {
          console.log(`getCalEventNotificationById: _array is ${JSON.stringify(_array, null, 1)}`);
          result = _array[0];
        },
      );
    },
    (e) => {
      console.log(`getCalEventNotificationById encountered an error -> ${e}`);
      reject(e);
    },
    () => {
      console.log(`getCalEventNotificationById: successfully retreieved from calevent with id=${id}`);
      resolve(result);
    },
  );
});

const addNotificationToCalEvent = (calEventId, notificationIdentifier) => new Promise((resolve, reject) => {
  let result;
  db.transaction(
    (tx) => {
      tx.executeSql(
        'UPDATE calevents set eventnotification = ? WHERE id = ?',
        [notificationIdentifier, calEventId],
      );
    },
    (e) => {
      console.log(`addNotificationToCalEvent encountered an error -> ${e}`);
      reject(e);
    },
    () => {
      console.log(`addNotificationToCalEvent: notification with identifier ${notificationIdentifier} successfully added to calevent with id=${calEventId}`);
      resolve(result);
    },
  );
});

const addNotificationToRepeater = (repeaterId, notificationIdentifier) => new Promise((resolve, reject) => {
  let result;
  db.transaction(
    (tx) => {
      tx.executeSql(
        'UPDATE repeaters set notificationid = ? WHERE id = ?',
        [notificationIdentifier, repeaterId],
      );
    },
    (e) => {
      console.log(`addNotificationToRepeater encountered an error -> ${e}`);
      reject(e);
    },
    () => {
      console.log(`addNotificationToRepeater: notification with identifier ${notificationIdentifier} successfully added to calevent with id=${repeaterId}`);
      resolve(result);
    },
  );
});

const removeNotificationFromCalEvent = (calEventId) => new Promise((resolve, reject) => {
  db.transaction(
    (tx) => {
      tx.executeSql('UPDATE calevents set eventnotification = null WHERE id = ?', [calEventId]);
    },
    (e) => {
      console.log(`removeNotificationFromCalEvent encountered an error -> ${e}`);
      reject(e);
    },
    () => {
      console.log(`removeNotificationFromCalEvent: calevent with id=${calEventId} eventnotification successfully set to null`);
      resolve(true);
    },
  );
});

const removeNotificationFromRepeaterByRepeaterId = (repeaterId) => new Promise((resolve, reject) => {
  db.transaction(
    (tx) => {
      tx.executeSql('UPDATE repeaters set notificationId = null WHERE id = ?', [repeaterId]);
    },
    (e) => {
      console.log(`removeNotificationFromRepeaterByRepeaterId encountered an error -> ${e}`);
      reject(e);
    },
    () => {
      console.log(`removeNotificationFromRepeaterByRepeaterId: repeater with id=${repeaterId} notificationId successfully set to null`);
      resolve(true);
    },
  );
});

const getAllPlansByToBeId = (id) => new Promise((resolve, reject) => {
  let result;
  db.transaction(
    (tx) => {
      tx.executeSql(
        'select * from plans where tobeitem = ?',
        [id],
        (_, { rows: { _array } }) => {
          console.log(`getAllPlansByToBeId: _array is ${JSON.stringify(_array, null, 1)}`);
          result = _array;
        },
      );
    },
    // transaction failure callback
    (e) => {
      console.log(`getAllPlansByToBeId encountered an error -> ${e}`);
      reject(false);
    },
    // transaction success callback
    () => {
      console.log(`getAllPlansByToBeId: plans for tobeitem id:${id} successfully retreived from plans table`);
      resolve(result);
    },
  );
});

const addRepeater = (repeater) => new Promise((resolve, reject) => {
  db.transaction(
    (tx) => {
      tx.executeSql(
        'insert into repeaters (lastdonedatetime, periodicity, enddate, notificationId, shouldshowincalendar, calstarttime, calendtime, calday, caldate, plan) values (null, ?, ?, null, 0, null, null, null, null, ?)',
        [repeater.periodicity, repeater.endDate, repeater.planId],
      );
    },
    (e) => {
      console.log(`addRepeater encountered an error -> ${e}`);
      reject(false);
    },
    () => {
      console.log('addRepeater: item with successfully added to repeaters table');
      resolve(true);
    },
  );
});

const getRepeatersByToBeIdAndPeriodicity = (toBeId, periodicity) => new Promise((resolve, reject) => {
  let result;
  db.readTransaction(
    (tx) => {
      tx.executeSql(
        'select * from repeaters where periodicity = ? and plan in (select id from plans where tobeitem = ?);',
        [periodicity, toBeId],
        (_, { rows: { _array } }) => {
          console.log(`getRepeatersByToBeIdAndPeriodicity: _array is ${JSON.stringify(_array, null, 1)}`);
          result = _array;
        },
      );
    },
    (e) => {
      console.log(`getRepeatersByToBeIdAndPeriodicity encountered an error -> ${e}`);
      reject(e);
    },
    () => resolve(result),
  );
});

const getAllRepeatersByToBeId = (toBeId) => new Promise((resolve, reject) => {
  let result;
  db.readTransaction(
    (tx) => {
      tx.executeSql(
        'select * from repeaters where plan in (select id from plans where tobeitem = ?);',
        [toBeId],
        (_, { rows: { _array } }) => {
          console.log(`getAllRepeatersByToBeId: _array is ${JSON.stringify(_array, null, 1)}`);
          result = _array;
        },
      );
    },
    (e) => {
      console.log(`getAllRepeatersByToBeId encountered an error -> ${e}`);
      reject(e);
    },
    () => resolve(result),
  );
});

const deleteRepeaterByPlanId = (planId) => new Promise((resolve, reject) => {
  db.transaction(
    (tx) => {
      tx.executeSql('delete from repeaters where plan = ?', [planId]);
    },
    (e) => {
      console.log(`deleteRepeaterByPlanId encountered an error -> ${e}`);
      reject(false);
    },
    () => {
      console.log(`deleteRepeaterByPlanId: item with plan id:${planId} successfully deleted from repeaters table`);
      resolve(true);
    },
  );
});

const getPlansWithRepeaterPeriodicityByToBeId = (toBeId) => new Promise((resolve, reject) => {
  let result;
  db.transaction(
    (tx) => {
      tx.executeSql(
        'select plans.*, repeaters.periodicity from plans left join repeaters on repeaters.plan=plans.id and plans.tobeitem = ?',
        [toBeId],
        (_, { rows: { _array } }) => {
          console.log(`getPlansWithRepeaterPeriodicityByToBeId: _array is ${JSON.stringify(_array, null, 1)}`);
          result = _array;
        },
      );
    },
    // transaction failure callback
    (e) => {
      console.log(`getPlansWithRepeaterPeriodicityByToBeId encountered an error -> ${e}`);
      reject(false);
    },
    // transaction success callback
    () => {
      console.log(`getPlansWithRepeaterPeriodicityByToBeId: plans and repeaters for tobeitem id:${toBeId} successfully retreived.`);
      resolve(result);
    },
  );
});

const getAllPlansWithRepeatersAndCalEventsByToBeId = (toBeId) => new Promise((resolve, reject) => {
  console.log(`getAllPlansWithRepeatersByToBeId: supplied toBeId was: ${toBeId}`);
  let result;
  db.transaction(
    (tx) => {
      tx.executeSql(
        'select plans.id as plan_id, plans.done as plan_done, plans.title as plan_title, plans.description as plan_description, plans.tobeitem as plan_tobeitem, repeaters.id as repeater_id, repeaters.lastdonedatetime as repeater_lastdonedatetime, repeaters.periodicity as repeater_periodicity, repeaters.enddate as repeater_enddate, repeaters.shouldshowincalendar as repeater_shouldshowincalendar, calevents.id as calevent_id from plans plans left join repeaters repeaters on plans.id=repeaters.plan left join calevents calevents on plans.id=calevents.planitem where plans.tobeitem = ? order by plans.done, repeaters.lastdonedatetime',
        [toBeId],
        (_, { rows: { _array } }) => {
          console.log(`getAllPlansWithRepeatersAndCalEventsByToBeId: _array is ${JSON.stringify(_array, null, 1)}`);
          result = _array;
        },
      );
    },
    // transaction failure callback
    (e) => {
      console.log(`getAllPlansWithRepeatersAndCalEventsByToBeId encountered an error -> ${e}`);
      reject(false);
    },
    // transaction success callback
    () => {
      console.log(`getAllPlansWithRepeatersByToBeId: plans and repeaters for tobeitem id:${toBeId} successfully retreived.`);
      resolve(result);
    },
  );
});

const updateLastDoneDateTimeOnRepeaterByRepeaterId = (repeaterId, dateTime) => new Promise((resolve, reject) => {
  db.transaction(
    (tx) => {
      tx.executeSql(
        'update repeaters set lastDoneDateTime = ? where id = ?',
        [dateTime, repeaterId],
        (_, { rows: { _array } }) => {
          console.log(`updateLastDoneDateTimeOnRepeaterByRepeaterId: _array is ${JSON.stringify(_array, null, 1)}`);
        },
      );
    },
    // transaction failure callback
    (e) => {
      console.log(`updateLastDoneDateTimeOnRepeaterByRepeaterId encountered an error -> ${e}`);
      reject(false);
    },
    // transaction success callback
    () => {
      console.log(`updateLastDoneDateTimeOnRepeaterByRepeaterId: lastDoneDateTime for repeater id:${repeaterId} successfully updated.`);
      resolve(true);
    },
  );
});

const updateEndDateTimeOnRepeaterByRepeaterId = (repeaterId, dateTime) => new Promise((resolve, reject) => {
  db.transaction(
    (tx) => {
      tx.executeSql(
        'update repeaters set enddate = ? where id = ?',
        [dateTime, repeaterId],
        (_, { rows: { _array } }) => {
          console.log(`updateEndDateTimeOnRepeaterByRepeaterId: _array is ${JSON.stringify(_array, null, 1)}`);
        },
      );
    },
    // transaction failure callback
    (e) => {
      console.log(`updateEndDateTimeOnRepeaterByRepeaterId encountered an error -> ${e}`);
      reject(false);
    },
    // transaction success callback
    () => {
      console.log(`updateEndDateTimeOnRepeaterByRepeaterId: lastDoneDateTime for repeater id:${repeaterId} successfully updated.`);
      resolve(true);
    },
  );
});

const updatePlanDescriptionByPlanId = (planId, descriptionText) => new Promise((resolve, reject) => {
  db.transaction(
    (tx) => {
      tx.executeSql(
        'update plans set description = ? where id = ?',
        [descriptionText, planId],
        (_, { rows: { _array } }) => {
          console.log(`updatePlanDescriptionByPlanId: _array is ${JSON.stringify(_array, null, 1)}`);
        },
      );
    },
    // transaction failure callback
    (e) => {
      console.log(`updatePlanDescriptionByPlanId encountered an error -> ${e}`);
      reject(false);
    },
    // transaction success callback
    () => {
      console.log(`updatePlanDescriptionByPlanId: description for plan id:${planId} successfully updated.`);
      resolve(true);
    },
  );
});

const updatePlanDoneByPlanId = (planId, isDone) => new Promise((resolve, reject) => {
  db.transaction(
    (tx) => {
      tx.executeSql(
        'update plans set done = ? where id = ?',
        [isDone, planId],
        (_, { rows: { _array } }) => {
          console.log(`updatePlanDoneByPlanId: _array is ${JSON.stringify(_array, null, 1)}`);
        },
      );
    },
    // transaction failure callback
    (e) => {
      console.log(`updatePlanDoneByPlanId encountered an error -> ${e}`);
      reject(false);
    },
    // transaction success callback
    () => {
      console.log(`updatePlanDoneByPlanId: done for plan id:${planId} successfully updated.`);
      resolve(true);
    },
  );
});

const udpateRepeaterCalEvent = (repeaterId, startTime, endTime, dayOfTheWeek, dayOfTheMonth, shouldShowInCalendar) => new Promise ((resolve, reject) => {
  db.transaction(
    (tx) => {
      tx.executeSql(
        'update repeaters set calstarttime = ?, calendtime = ?, calday = ?, caldate = ?, shouldshowincalendar = ? where id = ?',
        [startTime, endTime, dayOfTheWeek, dayOfTheMonth, shouldShowInCalendar, repeaterId],
        (_, { rows: { _array } }) => {
          console.log(`udpateRepeaterCalEvent: _array is ${JSON.stringify(_array, null, 1)}`);
        },
      );
    },
    // transaction failure callback
    (e) => {
      console.log(`udpateRepeaterCalEvent encountered an error -> ${e}`);
      reject(false);
    },
    // transaction success callback
    () => {
      console.log(`udpateRepeaterCalEvent: done for repeater id:${repeaterId} successfully updated.`);
      resolve(true);
    },
  );
});

const getAllRepeatersThatShouldBeInCalendar = () => new Promise((resolve, reject) => {
  let result;
  db.readTransaction(
    (tx) => {
      tx.executeSql(
        'select * from repeaters where shouldshowincalendar = 1;',
        [],
        (_, { rows: { _array } }) => {
          console.log(`getAllRepeatersThatShouldBeInCalendar: _array is ${JSON.stringify(_array, null, 1)}`);
          result = _array;
        },
      );
    },
    (e) => {
      console.log(`getAllRepeatersThatShouldBeInCalendar encountered an error -> ${e}`);
      reject(e);
    },
    () => resolve(result),
  );
});

const getNumberOfUsesForImage = (imageBackgroundUri) => new Promise((resolve, reject) => {
  let result;
  db.readTransaction(
    (tx) => {
      tx.executeSql(
        'select count(id) from tobeitems where imageBackgroundUri = ?;',
        [imageBackgroundUri],
        (_, { rows: { _array } }) => {
          console.log(`getNumberOfUsesForImage: _array is ${JSON.stringify(_array, null, 1)}`);
          result = _array[0]['count(id)'];
        },
      );
    },
    (e) => {
      console.log(`getNumberOfUsesForImage encountered an error -> ${e}`);
      reject(e);
    },
    () => resolve(result),
  );
});

export {
  setUpDatabase,
  setUpTables,
  deleteToBeItemById,
  addToBeItem,
  getToBeItemById,
  getAllToBeItems,
  getPreviousToBeItemIdById,
  getNextToBeItemIdById,
  getAllPlansByToBeId,
  addPlan,
  deletePlanItemById,
  addCalEvent,
  getAllCalEvents,
  getCalEventById,
  getCalEventNotificationByCalEventId,
  addNotificationToCalEvent,
  removeNotificationFromCalEvent,
  addNotificationToRepeater,
  removeNotificationFromRepeaterByRepeaterId,
  getAllCalEventsWithPlanDetails,
  getCalEventWithPlanDetailsByCalEventId,
  getRepeaterEventWithPlanDetailsByRepeaterId,
  addRepeater,
  getRepeatersByToBeIdAndPeriodicity,
  getAllRepeatersByToBeId,
  deleteRepeaterByPlanId,
  getPlansWithRepeaterPeriodicityByToBeId,
  getAllPlansWithRepeatersAndCalEventsByToBeId as getAllPlansWithRepeatersByToBeId,
  updateLastDoneDateTimeOnRepeaterByRepeaterId,
  updateEndDateTimeOnRepeaterByRepeaterId,
  updatePlanDescriptionByPlanId,
  deleteCalEventById,
  updatePlanDoneByPlanId,
  udpateRepeaterCalEvent,
  getAllRepeatersThatShouldBeInCalendar,
  getAllRepeaterEventsWithPlanDetails,
  getNumberOfUsesForImage,
};
