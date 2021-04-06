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
import BookmarksIcon from '@material-ui/icons/Bookmarks';
import AccessTimeIcon from '@material-ui/icons/AccessTime';
import {Table, TableContainer, TableBody, TableCell, TableHead, TableRow} from '@material-ui/core'
import CircularProgress from '@material-ui/core/CircularProgress'
import Box from '@material-ui/core/Box';
import Snackbar from '@material-ui/core/Snackbar';
import TextField from '@material-ui/core/TextField';
import files from "./files";
import { Link } from 'react-router-dom';
import { Divider } from '@material-ui/core';
import SearchIcon from '@material-ui/icons/Search';
import FormatListBulletedIcon from '@material-ui/icons/FormatListBulleted';

import {
    Redirect
} from "react-router-dom";


const getFormattedDate = (date) => {

    if (date) {
        return moment.unix(date.seconds).format("DD-MM-YYYY");
    }

    return;

}


function getSeatMap(seat){
    var seatObj = {
        'A': 'a_seat',
        'B': 'b_seat',
        'C': 'c_seat',
        'D': 'd_seat',
        'E': 'e_seat',
        'F': 'f_seat',
    }
    return seatObj[seat]

}

function isValidYear(year){
    var d = new Date();
    var currentYear = d.getFullYear();
    if(year){
        year = parseInt(year);
        return year >=2003 && year <= currentYear
    } else {
        return false
    }
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
                            <TableRow key={index}>
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


class SearchPostingHistory extends React.Component {

    constructor(props) {

        super(props)
        this.unsubscribe = {}
        this.state = {
            cases: [],
            caseNo:'',
            isDrawerOpen: false,
            isLoggedOut: false,
            loading: false,
            openSnackBar:false,
        }

    }

    handleSnackBarClose = ()=>{
        this.setState({openSnackBar:false})
    }

    hanldeSignOut = () => {
        firebaseAuth.signout();
        this.setState({ isLoggedOut: true })

    }
    toggleDrawer = (status) => {
        this.setState({ isDrawerOpen: !this.state.isDrawerOpen })
    }


    
    handleChange = (event) => {
        this.setState({caseNo: event.target.value})

    }

    searchHistory = () => {
        this.setState({loading:true})
        var num = this.state.caseNo.split("/")[0];
        var year =  this.state.caseNo.split("/")[1];
        if(isValidYear(year)){
            const fileList = files.files;
            var seat = fileList[year][num];
            if(seat){
                var seatName = getSeatMap(seat)
                db.collection(seatName).where("caseNo", "==", this.state.caseNo).get().then((querySnapshot)=>{
                    var cases = [];
                    if(querySnapshot.empty){
                        this.setState({openSnackBar:true, loading:false})
                    } else {
                        querySnapshot.forEach((doc)=>{
                            cases.push(doc.data())

                        })
                        this.setState({cases:cases, loading:false})    
                    }
                    

                })
            }
        } else {
            this.setState({loading:false})
        }

    }


    render() {
        const { classes } = this.props;
        var seatName = firebaseAuth.isAuthenticated ? firebaseAuth.user.seatName : '';
        var { isLoggedOut } = this.state

        if (isLoggedOut) {
            return (<Redirect to="/login" />)
        }
        const NotPostedLink = props => <Link to={"/notposted"} {...props} />;
        const PostingBookLink = props => <Link to={"/"} {...props} />;
        const UpComingCasesWithProcessLink = props => <Link to={"/view-cases-with-process"} {...props} />;

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

                        <ListItem button component={PostingBookLink}>
                            <ListItemIcon><BookmarksIcon /></ListItemIcon>
                            <ListItemText primary={"Posting Book "} />
                        </ListItem>
                        <ListItem button component={UpComingCasesWithProcessLink}>
                            <ListItemIcon><FormatListBulletedIcon/></ListItemIcon>
                            <ListItemText primary={"View UpComing Cases With Process"} />
                        </ListItem>
                        <ListItem button component={NotPostedLink}>
                            <ListItemIcon><AccessTimeIcon /></ListItemIcon>
                            <ListItemText primary={"View Not Posted Cases "} />
                        </ListItem>
                        <Divider />


                        <ListItem button onClick={this.hanldeSignOut} >
                            <ListItemIcon><ExitToAppIcon /></ListItemIcon>
                            <ListItemText primary={"Sign out"} />
                        </ListItem>


                    </List>

                </Drawer>
                <h3> Posting History </h3>
                {this.state.loading && <CircularProgress  color="secondary" />}
                
                
                
                <Box mt={3}>
                    <TextField value={this.state.caseNo} onChange={this.handleChange} label="Enter Case No" />
                    <IconButton edge="start" onClick={this.searchHistory}
                        className={classes.menuButton} color="inherit" aria-label="menu">
                        <SearchIcon />
                    </IconButton>
                </Box>
                
                
                {this.state.cases.length>0 && <CaseTable cases= {this.state.cases} /> }

                <Snackbar 
                    anchorOrigin= {{vertical:"bottom", horizontal:"center"}}
      
        
                message="Posting History Not found."
                open={this.state.openSnackBar} autoHideDuration={4000} onClose={this.handleSnackBarClose}>
                    
                </Snackbar>



            </div>

        )
    }
}


export default withStyles(styles)(SearchPostingHistory)