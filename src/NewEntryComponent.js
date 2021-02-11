import React from 'react';
import Dialog from '@material-ui/core/Dialog';
import Button from '@material-ui/core/Button';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import TextField from "@material-ui/core/TextField"
import { Alert, AlertTitle } from '@material-ui/lab';
import Fab from '@material-ui/core/Fab';
import AddIcon from '@material-ui/icons/Add';
import Checkbox from '@material-ui/core/Checkbox';
import FormControlLabel from "@material-ui/core/FormControlLabel"
import { db } from './firebase';
import files from "./files"
import moment from "moment";
import LinearProgress from "@material-ui/core/LinearProgress"

const style = {
    margin: 0,
    top: 'auto',
    right: 20,
    bottom: 56,
    left: 'auto',
    position: 'fixed',
};

var defaultDate = moment().add(1, "days").format('YYYY-MM-DD');
class NewEntryComponent extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            caseNo: '',
            isDateFlexible: false,
            postingDate: defaultDate,
            isPosted: false,
            open: false,
            alert:false,
            alertMessage: '',
            loading:false

        }
        this.handleClick = this.handleClick.bind(this)
        
        this.handleDialogChange = this.handleDialogChange.bind(this)
        this.handleDialogClose = this.handleDialogClose.bind(this)
        this.handleCheckBox = this.handleCheckBox.bind(this)
        this.handleNewData = this.handleNewData.bind(this)
        this.isSeatMatching = this.isSeatMatching.bind(this);
        this.isValidYear =this.isValidYear.bind(this);
        this.isCaseAlreadyPresent = this.isCaseAlreadyPresent.bind(this);
    }
    isSeatMatching(caseNo) {
        var num = caseNo.split("/")[0];
        var year = caseNo.split("/")[1];
        const fileList = files.files;
        var seat = fileList[year][num];
        const seatObject = {
            "A": "a_seat",
            "B": "b_seat",
            "C": "c_seat",
            "D": "d_seat",
            "E": "e_seat",
            "F": "f_seat"
        } 

        return seatObject[seat] === this.props.seat
    }

    isValidYear(caseNo){
        var d = new Date();
        var currentYear = d.getFullYear();
        var year = parseInt(caseNo.split("/")[1]);
        return year >=2003 && year <= currentYear ;
    }

    handleClick() {
        this.setState({ open: true })
    }
    handleDialogClose() {
        this.setState({
            caseNo: '',
            isDateFlexible: false,
            open: false,
            alert: false,
            alertMessage: '',
            loading:false

        })
    }
    isCaseAlreadyPresent(postingDate){
        var caseRef = db.collection(this.props.seat)
        caseRef = caseRef.where("postingDate", "==", postingDate)
        return caseRef.where("caseNo", "==", this.state.caseNo).get()
        

    }
    handleNewData() {
        this.setState({loading:true})
        if(!this.isValidYear(this.state.caseNo)){
            this.setState({alert: true,loading:false, alertMessage: "The Year you Entered is Invalid"})
        } else if(!this.isSeatMatching(this.state.caseNo)){
            this.setState({alert: true, loading:false, alertMessage: "Case does not belong to your seat"})
         

        }else {
            const caseRef = db.collection(this.props.seat)
            var timestamp = new Date(this.state.postingDate);
            timestamp.setHours(0,0,0,0);
            var caseObject = {
                caseNo: this.state.caseNo,
                postingDate: timestamp,
                isPosted: false,
                isProcessReceived:false,
                isDateFlexible: this.state.isDateFlexible,
            }
            this.isCaseAlreadyPresent(timestamp).then((querySnapshot)=>{
                if(querySnapshot.empty){
                    caseRef.add(caseObject).then(()=>{
                        this.handleDialogClose();
                    }).catch(error => {
                        console.log("Error in sendign notice")
                        this.setState({alert:true, loading:false, alertMessage: "Network failure"})
                    });
                } else {
                    this.setState({alert: true, loading:false,
                            alertMessage: "Case already exists for posting on same date "})
                }
            })

            
            
            
        }
        
    }
    handleCheckBox(event) {
        this.setState({ isDateFlexible: event.target.checked })

    }
    handleDialogChange(event) {
        var obj = {

        }
        obj[event.target.id] = event.target.value;
        this.setState(obj)

    }
    render() {
        
        
        return (
            <React.Fragment>
                <Fab style={style} color="secondary" aria-label="add">
                    <AddIcon onClick={this.handleClick}> Add New Case </AddIcon>
                </Fab>
                <Dialog open={this.state.open} onClose={this.handleClose} aria-labelledby="form-dialog-title">
                    <DialogTitle id="form-dialog-title">Enter new Case to post</DialogTitle>
                    {this.state.loading && <LinearProgress  color="secondary" />}
                    <DialogContent disabled={this.state.loading}>
                        
                        <TextField
                            id="caseNo"
                            label="Case No"
                            fullWidth={true}
                            InputLabelProps={{
                                shrink: true,
                            }}
                            required
                            onChange={this.handleDialogChange}
                            value={this.state.caseNo}
                        />
                        <br />
                        <TextField
                            id="postingDate"
                            required
                            label="Posting Date"
                            InputLabelProps={{
                                shrink: true,
                            }}
                            min={defaultDate}
                            InputProps={{inputProps: { min: defaultDate} }}
                            type="date"
                            defaultValue={this.state.postingDate}
                            fullWidth={true}
                            onChange={this.handleDialogChange}
                        /> <br />
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={this.state.isDateFlexible}
                                    onChange={this.handleCheckBox}
                                    color="primary"
                                />
                            }
                            label="Is the date flexible"
                        />
                        <br />
                        {this.state.alert && <Alert severity="error">
                            <AlertTitle>Error</AlertTitle>
                            {this.state.alertMessage} <strong>- check it out!</strong>
                        </Alert>}
                    </DialogContent>
                    <DialogActions disabled={this.state.loading}>
                        <Button onClick={this.handleDialogClose} color="primary">
                            Cancel
                        </Button>
                        <Button  onClick={this.handleNewData} color="primary">
                            Save
                        </Button>
                    </DialogActions>
                </Dialog>

            </React.Fragment>
        )
    }


}

export default NewEntryComponent;