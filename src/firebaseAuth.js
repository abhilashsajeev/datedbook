import { db } from './firebase';

var localStorage = window.localStorage;

function isLocalDataPresent(){
    return localStorage.getItem("userData") !== null
}

function getLocalStorageData(loginData){
    if(isLocalDataPresent()){
       return JSON.parse(localStorage.getItem("userData"))
    }
    return null
}
function clearLocalData(){
    if(isLocalDataPresent()){
        localStorage.clear();
    }
}
function isLocalDataExpired(){
    var userData = getLocalStorageData() 
    if(userData!== null){
        var currentDay = new Date()
        var diff = userData.expiry - currentDay.getTime() 

        return diff <= 0;
    }
}

function saveLocalData(user){
    var expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 7);
    user.expiry = expiryDate.getTime();
    localStorage.setItem("userData", JSON.stringify(user));
    
}

const firebaseAuth = {
    
    isAuthenticated:false,
    user:{},
    authenticate(loginData , cb){
      
      var self = this;
      const userRef = db.collection("users");
      const query = userRef.where("name", "==", loginData.username)
      return query.where("password", "==", loginData.password).get()
      .then((data)=>{
        data.forEach((doc)=> {
            self.user = doc.data()
        })
        self.isAuthenticated = true
        saveLocalData(self.user);
        
      }).catch((error) => {
        console.log("Error getting documents: ", error);
    });
      
    },
    checkLoggedIn(){
        var userData = getLocalStorageData() 
        if(userData !== null && !isLocalDataExpired()){
            this.user = userData;
            this.isAuthenticated = true
        } else {
          this.user = {};
          this.isAuthenticated = false
        }

    },
    signout(){
      this.isAuthenticated = false;
      this.user = {};
      clearLocalData();
    }
}

export default firebaseAuth;