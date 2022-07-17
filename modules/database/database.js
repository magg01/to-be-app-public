import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase("tobedb")
db.transaction(
  (tx) => {
    //reset the table on each reload
    tx.executeSql("drop table if exists tobeitems;");
    tx.executeSql(        
    "create table if not exists tobeitems (id integer primary key not null, done int, title text, imageBackgroundUri text);"
    );
  },
  (e) => console.log(`deleteToBeItem encountered an error -> ${e}`),
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

const getToBeItemById = (id) => {
  db.readTransaction(
    (tx) => {
      tx.executeSql("select from tobeitems where id=?", [id]);
    },
    (e) => console.log(`getToBeItem encountered an error -> ${e}`),
    () => console.log(`getToBeItem: item with id:${id} successfully read from tobeitems table`)
  )
}

const getFirstToBeItem = () => {
  db.readTransaction(
    (tx) => {
      tx.executeSql("select * from tobeitems limit=1");
    },
    (e) => console.log(`getFirstToBeItem encountered an error -> ${e}`),
    () => console.log('getFirstToBeItem: successfully read from tobeitems table')
  )
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

const deleteToBeItem = (id) => {
  db.transaction(
    (tx) => {
      tx.executeSql("delete from tobeitems where id=?", [id]);
      tx.executeSql("select * from tobeitems", [], (_, { rows: {_array} }) =>{
      console.log(JSON.stringify(_array));
      })
    },
    (e) => console.log(`deleteToBeItem encountered an error -> ${e}`),
    () => console.log(`deleteToBeItem: item with id:${id} successfully deleted from tobeitems table`)
  )
}

export { deleteToBeItem, addToBeItem, getToBeItemById, getAllToBeItems}