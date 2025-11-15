 //   Function to get Location. Returns a promise that resolves into {lat, long}
      function getLocation() {
        // Create a new promise
        let locationPromise = new Promise((resolve, reject) => {
          // Access the current position of the user:
          navigator.geolocation.getCurrentPosition((pos) => {
            // Grab the lat and long
            let long = pos.coords.longitude;
            let lat = pos.coords.latitude;
            // If you can get those values: resolve with an object or reject if not
            resolve({ lat, long });
          }, reject);
        });
        //   return the promise
        return locationPromise;
      }


// Write your code here:
