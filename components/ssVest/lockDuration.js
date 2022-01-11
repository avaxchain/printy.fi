import React, { useState, useEffect } from 'react';
import { Grid, Typography, Button, TextField, CircularProgress, RadioGroup, Radio, FormControlLabel, InputAdornment } from '@material-ui/core';
import moment from 'moment';
import classes from "./ssVest.module.css";
import stores from '../../stores'
import {
  ACTIONS
} from '../../stores/constants';

export default function ffLockDuration({ govToken, veToken }) {

  const [ lockLoading, setLockLoading ] = useState(false)

  const [selectedDate, setSelectedDate] = useState(moment().add(8, 'days').format('YYYY-MM-DD'));
  const [selectedDateError, setSelectedDateError] = useState(false);
  const [selectedValue, setSelectedValue] = useState('week');

  useEffect(() => {
    const lockReturned = () => {
      setLockLoading(false)
    }
    const errorReturned = () => {
      setLockLoading(false)
    }

    stores.emitter.on(ACTIONS.ERROR, errorReturned);
    stores.emitter.on(ACTIONS.FIXED_FOREX_DURATION_VESTED, lockReturned);
    return () => {
      stores.emitter.removeListener(ACTIONS.ERROR, errorReturned);
      stores.emitter.removeListener(ACTIONS.FIXED_FOREX_DURATION_VESTED, lockReturned);
    };
  }, []);

  useEffect(() => {
    if(veToken && veToken.vestingInfo && veToken.vestingInfo.lockEnds) {
      setSelectedDate(moment.unix(veToken.vestingInfo.lockEnds).format('YYYY-MM-DD'))
      setSelectedValue(null)
    }
  }, [ veToken ])

  const handleDateChange = (event) => {
    setSelectedDate(event.target.value);
    setSelectedValue(null);
  }

  const handleChange = (event) => {
    setSelectedValue(event.target.value);

    let days = 0;
    switch (event.target.value) {
      case 'week':
        days = 8;
        break;
      case 'month':
        days = 30;
        break;
      case 'year':
        days = 365;
        break;
      case 'years':
        days = 1461;
        break;
      default:
    }
    const newDate = moment().add(days, 'days').format('YYYY-MM-DD');

    setSelectedDate(newDate);
  }

  const onLock = () => {
    setLockLoading(true)

    const selectedDateUnix = moment(selectedDate).unix()
    stores.dispatcher.dispatch({ type: ACTIONS.FIXED_FOREX_VEST_DURATION, content: { unlockTime: selectedDateUnix } })
  }


  const renderMassiveInput = (type, amountValue, amountError, amountChanged, balance, logo) => {
    return (
      <div className={ classes.textField}>
        <div className={ `${classes.massiveInputContainer} ${ (amountError) && classes.error }` }>
          <div className={ classes.massiveInputAssetSelect }>
            <div className={ classes.displaySelectContainer }>
              <div className={ classes.assetSelectMenuItem }>
                <div className={ classes.displayDualIconContainer }>
                  {
                    logo &&
                    <img
                      className={ classes.displayAssetIcon }
                      alt=""
                      src={ logo }
                      height='100px'
                      onError={(e)=>{e.target.onerror = null; e.target.src="/tokens/unknown-logo.png"}}
                    />
                  }
                  {
                    !logo &&
                    <img
                      className={ classes.displayAssetIcon }
                      alt=""
                      src={ '/tokens/unknown-logo.png' }
                      height='100px'
                      onError={(e)=>{e.target.onerror = null; e.target.src="/tokens/unknown-logo.png"}}
                    />
                  }
                </div>
              </div>
            </div>
          </div>
          <div className={ classes.massiveInputAmount }>
            <TextField
              type="date"
              placeholder='Expiry Date'
              fullWidth
              error={ amountError }
              helperText={ amountError }
              value={ amountValue }
              onChange={ amountChanged }
              disabled={ lockLoading }
              InputProps={{
                className: classes.largeInput,
                shrink: true
              }}
            />
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className={ classes.inputsContainer3 }>
        { renderMassiveInput('lockDuration', selectedDate, selectedDateError, handleDateChange, null, null) }
        <div className={classes.textField}>
          <div className={ classes.inline }>
            <Typography className={ classes.expiresIn }>Expires in </Typography>
            <RadioGroup className={classes.vestPeriodToggle} row aria-label="position" name="position" onChange={handleChange} value={selectedValue}>
              <FormControlLabel value="week" control={<Radio color="primary" />} label="1 week" labelPlacement="left" />
              <FormControlLabel value="month" control={<Radio color="primary" />} label="1 month" labelPlacement="left" />
              <FormControlLabel value="year" control={<Radio color="primary" />} label="1 year" labelPlacement="left" />
              <FormControlLabel value="years" control={<Radio color="primary" />} label="4 years" labelPlacement="left" />
            </RadioGroup>
          </div>
        </div>
      </div>
      <div className={ classes.actionsContainer3 }>
        <Button
          className={classes.actionBtn}
          variant='contained'
          size='large'
          color='primary'
          disabled={ lockLoading }
          onClick={ onLock }
          >
          <Typography className={ classes.actionButtonText }>{ lockLoading ? `Increasing Duration` : `Increase Duration` }</Typography>
          { lockLoading && <CircularProgress size={10} className={ classes.loadingCircle } /> }
        </Button>
      </div>
    </>
  );
}