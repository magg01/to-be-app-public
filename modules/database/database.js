import * as SQLite from 'expo-sqlite';

const setUpDatabase = () => {
  const db = SQLite.openDatabase("tobedb");
  setUpTables(db);
  return db;
} 

const setUpTables = (db) => {
  db.transaction(
    (tx) => {
      //reset the table on each reload
      tx.executeSql("drop table if exists tobeitems;");
      tx.executeSql(        
      "create table if not exists tobeitems (id integer primary key not null, done int, title text);"
      );
    },
    (e) => console.log(`deleteToBeItem encountered an error -> ${e}`),
    () => console.log("setUpTables: success")
  );
};

const addToBeItem = (db, title) => {
  db.transaction(
    (tx) => {
      tx.executeSql("insert into tobeitems (done, title) values (0, ?)", [title]);
      tx.executeSql("select * from tobeitems", [], (_, { rows: {_array} }) =>{
        console.log(JSON.stringify(_array));
        setTobes(_array);
      })
    },
    (e) => console.log(`addToBeItem encountered an error -> ${e}`),
    () => console.log(`addToBeItem: item with id:${id} successfully added to tobeitems table`)
  );
};

const getToBeItem = (db, id) => {
  db.readTransaction(
    (tx) => {
      tx.executeSql("select from tobeitems where id=?", [id]);
    },
    (e) => console.log(`getToBeItem encountered an error -> ${e}`),
    () => console.log(`getToBeItem: item with id:${id} successfully read from tobeitems table`)
  )
}

const deleteToBeItem = (db, id) => {
  db.transaction(
    (tx) => {
      tx.executeSql("delete from tobeitems where id=?", [id]);
      tx.executeSql("select * from tobeitems", [], (_, { rows: {_array} }) =>{
      console.log(JSON.stringify(_array));
      setTobes(_array);
      })
    },
    (e) => console.log(`deleteToBeItem encountered an error -> ${e}`),
    () => console.log(`deleteToBeItem: item with id:${id} successfully deleted from tobeitems table`)
  )
}

export {setUpDatabase, deleteToBeItem, addToBeItem, getToBeItem}