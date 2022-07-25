import * as SQLite from 'expo-sqlite';
const DEBUG = false;

const db = SQLite.openDatabase("tobedb")

// default setting for sqlite is that foreign key constraints are not enforced. So we need to turn the constraint enforcement on manually.
db.exec([{ sql: 'PRAGMA foreign_keys = ON;', args: [] }], false, () =>
  console.log('Foreign keys turned on')
);

if (DEBUG) {
  // reset the tables on each reload
  db.transaction(
    (tx) => {
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
      "create table if not exists tobeitems (id integer primary key not null, done int, title text, imageBackgroundUri text);"
    );
    tx.executeSql(
      "create table if not exists plans (id integer primary key not null, done int, title text, tobeitem integer not null, FOREIGN KEY(tobeitem) REFERENCES tobeitems(id) on delete cascade);"
    )
  },
  (e) => console.log(`setUpTables encountered an error -> ${e}`),
  () => console.log("setUpTables: success")
);

const addToBeItem = (title, imageBackgroundUri) => {
  db.transaction(
    (tx) => {
      tx.executeSql("insert into tobeitems (done, title, imageBackgroundUri) values (0, ?, ?)", [title, imageBackgroundUri]);
      tx.executeSql("select * from tobeitems", [], (_, { rows: {_array} }) =>{
        console.log(JSON.stringify(_array,null, 1));
      })
    },
    (e) => console.log(`addToBeItem encountered an error -> ${e}`),
    () => console.log(`addToBeItem: item with title:${title} successfully added to tobeitems table`)
  );
};

const addPlan = (title, tobeitem) => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql("insert into plans (done, title, tobeitem) values (0, ?, ?)", [title, tobeitem]);
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
      (e) => {
        console.log(`getAllPlansByToBeId encountered an error -> ${e}`)
        reject(false);
      },
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
  deletePlanItemById
}