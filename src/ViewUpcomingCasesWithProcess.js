import React from 'react';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import { withStyles } from '@material-ui/core/styles';
import moment from "moment"
import { db } from './firebase';
import firebaseAuth from "./firebaseAuth";
import Drawer from '@material-ui/core/Drawer';
import Paper from '@material-ui/core/Paper';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import SyncIcon from '@material-ui/icons/Sync';
import SearchIcon from '@material-ui/icons/Search';
import BookmarksIcon from '@material-ui/icons/Bookmarks';
import axios from 'axios'
import {Table, TableContainer, TableBody, TableCell, TableHead, TableRow} from '@material-ui/core'
import CircularProgress from '@material-ui/core/CircularProgress'
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import InputLabel from "@material-ui/core/InputLabel";
import Box from '@material-ui/core/Box';
import {
    Redirect,
    Link
} from "react-router-dom";
import { Divider } from '@material-ui/core';



const getFormattedDate = (date) => {

    if (date) {
        return moment.unix(date.seconds).format("DD-MM-YYYY");
    }

    return;

}


function CaseTable(props) {
    return (
        <TableContainer component={Paper}>
        <Box mb={10} >

            <Table aria-label="simple table" >
                <TableHead>
                    <TableRow>
                        <TableCell>Sl.No</TableCell>
                        <TableCell align="right">Case No</TableCell>
                        <TableCell align="right">Posting Date</TableCell>
                        <TableCell align="center">Is Posting date Flexible</TableCell>

                    </TableRow>
                </TableHead>
                <TableBody>

                    {props.cases.map((row, index) => (
                            <TableRow key={row.caseNo}>
                            <TableCell component="th" scope="row">
                                {index + 1}
                            </TableCell>
                            <TableCell align="right">{row.caseNo}</TableCell>
                            <TableCell align="right">{getFormattedDate(row.postingDate)}</TableCell>
                            <TableCell align="center">{row.isDateFlexible? 'Yes': "No"}</TableCell>
                        </TableRow>
                        )
                    )}
                

                </TableBody>
            </Table>
        </Box>
        </TableContainer>

    )
}



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

function getTommorrowsDate() {
    return moment().add(1, "days").format("YYYY-MM-DD");
}

class ViewUpcomingCasesWithProcess extends React.Component {

    constructor(props) {

        super(props)
        this.unsubscribe = {}
        this.state = {
            selectedDate: getTommorrowsDate(),
            cases: [],
            isDrawerOpen: false,
            isLoggedOut: false,
            loading: false,
            selectedSeat: 'a_seat'
        }
        this.setSelectedDate = this.setSelectedDate.bind(this);
        this.toggleDrawer = this.toggleDrawer.bind(this);
        this.handleSeatSelect = this.handleSeatSelect.bind(this);
        this.hanldeSignOut = this.hanldeSignOut.bind(this);

    }

    handleSync = () => {
        this.setState({open:true})    
        axios.get("https://api-process.glitch.me/sync/" + this.state.selectedSeat).then(()=>{
            console.log("Syncing process")
        }).catch(()=>{
            console.log("Error in Syncing")
        })
        
    }

    hanldeSignOut() {
        firebaseAuth.signout();
        this.setState({ isLoggedOut: true })

    }
    toggleDrawer(status) {
        this.setState({ isDrawerOpen: !this.state.isDrawerOpen })
    }

    componentDidMount() {
        this.setSelectedDate(getTommorrowsDate());
    }

    componentWillUnmount(){
        this.unsubscribe();
    }
        
    
    

    handleSeatSelect(event){
        this.setState({ cases:[]})
        this.setSelectedDate(false , event.target.value);

    }
    setSelectedDate(date, seat) {
        seat = seat || this.state.selectedSeat;
        date = date || this.state.selectedDate;
        var posting_date = new Date(date)
        posting_date.setHours(0, 0, 0, 0)
        var seatRef = db.collection(seat).where("postingDate", ">=", posting_date);
        this.setState({loading:true})
        this.unsubscribe = seatRef.onSnapshot((querySnapshot) => {
                var cases = []
                querySnapshot.forEach((doc) => {
                    // doc.data() is never undefined for query doc snapshots
                    var caseObj = doc.data();
                    caseObj.docId = doc.id;
                    if(caseObj.isProcessReceived){
                        console.log("Checking case Obj", caseObj)
                        cases.push(caseObj);
                    }
                });

                this.setState({ cases: cases, loading: false, selectedSeat: seat })

            })

        this.setState({ selectedDate: date, loading: true })
    }

    render() {
        const { classes } = this.props;
        var seatName = firebaseAuth.isAuthenticated ? firebaseAuth.user.seatName : '';
        var { isLoggedOut } = this.state

        if (isLoggedOut) {
            return (<Redirect to="/login" />)
        }
        const PostingBookLink = props => <Link to={"/"} {...props} />;
        const SearchLink = props => <Link to={"/Search"} {...props} />;

        return (
            <div>
                <AppBar position="static">
                    <Toolbar>
                        <IconButton edge="start" className={classes.menuButton} color="inherit" aria-label="menu">
                            <MenuIcon onClick={this.toggleDrawer} />
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
                        <ListItem button component={SearchLink}>
                            <ListItemIcon><SearchIcon /></ListItemIcon>
                            <ListItemText primary={"Search Case"} />
                        </ListItem>
                        <ListItem button component={PostingBookLink}>
                            <ListItemIcon><BookmarksIcon /></ListItemIcon>
                            <ListItemText primary={"Posting Book "} />
                        </ListItem>
                        <ListItem button onClick={this.handleSync}>
                            <ListItemIcon><SyncIcon/></ListItemIcon>
                            <ListItemText primary={"Sync Process"} />
                        </ListItem>
                        <Divider />
                        <ListItem button onClick={this.hanldeSignOut} >
                            <ListItemIcon><ExitToAppIcon /></ListItemIcon>
                            <ListItemText primary={"Sign out"} />
                        </ListItem>

                    </List>

                </Drawer>
                {this.state.loading && <CircularProgress  color="secondary" />}
                List of Upcoming cases with Process    
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
                
                <CaseTable cases= {this.state.cases} />

            </div>

        )
    }
}


export default withStyles(styles)(ViewUpcomingCasesWithProcess)