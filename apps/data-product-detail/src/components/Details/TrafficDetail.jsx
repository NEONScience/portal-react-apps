import React from 'react';
// import React, { useContext } from 'react';

import { makeStyles } from '@material-ui/core/styles';

import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';

import Theme from 'portal-core-components/lib/components/Theme';

import Detail from './Detail';

// import { StoreContext } from '../../Store';

const useStyles = makeStyles(theme => ({
  paper: {
    marginTop: theme.spacing(1.5),
  },
}));

const TrafficDetail = () => {
  // const { state } = useContext(StoreContext);
  const classes = useStyles(Theme);

  const views = (10928).toLocaleString();
  const downloads = (2879).toLocaleString();

  return (
    <Detail
      title="Traffic"
    >
      <Paper className={classes.paper}>
        <Table size="small">
          <TableBody>
            <TableRow>
              <TableCell>
                Views
              </TableCell>
              <TableCell>
                {views}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>
                Downloads
              </TableCell>
              <TableCell>
                {downloads}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </Paper>
    </Detail>
  );
};

export default TrafficDetail;
