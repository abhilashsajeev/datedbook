import React from 'react';
import { makeStyles, withStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import Button from '@material-ui/core/Button';
import CardContent from '@material-ui/core/CardContent';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Checkbox from '@material-ui/core/Checkbox';
import Grid from '@material-ui/core/Grid'
import {db} from "./firebase"
import { Alert } from '@material-ui/lab';
import Snackbar from '@material-ui/core/Snackbar';
import CircularProgress from '@material-ui/core/CircularProgress';
import firebaseAuth from './firebaseAuth'
import IconButton from '@material-ui/core/IconButton';
import DeleteIcon from '@material-ui/icons/Delete';
import {Dialog, DialogTitle, DialogContent, DialogActions, DialogContentText} from '@material-ui/core';

const useStyles = makeStyles({
  root: {
    minWidth: 275,
  },
  bullet: {
    display: 'inline-block',
    margin: '0 2px',
    transform: 'scale(0.8)',
  },

  title: {
    fontSize: 14,
  },
  pos: {
    marginBottom: 12,
  },
});

const styles = theme => ({
  listItemText:{
    fontSize:'1.3em',//Insert your required size
  }
});





function isSo(){
  return firebaseAuth.user.name === "so"
}

function DeleteConFirmationDialog(props){
  return (
  <Dialog
        open={props.open}
        onClose={props.handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{"Delete Entry"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Do you want to delete this Case from Posting book?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={props.handleClose} color="primary">
            Cancel
          </Button>
          <Button onClick={props.handleItemDelete} color="primary" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    )
}



class CaseList extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      isPosted: props.case.isPosted,
      openDeleteDialog: false
    }
    this.handleToggle = this.handleToggle.bind(this);
    this.openDeleteConfirmation = this.openDeleteConfirmation.bind(this);
    this.handleClose = this.handleClose.bind(this);
    this.handleItemDelete = this.handleItemDelete.bind(this);
  }


  handleToggle(event) {
    var checked = event.target.checked;
    var caseData = this.props.case
    
      db.collection(this.props.seat).doc(caseData.docId).update({
        isPosted: checked
      }).then(()=>{
        if(checked){
          this.props.handleSnackBar();
        }
        this.setState({ isPosted: checked })
      })
    
  }
  openDeleteConfirmation(){
    this.setState({openDeleteDialog: true})
  }
  handleItemDelete(){

    var caseData = this.props.case
    db.collection(this.props.seat).doc(caseData.docId).delete().then(()=>{
        
        this.setState({ openDeleteDialog: false })
      }).catch(()=>{
        console.log("Error in deleteing");
      })
    
  }
  handleClose(){
    this.setState({openDeleteDialog:false})
  }
  render() {
    var props = this.props;
    var {classes} = this.props;
    var caseText = props.index  + '. ' + props.case.caseNo
    if(!props.case.isDateFlexible){
      caseText += "*"
    }
    return (
      <React.Fragment>
        <ListItem key={props.index} button>
          <ListItemText  classes={{primary:classes.listItemText}}
            style={{ textDecoration : props.case.isPosted ? 'line-through' : 'none' ,
              color: props.case.isProcessReceived?'crimson': 'black'
            }}  
            primary={caseText} />
          
            {!isSo() && <Checkbox
              edge="end"
              onChange={this.handleToggle}
              checked={props.case.isPosted}
            />}
            
          
          
          {!isSo() && <IconButton style={{marginLeft: '15px'}}onClick = {this.openDeleteConfirmation} edge="end" aria-label="delete">
                      <DeleteIcon />
                    </IconButton>}
            <DeleteConFirmationDialog handleClose={this.handleClose} handleItemDelete={this.handleItemDelete} 
              open={this.state.openDeleteDialog} />
          
        </ListItem>

      </React.Fragment>

    )
  }
}

CaseList = withStyles(styles)(CaseList)

function ListCaseComponent(props) {
  const classes = useStyles();
  const [open, setOpen] = React.useState(false);

  const handleClick = () => {
    setOpen(true);
  };

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    setOpen(false);
  };
  return (
    <div>
      <Card className={classes.root} variant="outlined">
        <CardContent>
          <h3>List of cases</h3>
          <Grid
            container
            spacing={0}
            direction="column"
            alignItems="center"
            justify="center"
            style={{ minHeight: '10vh' }}
          >
            <Grid item xs={11} sm={10} md={8} lg={10}>
              {props.loading && <CircularProgress  color="secondary" />}
              <List dense>
                {props.cases.map((d, i) => <CaseList key={i} handleSnackBar={handleClick}
                  seat={props.seat} index={i + 1} case={d} />)}
              </List>
            </Grid>
          </Grid>


        </CardContent>
      </Card>

      <Snackbar open={open} autoHideDuration={5000} onClose={handleClose}>
        <Alert onClose={handleClose} severity="success">
          Case Posted Successfully !
        </Alert>
      </Snackbar>
    </div>
  )
}

export default ListCaseComponent;