import './App.css';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect
} from "react-router-dom";
import DatedList from "./DatedList"
import Login from "./Login"
import ViewNotPostedCases from "./ViewNotPostedCases"
import firebaseAuth from "./firebaseAuth"
import ViewUpcomingCasesWithProcess from "./ViewUpcomingCasesWithProcess";
import SearchPostingHistory from "./SearchPostingHistory";

function App() {

  
  return (
    <Router>
      <div className="App">
      <Switch>
          <PrivateRoute exact path="/">
            <DatedList  />
          </PrivateRoute>
          <PrivateRoute path="/notposted">
            <ViewNotPostedCases />
          </PrivateRoute>
          <PrivateRoute path="/view-cases-with-process">
            <ViewUpcomingCasesWithProcess />
          </PrivateRoute>
          <PrivateRoute path="/search">
            <SearchPostingHistory />
          </PrivateRoute>
          <Route path="/login">
            <Login />
          </Route>
          
        </Switch>
      </div>

    </Router>

  );
}

function PrivateRoute({children, ...rest}){
  
  return (
    <Route {...rest} render={()=>{
      return firebaseAuth.isAuthenticated === true?
      {...children}  : <Redirect to="/login"/>
    }}>
      
    </Route>
  )

}

export default App;
