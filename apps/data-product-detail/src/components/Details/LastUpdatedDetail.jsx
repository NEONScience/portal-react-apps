import React from 'react';

import { makeStyles } from '@material-ui/core/styles';

import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';

import Theme from 'portal-core-components/lib/components/Theme';

import Detail from './Detail';
import DetailTooltip from './DetailTooltip';

const useStyles = makeStyles((theme) => ({
  paper: {
    marginTop: theme.spacing(1.5),
  },
}));

const LastUpdatedDetail = () => {
  const classes = useStyles(Theme);

  const dataDate = 'April 10, 2019';
  const metadataDate = 'April 20, 2019';

  return (
    <Detail
      title="Last Updated"
    >
      <Paper className={classes.paper}>
        <Table size="small">
          <TableBody>
            <TableRow>
              <TableCell>
                Data
                <DetailTooltip tooltip="..." />
              </TableCell>
              <TableCell>
                {dataDate}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>
                Metadata
                <DetailTooltip tooltip="..." />
              </TableCell>
              <TableCell>
                {metadataDate}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </Paper>
    </Detail>
  );
};

export default LastUpdatedDetail;
