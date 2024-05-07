import * as React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTrashCan } from '@fortawesome/free-solid-svg-icons'

export default function AlertDialog({ id, action, dialogTitle, dialogContentText }) {
  const [open, setOpen] = React.useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <React.Fragment>
      <FontAwesomeIcon icon={faTrashCan} size="sm" style={{color: '#e14141', cursor: 'pointer'}}  onClick={handleClickOpen}/>
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {dialogTitle}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            {dialogContentText}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button sx={{color: '#10a37f'}} onClick={handleClose}>Cancel</Button>
          <Button sx={{color: '#10a37f'}} onClick={() => action(id)} autoFocus>
            Proceed
          </Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
}