// create variable to hold db connection
let db;
// establish a connection to IndexedDB database called 'BudgetDB' and set it to version 1
const request = indexedDB.open('BudgetDB', 1);

// this event will emit if the database version changes 
request.onupgradeneeded = function(event) {
    // save a reference to the database 
    db = event.target.result;
    // create an object store (table) called `budgetdb`, set it to have an auto incrementing primary key of sorts 
    const BudgetStore = db.createObjectStore('BudgetDB', {
        autoIncrement: true,
      });
    };

      // upon a successful 
    request.onsuccess = function (event) {
            // when db is successfully created with its object store (from onupgradedneeded event above) or simply established a connection, save result to db in global variable
        db = event.target.result;
      
            // check if app is online, if yes run uploadTransaction() function to send all local db data to api       
        if (navigator.onLine) {
          checkDatabase();
        }
      };

      request.onerror = function (event) {
        console.log(event.target.errorCode);
      };

      // This function will be executed if we attempt to submit a new transaction and there's no internet connection
      // index.js 139
      function saveRecord(record) {
              // open a new transaction with the database with read and write permissions 
        const transaction = db.transaction(['BudgetDB'], 'readwrite');
            // access the object store for `budgetdb`
        const BudgetStore = transaction.objectStore('BudgetDB');
            // add record to your store with add method
        BudgetStore.add(record);
      }

      function checkDatabase() {
        let transaction = db.transaction(['BudgetDB'], 'readwrite');
        const BudgetStore = transaction.objectStore('BudgetDB');
            // get all records from store and set to a variable
        var getAll = BudgetStore.getAll();
      
        // run this after getAll
        getAll.onsuccess = function () {
        // if there was data in indexedDb's store, let's send it to the api server
          if (getAll.result.length > 0) {
            fetch('/api/transaction/bulk', {
              method: 'POST',
              body: JSON.stringify(getAll.result),
              headers: {
                Accept: 'application/json, text/plain, */*',
                'Content-Type': 'application/json',
              },
            })
              .then((response) => response.json())
              .then((data) => {
                if (data.length > 0) {
                // open one more transaction
                  transaction = db.transaction(['BudgetDB'], 'readwrite');
             // access the new_transaction object store
                  const newStore = transaction.objectStore('BudgetDB');
                  // clear all items in your store
                  newStore.clear();
                }
              });
          }
        };
      }

      // listen for app coming back online
      window.addEventListener('online', checkDatabase);
