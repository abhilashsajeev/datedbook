import React from 'react';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import { withStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import moment from "moment"
import ListCaseComponent from "./ListCaseComponent";
import { db } from './firebase';
import NewEntryComponent from "./NewEntryComponent";
import firebaseAuth from "./firebaseAuth";
import Drawer from '@material-ui/core/Drawer';
import ArrowForwardIcon from '@material-ui/icons/ArrowForward';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import AccessTimeIcon from '@material-ui/icons/AccessTime';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import InputLabel from "@material-ui/core/InputLabel";
import SearchIcon from '@material-ui/icons/Search';
import FormatListBulletedIcon from '@material-ui/icons/FormatListBulleted';

import {
    Redirect,
    Link
} from "react-router-dom";
import { Divider } from '@material-ui/core';




const styles = theme => ({
    root: {
        flexGrow: 1,
    },
    extendedIcon: {
        marginRight: theme.spacing(2),
    },
    menuButton: {
        marginRight: theme.spacing(2),
    },
    title: {
        flexGrow: 1,
    },
})

function getTomorrowsDate() {
    return moment().add(1, "days").format("YYYY-MM-DD");
}

function isSo(){
    return firebaseAuth.user.name === "so"
}
class DatedList extends React.Component {

    constructor(props) {

        super(props)
        this.unsubscribe = () => { };
        this.state = {
            selectedDate: getTomorrowsDate(),
            cases: [],
            isDrawerOpen: false,
            isLoggedOut: false,
            loading: false,
            selectedSeat: 'a_seat'
        }
        this.setSelectedDate = this.setSelectedDate.bind(this);
        this.handleDateChange = this.handleDateChange.bind(this);
        this.toggleDrawer = this.toggleDrawer.bind(this);
        this.increaseDate = this.increaseDate.bind(this);
        this.decreaseDate = this.decreaseDate.bind(this);
        this.hanldeSignOut = this.hanldeSignOut.bind(this);
        this.handleSeatSelect =this.handleSeatSelect.bind(this);
        this.getSeatIfLoggedInAsSo = this.getSeatIfLoggedInAsSo.bind(this);

    }
    getSeatIfLoggedInAsSo(){
        var seat = firebaseAuth.isAuthenticated ? firebaseAuth.user.name : '';
        
        seat = isSo() ? this.state.selectedSeat : seat;
        return seat;
    
    }
    
    hanldeSignOut() {
        firebaseAuth.signout();
        this.setState({ isLoggedOut: true })

    }
    toggleDrawer(status) {
        this.setState({ isDrawerOpen: !this.state.isDrawerOpen })
    }

    componentDidMount() {
        this.setSelectedDate(getTomorrowsDate());
    }
    componentWillUnmount() {
        this.unsubscribe();
        console.log("Un Mounting")
    }

    setSelectedDate(newDate, seat) {
        var date = newDate || this.state.selectedDate;
        seat = seat || this.getSeatIfLoggedInAsSo();
        
        var seatRef = db.collection(seat);
        var posting_date = new Date(date);
        posting_date.setHours(0, 0, 0, 0)

        this.unsubscribe = seatRef.where("postingDate", "==", posting_date)
            .onSnapshot((querySnapshot) => {
                var cases = []
                querySnapshot.forEach((doc) => {
                    // doc.data() is never undefined for query doc snapshots
                    var caseObj = doc.data();
                    caseObj.docId = doc.id;
                    cases.push(caseObj);
                });

                this.setState({ cases: cases, loading: false, selectedSeat: seat })

            })

        this.setState({ selectedDate: date, loading: true })
    }
    handleSeatSelect(event){
        this.setState({ cases:[]})
        this.setSelectedDate(false , event.target.value);

    }
    handleDateChange(event) {
        this.setSelectedDate(event.target.value);
    };
    increaseDate() {
        var newdate = moment(this.state.selectedDate).add(1, "days").format("YYYY-MM-DD")
        this.setSelectedDate(newdate)
    }
    decreaseDate() {
        var newdate = moment(this.state.selectedDate).subtract(1, "days").format("YYYY-MM-DD")
        this.setSelectedDate(newdate)
    }
    render() {
        const { classes } = this.props;
        var seat = this.getSeatIfLoggedInAsSo()
        var seatName = firebaseAuth.isAuthenticated ? firebaseAuth.user.seatName : '';
        var { isLoggedOut } = this.state
        const CustomLink = props => <Link to={"/notposted"} {...props} />;
        const SearchLink = props => <Link to={"/Search"} {...props} />;
        const UpComingCasesWithProcessLink = props => <Link to={"/view-cases-with-process"} {...props} />;

        if (isLoggedOut) {
            return (<Redirect to="/login" />)
        }

        return (
            <div>
                <AppBar position="static">
                    <Toolbar>
                        <IconButton edge="start" onClick={this.toggleDrawer} className={classes.menuButton} color="inherit" aria-label="menu">
                            <MenuIcon  />
                        </IconButton>
                        <Typography variant="h6" className={classes.title}>
                            Digital Posting Book - MACA
                    </Typography>
                        <Button color="inherit" align="left">{seatName}</Button>
                    </Toolbar>


                </AppBar>
                <Drawer anchor="left"
                    open={this.state.isDrawerOpen} onClose={this.toggleDrawer} >
                    <List>
                        <ListItem button component={CustomLink}>
                            <ListItemIcon><AccessTimeIcon /></ListItemIcon>
                            <ListItemText primary={"View Not Posted Cases "} />
                        </ListItem>
                        <ListItem button component={SearchLink}>
                            <ListItemIcon><SearchIcon /></ListItemIcon>
                            <ListItemText primary={"Search Case"} />
                        </ListItem>
                        <ListItem button component={UpComingCasesWithProcessLink}>
                            <ListItemIcon><FormatListBulletedIcon/></ListItemIcon>
                            <ListItemText primary={"View UpComing Cases With Process"} />
                        </ListItem>
                        <Divider />
                        <ListItem button onClick={this.hanldeSignOut} >
                            <ListItemIcon><ExitToAppIcon /></ListItemIcon>
                            <ListItemText primary={"Sign out"} />
                        </ListItem>

                    </List>

                </Drawer>
                <IconButton edge="start" onClick={this.decreaseDate}
                     className={classes.menuButton} color="inherit" aria-label="menu">
                    <ArrowBackIcon  fontSize="large" />
                </IconButton>
                <TextField
                    id="date"
                    label="Posting date"
                    type="date"
                    onChange={this.handleDateChange}
                    InputLabelProps={{
                        shrink: true,
                    }}
                    value={this.state.selectedDate}
                />
                <IconButton edge="end" onClick={this.increaseDate} className={classes.menuButton} color="inherit" aria-label="menu">
                    <ArrowForwardIcon  fontSize="large" style={{ marginLeft: '15px' }} />
                </IconButton>

                {isSo() && <div>
                    <InputLabel >Select Seat</InputLabel>
                    <Select onChange={this.handleSeatSelect} name={"Select Seat"}
                        value={this.state.selectedSeat}
                    >
                        <MenuItem value={"a_seat"}>A Seat</MenuItem>
                        <MenuItem value={"b_seat"}>B Seat</MenuItem>
                        <MenuItem value={"c_seat"}>C Seat</MenuItem>
                        <MenuItem value={"d_seat"}>D Seat</MenuItem>
                        <MenuItem value={"e_seat"}>E Seat</MenuItem>
                        <MenuItem value={"f_seat"}>F Seat</MenuItem>
                        
                    </Select>
                </div>}
                <ListCaseComponent loading={this.state.loading} seat={seat} cases={this.state.cases}></ListCaseComponent>
                {!isSo() && <NewEntryComponent seat={seat} />}
            </div>

        )
    }
}


export default withStyles(styles)(DatedList)