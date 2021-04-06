import React from "react"
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import { withStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import CardContent from '@material-ui/core/CardContent';
import Grid from '@material-ui/core/Grid'
import firebaseAuth from "./firebaseAuth";


import {
    Redirect
  } from "react-router-dom";



const styles = theme => ({
    root: {
        flexGrow: 1,
    },
    card: {
        maxWidth: 800,
    },
    extendedIcon: {
        marginRight: theme.spacing(2),
    },
    menuButton: {
        marginRight: theme.spacing(2),
    },
    button:{
        marginTop: 10
    },
    title: {
        flexGrow: 1,
    },
})


class Login extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            username: '',
            password: '',
            redirectToReferrer: false,
        }
        
    }

    componentDidMount(){
        firebaseAuth.checkLoggedIn();
        
        if(firebaseAuth.isAuthenticated){
            this.setRedirectToReferer();
        }
    }

    handleChange = (event) => {
        var obj = {}
        obj[event.target.id] = event.target.value;
        this.setState(obj);
    }
    handleLogin = () => {
        if(this.state.username !== '' && this.state.password !== ''){
            var loginData = {
                username: this.state.username,
                password:this.state.password
            }
            firebaseAuth.authenticate(loginData).then(()=>{
                this.setRedirectToReferer();
            })
        }
        
    }
    setRedirectToReferer = ()=> {
        this.setState({redirectToReferrer:true})
    }
    render() {

        const { classes } = this.props;
        if(this.state.redirectToReferrer){
            if(firebaseAuth.user.name === "addl"){
                return (
                    <Redirect to="/view-cases-with-process" />
                    )
            }
            return (
                <Redirect to="/" />
            )
        }
        return (
            <div>
                <AppBar position="static">
                    <Toolbar>
                        <Typography variant="h6" className={classes.title}>
                            Digital Posting Book - MACA
                        </Typography>

                    </Toolbar>


                </AppBar>
                <Grid
                    container
                    spacing={0}
                    direction="column"
                    alignItems="center"
                    justify="center"
                    style={{ minHeight: '60vh' }}
                >
                    <Grid item xs={11} sm={10} md={8} lg={10}>
                        <Card className={classes.card}>
                            <CardHeader title="Login"></CardHeader>
                            <CardContent>
                                <TextField
                                    id="username"
                                    label="User Name"
                                    fullWidth={true}
                                    InputLabelProps={{
                                        shrink: true,
                                    }}
                                    required
                                    onChange={this.handleChange}
                                    value={this.state.username}
                                />
                                <TextField
                                    id="password"
                                    label="Password"
                                    type="password"
                                    fullWidth={true}
                                    InputLabelProps={{
                                        shrink: true,
                                    }}
                                    required
                                    onChange={this.handleChange}
                                    value={this.state.password}
                                />
                                <br/>
                                <Button className={classes.button} onClick={this.handleLogin}
                                    variant="contained" color="primary" disableElevation>Login</Button>

                            </CardContent>

                        </Card>
                    </Grid>

                </Grid>
            </div>
        )
    }

}

export default withStyles(styles)(Login)