let db;
// create a new "budget" database.
const request = window.indexedDB.open("budget", 1);

request.onupgradeneeded = function(event) {
   // create the object variable for out indexDB store named "pending" 
  const db = event.target.result;
  db.createObjectStore("pending", { autoIncrement: true });
};

request.onsuccess = function(event) {
  db = event.target.result;


};

request.onerror = function(event) {
  console.log("argggg - something wrong - undefined! " + event.target.errorCode);
};

function saveRecord(record) {
    console.log('saveRecord');
    
  // give access to add read & write to the indexDB
  const transaction = db.transaction(["pending"], "readwrite");

  // access your pending object store
  const store = transaction.objectStore("pending");

  // add record to your store using the add method.
  store.add(record);
  console.log("added a record here");
}

function checkDatabase() {
  // to open a transactions on your "pending" object store
  const transaction = db.transaction(["pending"], "readwrite");
  // access your pending object store
  const store = transaction.objectStore("pending");
  // get all records from store and set to a variable
  const getAll = store.getAll();

  console.log('getAll: ', getAll);

  getAll.onsuccess = function() {
    if (getAll.result.length > 0) {
      fetch("/api/transaction/bulk", {
        method: "POST",
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json"
        }
      })
      .then(response => response.json())
      .then(() => {
        // if successful, open a transaction on your pending db
        const transaction = db.transaction(["pending"], "readwrite");

        // access the pending object store
        const store = transaction.objectStore("pending");
        console.log("about to clear here")
        // clear all items in your store - remove so that I can see the data in the 
        // browser in the indexDB section in chrome Dev Tools > application in the pending 
        // if left in - its always clearing
        //
        store.clear();
      });
    }
  };
}

// event listner for the app when its back online
window.addEventListener("online", checkDatabase);