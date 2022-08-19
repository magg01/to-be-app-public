import * as SQLite from 'expo-sqlite';
const DEBUG = false;

const db = SQLite.openDatabase("tobedb","0.0.3");


//go through all methods and move error reporting and final promise resolve to the TRANSACTION success callback

// default setting for sqlite is that foreign key constraints are not enforced. So we need to turn the constraint enforcement on manually.
db.exec([{ sql: 'PRAGMA foreign_keys = ON;', args: [] }], false, () =>
  console.log('Foreign keys turned on')
);

if (DEBUG) {
  // reset the tables on each reload
  db.transaction(
    (tx) => {
      tx.executeSql(
        "drop table if exists calevents"
      );
      tx.executeSql(
        "drop table if exists plans"
      );
      tx.executeSql(
        "drop table if exists tobeitems"
      );
    }
  )
}

db.transaction(
  (tx) => {    
    tx.executeSql(        
      "create table if not exists tobeitems (id integer primary key not null, done int, title text, imageBackgroundUri text, tintColor text);"
    );
    tx.executeSql(
      "create table if not exists plans (id integer primary key not null, done int, title text, tobeitem integer not null, FOREIGN KEY(tobeitem) REFERENCES tobeitems(id) on delete cascade);"
    );
    tx.executeSql(
      "create table if not exists calevents (id integer primary key not null, eventdate string, eventstarttime string, eventendtime string, eventnotification string, planitem integer not null, FOREIGN KEY(planitem) REFERENCES plans(id) on delete cascade);"
    );
  },
  (e) => console.log(`setUpTables encountered an error -> ${e}`),
  () => console.log("setUpTables: success")
);

const addToBeItem = (title, imageBackgroundUri, tintColor) => {
  db.transaction(
    (tx) => {
      tx.executeSql("insert into tobeitems (done, title, imageBackgroundUri, tintColor) values (0, ?, ?, ?)", [title, imageBackgroundUri, tintColor]);
    },
    (e) => console.log(`addToBeItem encountered an error -> ${e}`),
    () => console.log(`addToBeItem: item with title:${title} successfully added to tobeitems table`),
  );
};

const addPlan = (title, tobeitem, calEvent) => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          "insert into plans (done, title, tobeitem) values (0, ?, ?)", 
          [title, tobeitem],
          (tx, newPlan) => {
            if(calEvent){
              tx.executeSql(
                "insert into calevents (eventdate, eventstarttime, eventendtime, planitem) values (?, ?, ?, ?)", [calEvent.date, calEvent.start, calEvent.end, newPlan.insertId]
              );
            }
          }
        );
      },
      (e) => {
        console.log(`addPlan encountered an error -> ${e}`);
        reject(false);
      },
      () => {
        console.log(`addPlan: item with title:${title} successfully added to plans table`);
        resolve(true);
      }
    );
  })
};

const addCalEvent = (date, startTime, endTime, planItem) => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql("insert into calevents (eventdate, eventstarttime, eventendtime, planitem) values (?, ?, ?, ?)", [date, startTime, endTime, planItem]);
      },
      (e) => {
        console.log(`addCalEvent encountered an error -> ${e}`);
        reject(false);
      },
      () => {
        console.log(`addCalEvent: item with date:${date} successfully added to calevents table`);
        resolve(true);
      }
    );
  })
};


const getToBeItemById = (id) => {
  return new Promise((resolve, reject) => {
    let result;
    db.readTransaction(
      (tx) => {
        tx.executeSql(
          "select * from tobeitems where id=?", 
          [id], 
          (_, { rows: {_array} }) =>{
            console.log(`getToBeItemById: _array is ${JSON.stringify(_array,null, 1)}`)
            result = _array[0];
          },
        )
      },
      (e) => {
        console.log(`getToBeItemById encountered an error -> ${e}`)
        reject(e);
      },
      () => resolve(result)
    )
  })
}

const getPreviousToBeItemIdById = (id) => {
  return new Promise((resolve, reject) => {
    let result;
    db.readTransaction(
      (tx) => {
        tx.executeSql(
          "select * from tobeitems where id < ? order by id desc limit 1", 
          [id],
          (_, { rows: {_array} }) =>{
            console.log(`getPreviousToBeItemIdById: _array is ${JSON.stringify(_array,null, 1)}`)
            if(_array.length === 0){
              getLastToBeItem().then((lastToBeItem) => {
                result = lastToBeItem.id
                console.log(`getPreviousToBeItemIdById: result = ${result}`)
                resolve(result);
              })
            } else {
              result = _array[0].id;
              console.log(`getPreviousToBeItemIdById: result = ${result}`)
              resolve(result);
            }
          },
          // (_, { rows: {_array} }) =>{
          //   console.log(`getPreviousToBeItemIdById: _array is ${JSON.stringify(_array,null, 1)}`)
          //   result = _array[0].id;
          //   console.log(`getPreviousToBeItemIdById: result = ${result}`)
          // },
        )
      },
      (e) => {
        console.log(`getPreviousToBeItemIdById encountered an error -> ${e}`)
        reject(e);
      },
      console.log("getPreviousToBeItemIdById transaction success")
    )
  })
}

const getCalEventWithPlanDetailsByCalEventId = (calEventId) => {
  return new Promise((resolve, reject) => {
    let result;
    db.readTransaction(
      (tx) => {
        tx.executeSql(
          "SELECT C.id, C.eventdate, C.eventstarttime, C.eventendtime, C.eventnotification, P.title as plan_title, T.title as tobeitem_title, T.imageBackgroundUri from calevents C left join plans P ON C.planitem = P.id left join tobeitems T ON P.tobeitem = T.id where c.id = ?;",
          [calEventId],
          (_, { rows: {_array} }) => {
            console.log(`getCalEventWithPlanDetailsByCalEventId: _array is ${JSON.stringify(_array,null, 1)}`)
            result = _array[0];
          },
        )
      },
      (e) => {
        console.log(`getCalEventWithPlanDetailsByCalEventId encountered an error -> ${e}`)
        reject(e)
      },
      () => resolve(result)
    )
  })
}

const getNextToBeItemIdById = (id) => {
  return new Promise((resolve, reject) => {
    let result;
    db.readTransaction(
      (tx) => {
        tx.executeSql(
          "select * from tobeitems where id > ? order by id limit 1", 
          [id], 
          (_, { rows: {_array} }) =>{
            console.log(`getNextToBeItemIdById: _array is ${JSON.stringify(_array,null, 1)}`)
            if(_array.length === 0){
              getFirstToBeItem().then((firstToBeItem) => {
                result = firstToBeItem.id
                console.log(`getNextToBeItemIdById: result = ${result}`)
                resolve(result);
              })
            } else {
              result = _array[0].id;
              console.log(`getNextToBeItemIdById: result = ${result}`)
              resolve(result);
            }
          },
        )
      },
      (e) => {
        console.log(`getNextToBeItemIdById encountered an error -> ${e}`)
        reject(e);
      },
      console.log("getNextToBeItemIdById transaction success")
    )
  })
}

const getFirstToBeItem = () => {
  return new Promise((resolve, reject) => {
    let result;
    db.readTransaction(
      (tx) => {
        tx.executeSql(
          "select * from tobeitems order by id limit 1",
          [],
          (_, { rows: {_array} }) => {
            result = _array[0]
            console.log(`getFirstToBeItem: result = ${JSON.stringify(result, null, 1)}`)
          }
        )
      },
      (e) => {
        console.log(`getFirstToBeItem encountered an error -> ${e}`)
        reject(e);
      },
      () => resolve(result)  
    )
  })
}

const getLastToBeItem = () => {
  return new Promise((resolve, reject) => {
    let result;
    db.readTransaction(
      (tx) => {
        tx.executeSql(
          "select * from tobeitems order by id desc limit 1",
          [],
          (_, { rows: {_array} }) => {
            result = _array[0]
            console.log(`getLastToBeItem: result = ${JSON.stringify(result, null, 1)}`)
          }
        )
      },
      (e) => {
        console.log(`getLastToBeItem encountered an error -> ${e}`)
        reject(e);
      },
      () => resolve(result)  
    )
  })
}

const getAllToBeItems = () => {
  return new Promise((resolve, reject) => {
    let result;
    db.readTransaction(
      (tx) => {
        tx.executeSql(
          "select * from tobeitems", 
          [], 
          (_, { rows: {_array} }) =>{
            console.log(`getAllToBeItems: _array is ${JSON.stringify(_array,null, 1)}`)
            result = _array;
          },
        )
      },
      (e) => {
        console.log(`getAllToBeItems encountered an error -> ${e}`)
        reject(e);
      },
      () => resolve(result)
    )
  })
}

const getAllCalEvents = () => {
  return new Promise((resolve, reject) => {
    let result;
    db.readTransaction(
      (tx) => {
        tx.executeSql(
          "select * from calevents", 
          [], 
          (_, { rows: {_array} }) =>{
            console.log(`getAllCalEvents: _array is ${JSON.stringify(_array,null, 1)}`)
            result = _array;
          },
        )
      },
      (e) => {
        console.log(`getAllCalEvents encountered an error -> ${e}`)
        reject(e);
      },
      () => resolve(result)
    )
  })
}

const getCalEventById = (id) => {
  return new Promise((resolve, reject) => {
    let result;
    db.readTransaction(
      (tx) => {
        tx.executeSql(
          "select * from calevents where id=?", 
          [id], 
          (_, { rows: {_array} }) =>{
            console.log(`getCalEventById: _array is ${JSON.stringify(_array,null, 1)}`);
            result = _array[0];
          },
        )
      },
      (e) => {
        console.log(`getCalEventById encountered an error -> ${e}`);
        reject(e);
      },
      () => resolve(result)
    )
  })
}

const deleteToBeItemById = (id) => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql("delete from tobeitems where id=?", [id]);
      },
      (e) => {
        console.log(`deleteToBeItem encountered an error -> ${e}`)
        reject(false);
      },
      () => {
        console.log(`deleteToBeItem: item with id:${id} successfully deleted from tobeitems table`);
        resolve(true);
      }
    )
  })
}

const deletePlanItemById = (id) => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql("delete from plans where id=?", [id]);
      },
      (e) => {
        console.log(`deletePlanItemById encountered an error -> ${e}`)
        reject(false);
      },
      () => {
        console.log(`deletePlanItemById: item with id:${id} successfully deleted from plans table`);
        resolve(true);
      }
    )
  })
}

const getCalEventNotificationByCalEventId = (calEventId) => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          "SELECT eventnotification from calevents where id = ?", [calEventId],
          [id], 
          (_, { rows: {_array} }) => {
            console.log(`getCalEventNotificationById: _array is ${JSON.stringify(_array,null, 1)}`);
            result = _array[0];
          },
        )
      },
      (e) => {
        console.log(`getCalEventNotificationById encountered an error -> ${e}`);
        reject(e);
      },
      () => {
        console.log(`getCalEventNotificationById: successfully retreieved from calevent with id=${calEventId}`)
        resolve(result);
      }
    )
  })
}

const addNotificationToCalEvent = (calEventId, notificationIdentifier) => {
  return new Promise((resolve, reject) => {
    let result;
    db.transaction(
      (tx) => {
        tx.executeSql(
          "UPDATE calevents set eventnotification = ? WHERE id = ?", 
          [notificationIdentifier, calEventId]
        );
      },
      (e) => {
        console.log(`addNotificationToCalEvent encountered an error -> ${e}`);
        reject(e);
      },
      () => {
        console.log(`addNotificationToCalEvent: notification with identifier ${notificationIdentifier} successfully added to calevent with id=${calEventId}`)
        resolve(result);
      }
    )
  })
}

const removeNotificationFromCalEvent = (calEventId) => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql("UPDATE calevents set eventnotification = null WHERE id = ?", [calEventId]);
      },
      (e) => {
        console.log(`removeNotificationFromCalEvent encountered an error -> ${e}`);
        reject(e);
      },
      () => {
        console.log(`removeNotificationFromCalEvent: calevent with id=${calEventId} eventnotification successfully set to null`);
        resolve(true);
      }
    )
  })
}

const getAllPlansByToBeId = (id) => {
  return new Promise((resolve, reject) => {
    let result;
    db.transaction(
      (tx) => {
        tx.executeSql(
          "select * from plans where tobeitem = ?", 
          [id], 
          (_, { rows: {_array} }) =>{
            console.log(`getAllPlansByToBeId: _array is ${JSON.stringify(_array, null, 1)}`)
            result = _array;
          }
        );
      },
      //transaction failure callback
      (e) => {
        console.log(`getAllPlansByToBeId encountered an error -> ${e}`)
        reject(false);
      },
      //transaction success callback
      () => {
        console.log(`getAllPlansByToBeId: plans for tobeitem id:${id} successfully retreived from plans table`);
        resolve(result);
      }
    )
  })
}

export { 
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
  getCalEventWithPlanDetailsByCalEventId,
}