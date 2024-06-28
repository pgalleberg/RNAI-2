import React, { useState } from 'react'
import { useEffect } from 'react';
import { useParams } from 'react-router-dom';

//API hooks
import { useFetchAuthors } from '../../services/peopleServices/useFetchAuthor'
import { useFetchInventors } from '../../services/peopleServices/useFetchInventors';

//components import
import AuthorCard from '../../components/AuthorCard';
import InventorCard from '../../components/InventorCard';

//MUI imports
import { Box, CircularProgress, Grid, Stack, Tab, Tabs } from '@mui/material';

function TabPanel(props) {
    const { children, value, index, ...other } = props;
  
    return (
      <div
        role="tabpanel"
        hidden={value !== index}
        id={`simple-tabpanel-${index}`}
        aria-labelledby={`simple-tab-${index}`}
        {...other}
      >
        {value === index && <Box p={3}>{children}</Box>}
      </div>
    );
  }

  function a11yProps(index) {
    return {
      id: `simple-tab-${index}`,
      'aria-controls': `simple-tabpanel-${index}`,
    };
  }

const Index = () => {
    const { vertical_id } = useParams();
    const {data: inventorsData, isError, isFetching} = useFetchInventors(vertical_id);
    const {data: authorsData, isError:isAuthorError, isFetching:isAuthorFetching} = useFetchAuthors(vertical_id);

    const [tab, setTab] = useState(0);

    const handleChange = (event, newValue) => {
      setTab(newValue);
    };
  

  return (
    <Box>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs onChange={handleChange} aria-label="lab API tabs example">
            <Tab label="Author"  {...a11yProps(0)} />
            <Tab label="Inventors"  {...a11yProps(1)} />
          </Tabs>
        </Box>
        <TabPanel value={tab} index={0}>
            <Stack alignItems={'center'} py={4}>
              {isFetching && <CircularProgress />}
            </Stack>
            <Grid container justifyContent={'space-around'} rowSpacing={5} spacing={5}>
                {authorsData?.length > 0 && authorsData?.map((author, index) => (
                    <Grid item xs={6} md={4}>
                     <AuthorCard key={author.id} details={author}/>
                    </Grid>
                ))}
            </Grid>
        </TabPanel>
        <TabPanel value={tab} index={1}>
            <Stack alignItems={'center'} py={4}>
                {isAuthorFetching && <CircularProgress />}
            </Stack>
            <Grid container justifyContent={'space-around'} rowSpacing={5} spacing={5}>
              {inventorsData?.length > 0 && inventorsData.map((inventor, index) => (
                  <Grid item xs={6} md={4}>
                    <InventorCard key={inventor.id} details={inventor}/>
                  </Grid>
              ))}
            </Grid>
        </TabPanel>
    </Box>
  )
}

export default Index